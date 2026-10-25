package com.eduvision.service;

import com.eduvision.dto.*;
import com.eduvision.entity.*;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.exception.UnauthorizedException;
import com.eduvision.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final InstitutionRepository institutionRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintStatusHistoryRepository historyRepository,
                            NotificationRepository notificationRepository,
                            InstitutionRepository institutionRepository) {
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.institutionRepository = institutionRepository;
    }

    @Transactional
    public ComplaintResponseDto createComplaint(User complainant, CreateComplaintRequest request) {
        Complaint complaint = new Complaint();
        complaint.setUser(complainant);
        complaint.setTrackingId(generateUniqueTrackingId());
        complaint.setInstitutionName(request.getInstitutionName());
        complaint.setInstitutionType(request.getInstitutionType());
        complaint.setInstitutionState(request.getInstitutionState());
        complaint.setCategory(request.getCategory());
        complaint.setSubject(request.getSubject());
        complaint.setDescription(request.getDescription());
        complaint.setIncidentDate(request.getIncidentDate());
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        // Link institution if known
        institutionRepository.findByName(request.getInstitutionName())
                .ifPresent(complaint::setInstitution);

        Complaint saved = complaintRepository.save(complaint);

        // Record Initial Timeline History
        ComplaintStatusHistory initialHistory = new ComplaintStatusHistory(
                saved,
                null,
                ComplaintStatus.SUBMITTED,
                "Complainant (" + complainant.getFullName() + ")",
                "Grievance submitted via EduVision online portal.",
                "Automated initial registration check passed."
        );
        historyRepository.save(initialHistory);

        // Generate Confirmation Notification
        Notification notification = new Notification(
                complainant,
                "Grievance Registered",
                "Your grievance " + saved.getTrackingId() + " has been successfully recorded in the AICTE repository.",
                saved.getId()
        );
        notificationRepository.save(notification);

        return mapToDto(saved);
    }

    public List<ComplaintResponseDto> getUserComplaints(User user) {
        return complaintRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ComplaintResponseDto getComplaintDetails(String trackingId, User user) {
        Complaint complaint = complaintRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + trackingId));

        // Enforce ownership: Regular student can only view their own complaint
        boolean isStaffOrAdmin = user.getRole() == Role.ADMIN ||
                user.getRole() == Role.AICTE_OFFICER ||
                user.getRole() == Role.INSTITUTION_HEAD ||
                user.getRole() == Role.HOD;

        if (!complaint.getUser().getId().equals(user.getId()) && !isStaffOrAdmin) {
            throw new UnauthorizedException("You are not authorized to view this complaint.");
        }

        return mapToDto(complaint);
    }

    public PublicTrackingDto getPublicTrackingInfo(String trackingId) {
        Complaint complaint = complaintRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("No grievance found with ID: " + trackingId));

        PublicTrackingDto dto = new PublicTrackingDto();
        dto.setTrackingId(complaint.getTrackingId());
        dto.setDate(complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        dto.setInstitution(complaint.getInstitutionName());
        dto.setCategory(complaint.getCategory());
        dto.setSubject(complaint.getSubject());
        dto.setStatus(complaint.getStatus());
        dto.setStatusLabel(formatStatusLabel(complaint.getStatus()));
        dto.setResolutionSummary(complaint.getResolutionSummary());

        List<ComplaintTimelineEventDto> historyDtos = historyRepository.findByComplaintOrderByCreatedAtAsc(complaint)
                .stream()
                .map(h -> new ComplaintTimelineEventDto(
                        h.getNewStatus(),
                        formatHistoryTitle(h.getNewStatus()),
                        h.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
                        h.getRemarks(),
                        h.getUpdatedBy()
                ))
                .collect(Collectors.toList());

        dto.setHistory(historyDtos);
        return dto;
    }

    private synchronized String generateUniqueTrackingId() {
        int year = LocalDateTime.now().getYear();
        String candidate;
        do {
            int randomNum = 100000 + new Random().nextInt(900000);
            candidate = String.format("CMP-%d-%06d", year, randomNum);
        } while (complaintRepository.findByTrackingId(candidate).isPresent());
        return candidate;
    }

    public ComplaintResponseDto mapToDto(Complaint c) {
        ComplaintResponseDto dto = new ComplaintResponseDto();
        dto.setId(c.getId());
        dto.setTrackingId(c.getTrackingId());
        dto.setInstitutionName(c.getInstitutionName());
        dto.setInstitutionType(c.getInstitutionType());
        dto.setInstitutionState(c.getInstitutionState());
        dto.setCategory(c.getCategory());
        dto.setSubject(c.getSubject());
        dto.setDescription(c.getDescription());
        dto.setIncidentDate(c.getIncidentDate());
        dto.setStatus(c.getStatus());
        dto.setStatusLabel(formatStatusLabel(c.getStatus()));
        dto.setAssignedOfficer(c.getAssignedOfficer());
        dto.setRejectionReason(c.getRejectionReason());
        dto.setResolutionSummary(c.getResolutionSummary());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        List<ComplaintTimelineEventDto> history = historyRepository.findByComplaintOrderByCreatedAtAsc(c)
                .stream()
                .map(h -> new ComplaintTimelineEventDto(
                        h.getNewStatus(),
                        formatHistoryTitle(h.getNewStatus()),
                        h.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
                        h.getRemarks(),
                        h.getUpdatedBy()
                ))
                .collect(Collectors.toList());
        dto.setHistory(history);

        return dto;
    }

    private String formatStatusLabel(ComplaintStatus status) {
        if (status == null) return "Submitted";
        switch (status) {
            case IN_PROCESS: return "In Process";
            case UNDER_REVIEW: return "Under Review";
            case RESOLVED: return "Resolved";
            case REJECTED: return "Rejected";
            case CLOSED: return "Closed";
            case SUBMITTED: default: return "Submitted";
        }
    }

    private String formatHistoryTitle(ComplaintStatus status) {
        if (status == null) return "Status Updated";
        switch (status) {
            case SUBMITTED: return "Complaint Registered";
            case UNDER_REVIEW: return "Under Initial Assessment";
            case IN_PROCESS: return "In Active Investigation";
            case RESOLVED: return "Grievance Resolved";
            case REJECTED: return "Complaint Rejected";
            case CLOSED: return "Case Closed";
            default: return "Status Updated";
        }
    }
}
