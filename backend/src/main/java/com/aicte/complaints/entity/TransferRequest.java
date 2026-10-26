package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_requests")
public class TransferRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseEntity caseEntity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_bureau_id", nullable = false)
    private Bureau fromBureau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_bureau_id", nullable = false)
    private Bureau toBureau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "decision_remarks", columnDefinition = "TEXT")
    private String decisionRemarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TransferRequest() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CaseEntity getCaseEntity() { return caseEntity; }
    public void setCaseEntity(CaseEntity caseEntity) { this.caseEntity = caseEntity; }
    public Bureau getFromBureau() { return fromBureau; }
    public void setFromBureau(Bureau fromBureau) { this.fromBureau = fromBureau; }
    public Bureau getToBureau() { return toBureau; }
    public void setToBureau(Bureau toBureau) { this.toBureau = toBureau; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
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
