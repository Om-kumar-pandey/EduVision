package com.aicte.complaints.dto;

public class ReviewOverlapRequest {
    private String decision; // CONFIRMED_DUPLICATE, CONFIRMED_RELATED, MARKED_UNRELATED, ADDITIONAL_INFO_REQUESTED, COORDINATION_REQUESTED, ESCALATED, REOPENED
    private String classification; // Backward compatibility
    private String reviewRemarks;
    private Long primaryCaseId;
    private String coordinationReason;
    private Long targetBureauId;

    public ReviewOverlapRequest() {}

    public String getDecision() {
        if (decision != null && !decision.isBlank()) return decision;
        return classification;
    }
    public void setDecision(String decision) { this.decision = decision; }
    public String getClassification() { return classification != null ? classification : decision; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }
    public Long getPrimaryCaseId() { return primaryCaseId; }
    public void setPrimaryCaseId(Long primaryCaseId) { this.primaryCaseId = primaryCaseId; }
    public String getCoordinationReason() { return coordinationReason; }
    public void setCoordinationReason(String coordinationReason) { this.coordinationReason = coordinationReason; }
    public Long getTargetBureauId() { return targetBureauId; }
    public void setTargetBureauId(Long targetBureauId) { this.targetBureauId = targetBureauId; }
}
