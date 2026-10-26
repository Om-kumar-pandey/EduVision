package com.eduvision.dto.response;

import com.eduvision.entity.ComplaintStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ComplaintDetailResponse {

    private Long id;
    private String trackingId;
    private String formattedDate;
    private String complainantName;
    private String complainantEmail;
    private String stakeholderRole;
    private String institutionName;
    private String institutionType;
    private String institutionState;
    private String category;
    private String subject;
    private String description;
    private LocalDate incidentDate;
    private ComplaintStatus status;
    private String statusDisplayName;
    private String assignedOfficerName;
    private String resolutionSummary;
    private String rejectionReason;
    private List<StatusHistoryResponse> timeline = new ArrayList<>();
    private List<String> attachments = new ArrayList<>();

    public ComplaintDetailResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getFormattedDate() { return formattedDate; }
    public void setFormattedDate(String formattedDate) { this.formattedDate = formattedDate; }

    public String getComplainantName() { return complainantName; }
    public void setComplainantName(String complainantName) { this.complainantName = complainantName; }

    public String getComplainantEmail() { return complainantEmail; }
    public void setComplainantEmail(String complainantEmail) { this.complainantEmail = complainantEmail; }

    public String getStakeholderRole() { return stakeholderRole; }
    public void setStakeholderRole(String stakeholderRole) { this.stakeholderRole = stakeholderRole; }

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

    public String getStatusDisplayName() { return statusDisplayName; }
    public void setStatusDisplayName(String statusDisplayName) { this.statusDisplayName = statusDisplayName; }

    public String getAssignedOfficerName() { return assignedOfficerName; }
    public void setAssignedOfficerName(String assignedOfficerName) { this.assignedOfficerName = assignedOfficerName; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public List<StatusHistoryResponse> getTimeline() { return timeline; }
    public void setTimeline(List<StatusHistoryResponse> timeline) { this.timeline = timeline; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
}
