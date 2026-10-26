package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coordination_requests")
public class CoordinationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_number", nullable = false, unique = true, length = 50)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overlap_alert_id")
    private OverlapAlert overlapAlert;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_case_id", nullable = false)
    private CaseEntity primaryCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "linked_case_id", nullable = false)
    private CaseEntity linkedCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "initiating_bureau_id", nullable = false)
    private Bureau initiatingBureau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_bureau_id", nullable = false)
    private Bureau targetBureau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, ACCEPTED, DECLINED, COMPLETED

    @Column(name = "officer_remarks", columnDefinition = "TEXT")
    private String officerRemarks;

    @Column(name = "response_document_ref", length = 255)
    private String responseDocumentRef;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CoordinationRequest() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }
    public OverlapAlert getOverlapAlert() { return overlapAlert; }
    public void setOverlapAlert(OverlapAlert overlapAlert) { this.overlapAlert = overlapAlert; }
    public CaseEntity getPrimaryCase() { return primaryCase; }
    public void setPrimaryCase(CaseEntity primaryCase) { this.primaryCase = primaryCase; }
    public CaseEntity getLinkedCase() { return linkedCase; }
    public void setLinkedCase(CaseEntity linkedCase) { this.linkedCase = linkedCase; }
    public Bureau getInitiatingBureau() { return initiatingBureau; }
    public void setInitiatingBureau(Bureau initiatingBureau) { this.initiatingBureau = initiatingBureau; }
    public Bureau getTargetBureau() { return targetBureau; }
    public void setTargetBureau(Bureau targetBureau) { this.targetBureau = targetBureau; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
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
