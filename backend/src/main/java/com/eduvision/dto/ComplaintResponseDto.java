package com.eduvision.dto;

import com.eduvision.entity.ComplaintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ComplaintResponseDto {
    private Long id;
    private String trackingId;
    private String institutionName;
    private String institutionType;
    private String institutionState;
    private String category;
    private String subject;
    private String description;
    private LocalDate incidentDate;
    private ComplaintStatus status;
    private String statusLabel;
    private String assignedOfficer;
    private String rejectionReason;
    private String resolutionSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ComplaintTimelineEventDto> history;

    public ComplaintResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }

    public String getInstitutionState() { return institutionState; }
    public void setInstitutionState(String institutionState) { this.institutionState = institutionState; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ComplaintTimelineEventDto> getHistory() { return history; }
    public void setHistory(List<ComplaintTimelineEventDto> history) { this.history = history; }
}
