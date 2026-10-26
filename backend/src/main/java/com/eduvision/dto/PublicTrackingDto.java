package com.eduvision.dto;

import com.eduvision.entity.ComplaintStatus;
import java.util.List;

public class PublicTrackingDto {
    private String trackingId;
    private String date;
    private String institution;
    private String category;
    private String subject;
    private ComplaintStatus status;
    private String statusLabel;
    private String resolutionSummary;
    private List<ComplaintTimelineEventDto> history;

    public PublicTrackingDto() {}

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }

    public List<ComplaintTimelineEventDto> getHistory() { return history; }
    public void setHistory(List<ComplaintTimelineEventDto> history) { this.history = history; }
}
