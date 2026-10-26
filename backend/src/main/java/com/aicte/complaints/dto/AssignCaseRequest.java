package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class AssignCaseRequest {
    private Long officerUserId;
    private Long primaryBureauId;
    private String supportingBureaus;
    private LocalDateTime dueDate;
    private String reason;

    public AssignCaseRequest() {}

    public Long getOfficerUserId() { return officerUserId; }
    public void setOfficerUserId(Long officerUserId) { this.officerUserId = officerUserId; }
    public Long getPrimaryBureauId() { return primaryBureauId; }
    public void setPrimaryBureauId(Long primaryBureauId) { this.primaryBureauId = primaryBureauId; }
    public String getSupportingBureaus() { return supportingBureaus; }
    public void setSupportingBureaus(String supportingBureaus) { this.supportingBureaus = supportingBureaus; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
