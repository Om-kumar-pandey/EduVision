package com.eduvision.dto;

public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private boolean read;
    private String time;
    private Long relatedComplaintId;

    public NotificationDto() {}

    public NotificationDto(Long id, String title, String message, boolean read, String time, Long relatedComplaintId) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.read = read;
        this.time = time;
        this.relatedComplaintId = relatedComplaintId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public Long getRelatedComplaintId() { return relatedComplaintId; }
    public void setRelatedComplaintId(Long relatedComplaintId) { this.relatedComplaintId = relatedComplaintId; }
}
