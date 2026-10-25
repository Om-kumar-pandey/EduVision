package com.eduvision.dto.response;

public class StatusHistoryResponse {

    private Long id;
    private String title;
    private String date;
    private String status; // 'completed', 'current', 'pending'
    private String desc;
    private String updatedBy;

    public StatusHistoryResponse() {}

    public StatusHistoryResponse(Long id, String title, String date, String status, String desc, String updatedBy) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.status = status;
        this.desc = desc;
        this.updatedBy = updatedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
