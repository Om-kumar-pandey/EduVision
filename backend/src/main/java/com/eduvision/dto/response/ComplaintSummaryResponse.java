package com.eduvision.dto.response;

import com.eduvision.entity.ComplaintStatus;

public class ComplaintSummaryResponse {

    private Long id;
    private String trackingId;
    private String formattedDate;
    private String institutionName;
    private String category;
    private ComplaintStatus status;
    private String statusDisplayName;
    private String subject;

    public ComplaintSummaryResponse() {}

    public ComplaintSummaryResponse(Long id, String trackingId, String formattedDate, String institutionName,
                                    String category, ComplaintStatus status, String statusDisplayName, String subject) {
        this.id = id;
        this.trackingId = trackingId;
        this.formattedDate = formattedDate;
        this.institutionName = institutionName;
        this.category = category;
        this.status = status;
        this.statusDisplayName = statusDisplayName;
        this.subject = subject;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getFormattedDate() { return formattedDate; }
    public void setFormattedDate(String formattedDate) { this.formattedDate = formattedDate; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getStatusDisplayName() { return statusDisplayName; }
    public void setStatusDisplayName(String statusDisplayName) { this.statusDisplayName = statusDisplayName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}
