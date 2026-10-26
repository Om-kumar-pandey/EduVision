package com.eduvision.dto;

import com.eduvision.entity.ComplaintStatus;
import java.time.LocalDateTime;

public class ComplaintTimelineEventDto {
    private ComplaintStatus status;
    private String title;
    private String timestamp;
    private String remarks;
    private String officer;

    public ComplaintTimelineEventDto() {}

    public ComplaintTimelineEventDto(ComplaintStatus status, String title, String timestamp, String remarks, String officer) {
        this.status = status;
        this.title = title;
        this.timestamp = timestamp;
        this.remarks = remarks;
        this.officer = officer;
    }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getOfficer() { return officer; }
    public void setOfficer(String officer) { this.officer = officer; }
}
