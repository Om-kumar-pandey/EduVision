package com.eduvision.service;

import com.eduvision.dto.*;
import com.eduvision.entity.*;
import com.eduvision.exception.BadRequestException;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final ComplaintInternalNoteRepository internalNoteRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ComplaintService complaintService;

    public AdminService(ComplaintRepository complaintRepository,
                        ComplaintStatusHistoryRepository historyRepository,
                        ComplaintAssignmentRepository assignmentRepository,
                        ComplaintInternalNoteRepository internalNoteRepository,
                        NotificationRepository notificationRepository,
                        UserRepository userRepository,
                        ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.assignmentRepository = assignmentRepository;
        this.internalNoteRepository = internalNoteRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.complaintService = complaintService;
    }

    public List<ComplaintResponseDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(complaintService::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<ComplaintResponseDto> searchComplaints(String query, ComplaintStatus status, String category, Pageable pageable) {
        return complaintRepository.searchComplaints(query, status, category, pageable)
                .map(complaintService::mapToDto);
    }

    @Transactional
    public ComplaintResponseDto updateStatus(String trackingId, UpdateStatusRequest request, User officer) {
        Complaint complaint = complaintRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + trackingId));

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (newStatus == ComplaintStatus.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new BadRequestException("A mandatory rejection reason is required when rejecting a complaint.");
            }
            complaint.setRejectionReason(request.getRejectionReason());
        }

        if (newStatus == ComplaintStatus.RESOLVED && request.getRemarks() != null) {
            complaint.setResolutionSummary(request.getRemarks());
        }

        complaint.setStatus(newStatus);
        Complaint saved = complaintRepository.save(complaint);

        // Record Status History
        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                oldStatus,
                newStatus,
                officer.getFullName() + " (" + officer.getRole().name() + ")",
                request.getRemarks() != null ? request.getRemarks() : "Status changed to " + newStatus.name(),
                request.getInternalNote()
        );
        historyRepository.save(history);

        // Save Internal Note if provided
        if (request.getInternalNote() != null && !request.getInternalNote().trim().isEmpty()) {
            ComplaintInternalNote note = new ComplaintInternalNote(
                    saved,
                    officer.getFullName(),
                    request.getInternalNote()
            );
            internalNoteRepository.save(note);
        }

        // Notify Complainant of Status Change
        Notification notification = new Notification(
                saved.getUser(),
                "Status Update: " + saved.getTrackingId(),
                "Your grievance status has been updated to " + newStatus.name() + ". Officer remarks: " + (request.getRemarks() != null ? request.getRemarks() : "Under processing."),
                saved.getId()
        );
        notificationRepository.save(notification);

        return complaintService.mapToDto(saved);
    }

    @Transactional
    public ComplaintResponseDto assignOfficer(String trackingId, AssignOfficerRequest request, User currentAdmin) {
        Complaint complaint = complaintRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + trackingId));

        complaint.setAssignedOfficer(request.getAssignedOfficer());
        if (complaint.getStatus() == ComplaintStatus.SUBMITTED) {
            complaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        }
        Complaint saved = complaintRepository.save(complaint);

        // Log assignment
        ComplaintAssignment assignment = new ComplaintAssignment(
                saved,
                request.getAssignedOfficer(),
                currentAdmin.getFullName(),
                request.getAssignmentNotes()
        );
        assignmentRepository.save(assignment);

        return complaintService.mapToDto(saved);
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserProfileDto(
                        u.getId(), u.getEmail(), u.getFullName(),
                        u.getPhoneNumber(), u.getRole(), u.getInstitutionName(),
                        u.getAvatarUrl()
                ))
                .collect(Collectors.toList());
    }

    public String exportComplaintsCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Complaint ID,Filing Date,Institution,Category,Status,Assigned Officer,Resolution Summary\n");

        List<Complaint> complaints = complaintRepository.findAll();
        for (Complaint c : complaints) {
            csv.append(escapeCsv(c.getTrackingId())).append(",")
               .append(escapeCsv(c.getCreatedAt().toString())).append(",")
               .append(escapeCsv(c.getInstitutionName())).append(",")
               .append(escapeCsv(c.getCategory())).append(",")
               .append(escapeCsv(c.getStatus().name())).append(",")
               .append(escapeCsv(c.getAssignedOfficer() != null ? c.getAssignedOfficer() : "Unassigned")).append(",")
               .append(escapeCsv(c.getResolutionSummary() != null ? c.getResolutionSummary() : "")).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null) return "\"\"";
        return "\"" + data.replace("\"", "\"\"") + "\"";
    }
}
