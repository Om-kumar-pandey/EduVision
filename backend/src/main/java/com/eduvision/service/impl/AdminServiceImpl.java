package com.eduvision.service.impl;

import com.eduvision.dto.request.AssignComplaintRequest;
import com.eduvision.dto.response.ComplaintDetailResponse;
import com.eduvision.dto.response.ComplaintSummaryResponse;
import com.eduvision.dto.response.UserProfileResponse;
import com.eduvision.entity.*;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.exception.UnauthorizedException;
import com.eduvision.repository.ComplaintAssignmentRepository;
import com.eduvision.repository.ComplaintRepository;
import com.eduvision.repository.NotificationRepository;
import com.eduvision.repository.UserRepository;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.AdminService;
import com.eduvision.service.ComplaintService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class AdminServiceImpl implements AdminService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final NotificationRepository notificationRepository;
    private final ComplaintService complaintService;

    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

    public AdminServiceImpl(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            ComplaintAssignmentRepository assignmentRepository,
                            NotificationRepository notificationRepository,
                            ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationRepository = notificationRepository;
        this.complaintService = complaintService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplaintSummaryResponse> getAllComplaints(ComplaintStatus status, String category, String query, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return complaintRepository.searchComplaints(
                null,
                status,
                (category != null && !category.isEmpty()) ? category : null,
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                pageRequest
        ).map(c -> new ComplaintSummaryResponse(
                c.getId(),
                c.getTrackingId(),
                c.getCreatedAt() != null ? c.getCreatedAt().format(DISPLAY_DATE) : "",
                c.getInstitution() != null ? c.getInstitution().getName() : "Unknown",
                c.getCategory(),
                c.getStatus(),
                c.getStatus().getDisplayName(),
                c.getSubject()
        ));
    }

    @Override
    @Transactional
    public ComplaintDetailResponse assignComplaint(Long complaintId, AssignComplaintRequest request, UserPrincipal currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AICTE_OFFICER) {
            throw new UnauthorizedException("Insufficient privileges to assign complaints.");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer user not found with id: " + request.getOfficerId()));

        User assigningUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assigning user not found."));

        complaint.setAssignedOfficer(officer);
        complaintRepository.save(complaint);

        // Record assignment
        ComplaintAssignment assignment = new ComplaintAssignment();
        assignment.setComplaint(complaint);
        assignment.setAssignedTo(officer);
        assignment.setAssignedBy(assigningUser);
        assignment.setNotes(request.getNotes());
        assignment.setIsActive(true);
        assignmentRepository.save(assignment);

        // Notify officer
        Notification notif = new Notification(
                officer,
                "Complaint Assigned: " + complaint.getTrackingId(),
                "You have been designated as the handling scrutiny officer for complaint " + complaint.getTrackingId() + ".",
                "ASSIGNMENT",
                complaint
        );
        notificationRepository.save(notif);

        return complaintService.getComplaintDetails(complaintId, currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserProfileResponse res = new UserProfileResponse();
            res.setId(u.getId());
            res.setEmail(u.getEmail());
            res.setFullName(u.getFullName());
            res.setRollOrEmpId(u.getRollOrEmpId());
            res.setRole(u.getRole());
            res.setPhoneNumber(u.getPhoneNumber());
            res.setDepartment(u.getDepartment());
            res.setCreatedAt(u.getCreatedAt());
            if (u.getInstitution() != null) {
                res.setInstitutionId(u.getInstitution().getId());
                res.setInstitutionName(u.getInstitution().getName());
            }
            return res;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportComplaintsCsv() {
        List<Complaint> complaints = complaintRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        StringBuilder sb = new StringBuilder();
        sb.append("Complaint ID,Date,Institution,Category,Subject,Status,Complainant,Assigned Officer\n");

        for (Complaint c : complaints) {
            sb.append("\"").append(c.getTrackingId()).append("\",");
            sb.append("\"").append(c.getCreatedAt() != null ? c.getCreatedAt().format(DISPLAY_DATE) : "").append("\",");
            sb.append("\"").append(c.getInstitution() != null ? c.getInstitution().getName().replace("\"", "\"\"") : "").append("\",");
            sb.append("\"").append(c.getCategory().replace("\"", "\"\"")).append("\",");
            sb.append("\"").append(c.getSubject().replace("\"", "\"\"")).append("\",");
            sb.append("\"").append(c.getStatus().name()).append("\",");
            sb.append("\"").append(c.getComplainant() != null ? c.getComplainant().getFullName().replace("\"", "\"\"") : "").append("\",");
            sb.append("\"").append(c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName().replace("\"", "\"\"") : "Unassigned").append("\"\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
