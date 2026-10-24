package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewOverlapRequest {
    @NotBlank(message = "Classification is required")
    private String classification;
    @NotBlank(message = "Review remarks are mandatory")
    private String reviewRemarks;

    public ReviewOverlapRequest() {}
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }
}
