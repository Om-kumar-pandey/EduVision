package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_relationships")
public class CaseRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_case_id", nullable = false)
    private CaseEntity sourceCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_case_id", nullable = false)
    private CaseEntity targetCase;

    @Column(name = "relationship_type", nullable = false, length = 50)
    private String relationshipType; // DUPLICATE_OF, RELATED_TO, PARENT_CHILD

    @Column(name = "similarity_score")
    private Double similarityScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public CaseRelationship() {}

    public CaseRelationship(CaseEntity sourceCase, CaseEntity targetCase, String relationshipType, Double similarityScore, String notes, User createdBy) {
        this.sourceCase = sourceCase;
        this.targetCase = targetCase;
        this.relationshipType = relationshipType;
        this.similarityScore = similarityScore;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CaseEntity getSourceCase() { return sourceCase; }
    public void setSourceCase(CaseEntity sourceCase) { this.sourceCase = sourceCase; }
    public CaseEntity getTargetCase() { return targetCase; }
    public void setTargetCase(CaseEntity targetCase) { this.targetCase = targetCase; }
    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
