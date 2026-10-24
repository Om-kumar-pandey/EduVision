package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class CaseDto {
    private Long id;
    private String caseNumber;
    private String sourceCaseId;
    private Long institutionId;
    private String institutionName;
    private String permanentId;
    private String region;
    private String state;
    private String city;
    private Long bureauId;
    private String bureauCode;
    private String bureauName;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private LocalDateTime receiptDate;
    private LocalDateTime expectedDisposalDate;
    private LocalDateTime disposedDate;
    private boolean overdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CaseDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getSourceCaseId() { return sourceCaseId; }
    public void setSourceCaseId(String sourceCaseId) { this.sourceCaseId = sourceCaseId; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getPermanentId() { return permanentId; }
    public void setPermanentId(String permanentId) { this.permanentId = permanentId; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Long getBureauId() { return bureauId; }
    public void setBureauId(Long bureauId) { this.bureauId = bureauId; }
    public String getBureauCode() { return bureauCode; }
    public void setBureauCode(String bureauCode) { this.bureauCode = bureauCode; }
    public String getBureauName() { return bureauName; }
    public void setBureauName(String bureauName) { this.bureauName = bureauName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDateTime receiptDate) { this.receiptDate = receiptDate; }
    public LocalDateTime getExpectedDisposalDate() { return expectedDisposalDate; }
    public void setExpectedDisposalDate(LocalDateTime expectedDisposalDate) { this.expectedDisposalDate = expectedDisposalDate; }
    public LocalDateTime getDisposedDate() { return disposedDate; }
    public void setDisposedDate(LocalDateTime disposedDate) { this.disposedDate = disposedDate; }
    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
