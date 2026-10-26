package com.aicte.complaints.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PublicTrackingDto {

    private String caseNumber;
    private String title;
    private String category;
    private String priority;
    private String status;
    private String institutionName;
    private String institutionPermanentId;
    private String institutionRegion;
    private String institutionCity;
    private String bureauName;
    private LocalDateTime receiptDate;
    private LocalDateTime expectedDisposalDate;
    private LocalDateTime disposedDate;
    private List<Milestone> milestones = new ArrayList<>();

    public static class Milestone {
        private String stage;
        private String status;
        private String description;
        private LocalDateTime timestamp;

        public Milestone() {}
        public Milestone(String stage, String status, String description, LocalDateTime timestamp) {
            this.stage = stage;
            this.status = status;
            this.description = description;
            this.timestamp = timestamp;
        }
        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public PublicTrackingDto() {}

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getInstitutionPermanentId() { return institutionPermanentId; }
    public void setInstitutionPermanentId(String institutionPermanentId) { this.institutionPermanentId = institutionPermanentId; }
    public String getInstitutionRegion() { return institutionRegion; }
    public void setInstitutionRegion(String institutionRegion) { this.institutionRegion = institutionRegion; }
    public String getInstitutionCity() { return institutionCity; }
    public void setInstitutionCity(String institutionCity) { this.institutionCity = institutionCity; }
    public String getBureauName() { return bureauName; }
    public void setBureauName(String bureauName) { this.bureauName = bureauName; }
    public LocalDateTime getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDateTime receiptDate) { this.receiptDate = receiptDate; }
    public LocalDateTime getExpectedDisposalDate() { return expectedDisposalDate; }
    public void setExpectedDisposalDate(LocalDateTime expectedDisposalDate) { this.expectedDisposalDate = expectedDisposalDate; }
    public LocalDateTime getDisposedDate() { return disposedDate; }
    public void setDisposedDate(LocalDateTime disposedDate) { this.disposedDate = disposedDate; }
    public List<Milestone> getMilestones() { return milestones; }
    public void setMilestones(List<Milestone> milestones) { this.milestones = milestones; }
}
