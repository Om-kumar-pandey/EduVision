package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class CoordinationRequestDto {
    private Long id;
    private String requestNumber;
    private Long overlapAlertId;

    private Long primaryCaseId;
    private String primaryCaseNumber;
    private String primaryCaseTitle;

    private Long linkedCaseId;
    private String linkedCaseNumber;
    private String linkedCaseTitle;

    private Long initiatingBureauId;
    private String initiatingBureauCode;
    private String initiatingBureauName;

    private Long targetBureauId;
    private String targetBureauCode;
    private String targetBureauName;

    private Long requestedByUserId;
    private String requestedByUserName;

    private String reason;
    private LocalDateTime deadline;
    private String status;
    private String officerRemarks;
    private String responseDocumentRef;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoordinationRequestDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }
    public Long getOverlapAlertId() { return overlapAlertId; }
    public void setOverlapAlertId(Long overlapAlertId) { this.overlapAlertId = overlapAlertId; }
    public Long getPrimaryCaseId() { return primaryCaseId; }
    public void setPrimaryCaseId(Long primaryCaseId) { this.primaryCaseId = primaryCaseId; }
    public String getPrimaryCaseNumber() { return primaryCaseNumber; }
    public void setPrimaryCaseNumber(String primaryCaseNumber) { this.primaryCaseNumber = primaryCaseNumber; }
    public String getPrimaryCaseTitle() { return primaryCaseTitle; }
    public void setPrimaryCaseTitle(String primaryCaseTitle) { this.primaryCaseTitle = primaryCaseTitle; }
    public Long getLinkedCaseId() { return linkedCaseId; }
    public void setLinkedCaseId(Long linkedCaseId) { this.linkedCaseId = linkedCaseId; }
    public String getLinkedCaseNumber() { return linkedCaseNumber; }
    public void setLinkedCaseNumber(String linkedCaseNumber) { this.linkedCaseNumber = linkedCaseNumber; }
    public String getLinkedCaseTitle() { return linkedCaseTitle; }
    public void setLinkedCaseTitle(String linkedCaseTitle) { this.linkedCaseTitle = linkedCaseTitle; }
    public Long getInitiatingBureauId() { return initiatingBureauId; }
    public void setInitiatingBureauId(Long initiatingBureauId) { this.initiatingBureauId = initiatingBureauId; }
    public String getInitiatingBureauCode() { return initiatingBureauCode; }
    public void setInitiatingBureauCode(String initiatingBureauCode) { this.initiatingBureauCode = initiatingBureauCode; }
    public String getInitiatingBureauName() { return initiatingBureauName; }
    public void setInitiatingBureauName(String initiatingBureauName) { this.initiatingBureauName = initiatingBureauName; }
    public Long getTargetBureauId() { return targetBureauId; }
    public void setTargetBureauId(Long targetBureauId) { this.targetBureauId = targetBureauId; }
    public String getTargetBureauCode() { return targetBureauCode; }
    public void setTargetBureauCode(String targetBureauCode) { this.targetBureauCode = targetBureauCode; }
    public String getTargetBureauName() { return targetBureauName; }
    public void setTargetBureauName(String targetBureauName) { this.targetBureauName = targetBureauName; }
    public Long getRequestedByUserId() { return requestedByUserId; }
    public void setRequestedByUserId(Long requestedByUserId) { this.requestedByUserId = requestedByUserId; }
    public String getRequestedByUserName() { return requestedByUserName; }
    public void setRequestedByUserName(String requestedByUserName) { this.requestedByUserName = requestedByUserName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }
    public String getResponseDocumentRef() { return responseDocumentRef; }
    public void setResponseDocumentRef(String responseDocumentRef) { this.responseDocumentRef = responseDocumentRef; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
