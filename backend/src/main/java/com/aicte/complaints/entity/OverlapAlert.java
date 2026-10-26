package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "overlap_alerts", uniqueConstraints = {
    @UniqueConstraint(name = "uq_overlap_pair", columnNames = {"case1_id", "case2_id"})
})
public class OverlapAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "case1_id", nullable = false)
    private CaseEntity case1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "case2_id", nullable = false)
    private CaseEntity case2;

    @Column(nullable = false, length = 30)
    private String status = "DETECTED";

    @Column(length = 50)
    private String classification;

    @Column(name = "review_remarks", columnDefinition = "TEXT")
    private String reviewRemarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "similarity_score")
    private Double similarityScore = 0.0;

    @Column(name = "rule_score")
    private Double ruleScore = 0.0;

    @Column(name = "semantic_score")
    private Double semanticScore = 0.0;

    @Column(name = "review_band", length = 30)
    private String reviewBand = "INCONCLUSIVE";

    @Column(name = "decision_status", length = 50)
    private String decisionStatus = "AWAITING_REVIEW";

    @Column(name = "explanation_json", columnDefinition = "LONGTEXT")
    private String explanationJson;

    @Column(name = "matching_version", length = 50)
    private String matchingVersion = "HYBRID-V2.1-TFIDF-COSINE";

    @Column(name = "analysis_timestamp")
    private LocalDateTime analysisTimestamp;

    @Column(name = "coordination_status", length = 30)
    private String coordinationStatus = "NONE";

    @Column(name = "primary_case_id")
    private Long primaryCaseId;

    @Column(name = "reversal_history", columnDefinition = "LONGTEXT")
    private String reversalHistory;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OverlapAlert() {}

    public OverlapAlert(Institution institution, CaseEntity case1, CaseEntity case2) {
        this.institution = institution;
        this.case1 = case1;
        this.case2 = case2;
        this.status = "DETECTED";
        this.decisionStatus = "AWAITING_REVIEW";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (analysisTimestamp == null) analysisTimestamp = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
    public CaseEntity getCase1() { return case1; }
    public void setCase1(CaseEntity case1) { this.case1 = case1; }
    public CaseEntity getCase2() { return case2; }
    public void setCase2(CaseEntity case2) { this.case2 = case2; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public Double getRuleScore() { return ruleScore; }
    public void setRuleScore(Double ruleScore) { this.ruleScore = ruleScore; }
    public Double getSemanticScore() { return semanticScore; }
    public void setSemanticScore(Double semanticScore) { this.semanticScore = semanticScore; }
    public String getReviewBand() { return reviewBand; }
    public void setReviewBand(String reviewBand) { this.reviewBand = reviewBand; }
    public String getDecisionStatus() { return decisionStatus; }
    public void setDecisionStatus(String decisionStatus) { this.decisionStatus = decisionStatus; }
    public String getExplanationJson() { return explanationJson; }
    public void setExplanationJson(String explanationJson) { this.explanationJson = explanationJson; }
    public String getMatchingVersion() { return matchingVersion; }
    public void setMatchingVersion(String matchingVersion) { this.matchingVersion = matchingVersion; }
    public LocalDateTime getAnalysisTimestamp() { return analysisTimestamp; }
    public void setAnalysisTimestamp(LocalDateTime analysisTimestamp) { this.analysisTimestamp = analysisTimestamp; }
    public String getCoordinationStatus() { return coordinationStatus; }
    public void setCoordinationStatus(String coordinationStatus) { this.coordinationStatus = coordinationStatus; }
    public Long getPrimaryCaseId() { return primaryCaseId; }
    public void setPrimaryCaseId(Long primaryCaseId) { this.primaryCaseId = primaryCaseId; }
    public String getReversalHistory() { return reversalHistory; }
    public void setReversalHistory(String reversalHistory) { this.reversalHistory = reversalHistory; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
