package com.eduvision.service.impl;

import com.eduvision.dto.request.CreateComplaintRequest;
import com.eduvision.dto.request.UpdateComplaintStatusRequest;
import com.eduvision.dto.response.ComplaintDetailResponse;
import com.eduvision.dto.response.ComplaintSummaryResponse;
import com.eduvision.dto.response.StatusHistoryResponse;
import com.eduvision.entity.*;
import com.eduvision.exception.BadRequestException;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.exception.UnauthorizedException;
import com.eduvision.repository.*;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.ComplaintService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIMELINE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    public ComplaintServiceImpl(ComplaintRepository complaintRepository,
                                InstitutionRepository institutionRepository,
                                UserRepository userRepository,
                                ComplaintStatusHistoryRepository statusHistoryRepository,
                                NotificationRepository notificationRepository) {
        this.complaintRepository = complaintRepository;
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public ComplaintDetailResponse createComplaint(CreateComplaintRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication required to file a complaint.");
        }

        User complainant = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Complainant user not found."));

        // Lookup or resolve Institution
        Institution institution = null;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId()).orElse(null);
        }
        if (institution == null && request.getInstitutionName() != null) {
            String name = request.getInstitutionName().trim();
            institution = institutionRepository.findByName(name)
                    .orElseGet(() -> {
                        Institution newInst = new Institution();
                        newInst.setName(name);
                        newInst.setCode("INST-GEN-" + System.currentTimeMillis() % 10000);
                        newInst.setType(request.getInstitutionType() != null ? request.getInstitutionType() : "Technical Institution");
                        newInst.setState("India");
                        newInst.setCity("General");
                        return institutionRepository.save(newInst);
                    });
        }

        if (institution == null) {
            throw new BadRequestException("Institution is required.");
        }

        // Generate unique tracking ID: CMP-2026-XXXXXX
        String trackingId = generateUniqueTrackingId();

        Complaint complaint = new Complaint();
        complaint.setTrackingId(trackingId);
        complaint.setComplainant(complainant);
        complaint.setInstitution(institution);
        complaint.setCategory(request.getCategory().trim());
        complaint.setSubject(request.getSubject().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setIncidentDate(request.getIncidentDate() != null ? request.getIncidentDate() : LocalDate.now());
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setDeclarationAccepted(request.getDeclarationAccepted() != null && request.getDeclarationAccepted());

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Record Initial Status History
        ComplaintStatusHistory history = new ComplaintStatusHistory(
                savedComplaint,
                null,
                ComplaintStatus.SUBMITTED.name(),
                complainant,
                "Complaint lodged on EduVision AICTE Portal by " + complainant.getFullName() + "."
        );
        statusHistoryRepository.save(history);

        // Create Notification
        Notification notification = new Notification(
                complainant,
                "Complaint Filed Successfully",
                "Your complaint " + trackingId + " regarding '" + complaint.getSubject() + "' has been lodged.",
                "SUBMISSION",
                savedComplaint
        );
        notificationRepository.save(notification);

        return mapToDetailResponse(savedComplaint, true);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplaintSummaryResponse> getMyComplaints(UserPrincipal currentUser, ComplaintStatus status, String category, String query, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Long userId = (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.AICTE_OFFICER)
                ? null // Admins/Officers see all complaints
                : currentUser.getId();

        Page<Complaint> complaintsPage = complaintRepository.searchComplaints(
                userId,
                status,
                (category != null && !category.isEmpty()) ? category : null,
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                pageRequest
        );

        return complaintsPage.map(this::mapToSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintSummaryResponse> getRecentComplaints(UserPrincipal currentUser) {
        List<Complaint> recent;
        if (currentUser != null && currentUser.getRole() == Role.STUDENT) {
            recent = complaintRepository.findTop5ByComplainantIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            recent = complaintRepository.findTop5ByOrderByCreatedAtDesc();
        }
        return recent.stream().map(this::mapToSummaryResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintByTrackingId(String trackingId, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findByTrackingId(trackingId.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No grievance record found with Tracking ID: " + trackingId));

        boolean isFullAccess = false;
        if (currentUser != null) {
            isFullAccess = currentUser.getRole() == Role.ADMIN ||
                           currentUser.getRole() == Role.AICTE_OFFICER ||
                           complaint.getComplainant().getId().equals(currentUser.getId());
        }

        return mapToDetailResponse(complaint, isFullAccess);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintDetails(Long complaintId, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AICTE_OFFICER) {
            if (!complaint.getComplainant().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this complaint docket.");
            }
        }

        return mapToDetailResponse(complaint, true);
    }

    @Override
    @Transactional
    public ComplaintDetailResponse updateComplaintStatus(Long complaintId, UpdateComplaintStatusRequest request, UserPrincipal currentUser) {
        if (currentUser == null || (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AICTE_OFFICER && currentUser.getRole() != Role.INSTITUTION_HEAD)) {
            throw new UnauthorizedException("Only designated AICTE Officers or Administrators can modify complaint status.");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (newStatus == ComplaintStatus.REJECTED && (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty())) {
            throw new BadRequestException("A mandatory rejection reason is required when rejecting a grievance.");
        }

        User officer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer user not found."));

        complaint.setStatus(newStatus);
        if (request.getResolutionSummary() != null) complaint.setResolutionSummary(request.getResolutionSummary().trim());
        if (request.getRejectionReason() != null) complaint.setRejectionReason(request.getRejectionReason().trim());

        Complaint updatedComplaint = complaintRepository.save(complaint);

        // Record Status History
        ComplaintStatusHistory history = new ComplaintStatusHistory(
                updatedComplaint,
                oldStatus.name(),
                newStatus.name(),
                officer,
                request.getRemarks() != null ? request.getRemarks() : "Status updated to " + newStatus.getDisplayName() + " by " + officer.getFullName()
        );
        statusHistoryRepository.save(history);

        // Notify Complainant
        Notification notification = new Notification(
                updatedComplaint.getComplainant(),
                "Complaint Status Updated: " + newStatus.getDisplayName(),
                "Your grievance " + updatedComplaint.getTrackingId() + " status is now " + newStatus.getDisplayName() + ".",
                "STATUS_UPDATE",
                updatedComplaint
        );
        notificationRepository.save(notification);

        return mapToDetailResponse(updatedComplaint, true);
    }

    private synchronized String generateUniqueTrackingId() {
        int year = LocalDate.now().getYear();
        long count = complaintRepository.count() + 104; // Baseline for demo sequence
        return String.format("CMP-%d-%06d", year, count);
    }

    private ComplaintSummaryResponse mapToSummaryResponse(Complaint complaint) {
        String formattedDate = complaint.getCreatedAt() != null ? complaint.getCreatedAt().format(DISPLAY_DATE_FORMAT) : "";
        return new ComplaintSummaryResponse(
                complaint.getId(),
                complaint.getTrackingId(),
                formattedDate,
                complaint.getInstitution() != null ? complaint.getInstitution().getName() : "Unknown Institution",
                complaint.getCategory(),
                complaint.getStatus(),
                complaint.getStatus().getDisplayName(),
                complaint.getSubject()
        );
    }

    private ComplaintDetailResponse mapToDetailResponse(Complaint complaint, boolean fullAccess) {
        ComplaintDetailResponse res = new ComplaintDetailResponse();
        res.setId(complaint.getId());
        res.setTrackingId(complaint.getTrackingId());
        res.setFormattedDate(complaint.getCreatedAt() != null ? complaint.getCreatedAt().format(DISPLAY_DATE_FORMAT) : "");
        res.setInstitutionName(complaint.getInstitution() != null ? complaint.getInstitution().getName() : "N/A");
        res.setInstitutionType(complaint.getInstitution() != null ? complaint.getInstitution().getType() : "Technical Institution");
        res.setInstitutionState(complaint.getInstitution() != null ? complaint.getInstitution().getState() : "");
        res.setCategory(complaint.getCategory());
        res.setStatus(complaint.getStatus());
        res.setStatusDisplayName(complaint.getStatus().getDisplayName());
        res.setResolutionSummary(complaint.getResolutionSummary());
        res.setRejectionReason(complaint.getRejectionReason());

        if (fullAccess) {
            res.setComplainantName(complaint.getComplainant() != null ? complaint.getComplainant().getFullName() : "Anonymous");
            res.setComplainantEmail(complaint.getComplainant() != null ? complaint.getComplainant().getEmail() : "");
            res.setStakeholderRole(complaint.getComplainant() != null ? complaint.getComplainant().getRole().name() : "STUDENT");
            res.setSubject(complaint.getSubject());
            res.setDescription(complaint.getDescription());
            res.setIncidentDate(complaint.getIncidentDate());
            res.setAssignedOfficerName(complaint.getAssignedOfficer() != null ? complaint.getAssignedOfficer().getFullName() : "AICTE Scrutiny Cell");
        } else {
            // Masked / Safe public tracking view
            res.setSubject("Registered Technical Grievance");
            res.setDescription("Grievance details are restricted to verified stakeholders.");
            res.setComplainantName("Verified Complainant");
        }

        // Map status history to timeline
        List<ComplaintStatusHistory> histories = statusHistoryRepository.findByComplaintIdOrderByCreatedAtAsc(complaint.getId());
        List<StatusHistoryResponse> timeline = new ArrayList<>();

        if (histories.isEmpty()) {
            timeline.add(new StatusHistoryResponse(1L, "Complaint Submitted", res.getFormattedDate(), "completed", "Complaint registered in the system.", "Complainant"));
        } else {
            for (int i = 0; i < histories.size(); i++) {
                ComplaintStatusHistory h = histories.get(i);
                boolean isLatest = (i == histories.size() - 1);
                String stepStatus = (complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.CLOSED) ? "completed" : (isLatest ? "current" : "completed");
                timeline.add(new StatusHistoryResponse(
                        h.getId(),
                        h.getNewStatus().replace("_", " "),
                        h.getCreatedAt().format(TIMELINE_FORMAT),
                        stepStatus,
                        h.getRemarks(),
                        h.getUpdatedBy() != null ? h.getUpdatedBy().getFullName() : "System"
                ));
            }
        }
        res.setTimeline(timeline);

        return res;
    }
}
