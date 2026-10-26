package com.eduvision.dto;

import com.eduvision.entity.ComplaintStatus;

public class RecentComplaintDto {
    private String id; // tracking ID
    private String date;
    private String institution;
    private String category;
    private ComplaintStatus status;
    private String statusLabel;
    private String subject;

    public RecentComplaintDto() {}

    public RecentComplaintDto(String id, String date, String institution, String category, ComplaintStatus status, String statusLabel, String subject) {
        this.id = id;
        this.date = date;
        this.institution = institution;
        this.category = category;
        this.status = status;
        this.statusLabel = statusLabel;
        this.subject = subject;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}
