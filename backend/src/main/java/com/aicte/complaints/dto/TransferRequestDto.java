package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class TransferRequestDto {
    private Long id;
    private Long caseId;
    private String caseNumber;
    private String caseTitle;
    private Long institutionId;
    private String institutionName;
    private Long fromBureauId;
    private String fromBureauCode;
    private String fromBureauName;
    private Long toBureauId;
    private String toBureauCode;
    private String toBureauName;
    private Long requestedByUserId;
    private String requestedByUserName;
    private Long reviewedByUserId;
    private String reviewedByUserName;
    private String reason;
    private String status;
    private String decisionRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TransferRequestDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public Long getFromBureauId() { return fromBureauId; }
    public void setFromBureauId(Long fromBureauId) { this.fromBureauId = fromBureauId; }
    public String getFromBureauCode() { return fromBureauCode; }
    public void setFromBureauCode(String fromBureauCode) { this.fromBureauCode = fromBureauCode; }
    public String getFromBureauName() { return fromBureauName; }
    public void setFromBureauName(String fromBureauName) { this.fromBureauName = fromBureauName; }
    public Long getToBureauId() { return toBureauId; }
    public void setToBureauId(Long toBureauId) { this.toBureauId = toBureauId; }
    public String getToBureauCode() { return toBureauCode; }
    public void setToBureauCode(String toBureauCode) { this.toBureauCode = toBureauCode; }
    public String getToBureauName() { return toBureauName; }
    public void setToBureauName(String toBureauName) { this.toBureauName = toBureauName; }
    public Long getRequestedByUserId() { return requestedByUserId; }
    public void setRequestedByUserId(Long requestedByUserId) { this.requestedByUserId = requestedByUserId; }
    public String getRequestedByUserName() { return requestedByUserName; }
    public void setRequestedByUserName(String requestedByUserName) { this.requestedByUserName = requestedByUserName; }
    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }
    public String getReviewedByUserName() { return reviewedByUserName; }
    public void setReviewedByUserName(String reviewedByUserName) { this.reviewedByUserName = reviewedByUserName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDecisionRemarks() { return decisionRemarks; }
    public void setDecisionRemarks(String decisionRemarks) { this.decisionRemarks = decisionRemarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
