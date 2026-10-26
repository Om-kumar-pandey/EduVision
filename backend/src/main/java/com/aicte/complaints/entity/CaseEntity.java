package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cases")
public class CaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true, length = 50)
    private String caseNumber;

    @Column(name = "source_case_id", length = 50)
    private String sourceCaseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bureau_id", nullable = false)
    private Bureau bureau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column(name = "supporting_bureaus", length = 255)
    private String supportingBureaus;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 30)
    private String priority = "MEDIUM";

    @Column(nullable = false, length = 30)
    private String status = "RECEIVED";

    @Column(name = "receipt_date", nullable = false)
    private LocalDateTime receiptDate;

    @Column(name = "expected_disposal_date", nullable = false)
    private LocalDateTime expectedDisposalDate;

    @Column(name = "disposed_date")
    private LocalDateTime disposedDate;

    @Column(name = "institution_response", columnDefinition = "TEXT")
    private String institutionResponse;

    @Column(name = "institution_response_date")
    private LocalDateTime institutionResponseDate;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "duplicate_of_case_id")
    private Long duplicateOfCaseId;

    @Column(name = "duplicate_status", length = 30)
    private String duplicateStatus = "NONE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CaseEntity() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (receiptDate == null) receiptDate = LocalDateTime.now();
        if (expectedDisposalDate == null) expectedDisposalDate = receiptDate.plusDays(45);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isOverdue() {
        if ("DISPOSED".equalsIgnoreCase(status) || "RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) return false;
        return expectedDisposalDate != null && expectedDisposalDate.isBefore(LocalDateTime.now());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getSourceCaseId() { return sourceCaseId; }
    public void setSourceCaseId(String sourceCaseId) { this.sourceCaseId = sourceCaseId; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
    public Bureau getBureau() { return bureau; }
    public void setBureau(Bureau bureau) { this.bureau = bureau; }
    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }
    public String getSupportingBureaus() { return supportingBureaus; }
    public void setSupportingBureaus(String supportingBureaus) { this.supportingBureaus = supportingBureaus; }
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
    public String getInstitutionResponse() { return institutionResponse; }
    public void setInstitutionResponse(String institutionResponse) { this.institutionResponse = institutionResponse; }
    public LocalDateTime getInstitutionResponseDate() { return institutionResponseDate; }
    public void setInstitutionResponseDate(LocalDateTime institutionResponseDate) { this.institutionResponseDate = institutionResponseDate; }
    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
    public Long getDuplicateOfCaseId() { return duplicateOfCaseId; }
    public void setDuplicateOfCaseId(Long duplicateOfCaseId) { this.duplicateOfCaseId = duplicateOfCaseId; }
    public String getDuplicateStatus() { return duplicateStatus; }
    public void setDuplicateStatus(String duplicateStatus) { this.duplicateStatus = duplicateStatus; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
