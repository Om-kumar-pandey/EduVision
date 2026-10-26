package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class OverlapAlertDto {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String permanentId;
    private String region;
    private String state;
    private String city;

    private Long case1Id;
    private String case1Number;
    private String case1Title;
    private String case1Description;
    private String case1BureauCode;
    private String case1BureauName;
    private String case1Status;
    private String case1Priority;
    private String case1Category;
    private LocalDateTime case1ReceiptDate;
    private String case1OfficerName;

    private Long case2Id;
    private String case2Number;
    private String case2Title;
    private String case2Description;
    private String case2BureauCode;
    private String case2BureauName;
    private String case2Status;
    private String case2Priority;
    private String case2Category;
    private LocalDateTime case2ReceiptDate;
    private String case2OfficerName;

    private String status;
    private String classification;
    private String reviewRemarks;
    private Long reviewedByUserId;
    private String reviewedByUserName;
    private LocalDateTime reviewedAt;

    private Double similarityScore;
    private Double ruleScore;
    private Double semanticScore;
    private String reviewBand;
    private String decisionStatus;
    private String explanationJson;
    private String matchingVersion;
    private LocalDateTime analysisTimestamp;
    private String coordinationStatus;
    private Long primaryCaseId;
    private String reversalHistory;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OverlapAlertDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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

    public Long getCase1Id() { return case1Id; }
    public void setCase1Id(Long case1Id) { this.case1Id = case1Id; }
    public String getCase1Number() { return case1Number; }
    public void setCase1Number(String case1Number) { this.case1Number = case1Number; }
    public String getCase1Title() { return case1Title; }
    public void setCase1Title(String case1Title) { this.case1Title = case1Title; }
    public String getCase1Description() { return case1Description; }
    public void setCase1Description(String case1Description) { this.case1Description = case1Description; }
    public String getCase1BureauCode() { return case1BureauCode; }
    public void setCase1BureauCode(String case1BureauCode) { this.case1BureauCode = case1BureauCode; }
    public String getCase1BureauName() { return case1BureauName; }
    public void setCase1BureauName(String case1BureauName) { this.case1BureauName = case1BureauName; }
    public String getCase1Status() { return case1Status; }
    public void setCase1Status(String case1Status) { this.case1Status = case1Status; }
    public String getCase1Priority() { return case1Priority; }
    public void setCase1Priority(String case1Priority) { this.case1Priority = case1Priority; }
    public String getCase1Category() { return case1Category; }
    public void setCase1Category(String case1Category) { this.case1Category = case1Category; }
    public LocalDateTime getCase1ReceiptDate() { return case1ReceiptDate; }
    public void setCase1ReceiptDate(LocalDateTime case1ReceiptDate) { this.case1ReceiptDate = case1ReceiptDate; }
    public String getCase1OfficerName() { return case1OfficerName; }
    public void setCase1OfficerName(String case1OfficerName) { this.case1OfficerName = case1OfficerName; }

    public Long getCase2Id() { return case2Id; }
    public void setCase2Id(Long case2Id) { this.case2Id = case2Id; }
    public String getCase2Number() { return case2Number; }
    public void setCase2Number(String case2Number) { this.case2Number = case2Number; }
    public String getCase2Title() { return case2Title; }
    public void setCase2Title(String case2Title) { this.case2Title = case2Title; }
    public String getCase2Description() { return case2Description; }
    public void setCase2Description(String case2Description) { this.case2Description = case2Description; }
    public String getCase2BureauCode() { return case2BureauCode; }
    public void setCase2BureauCode(String case2BureauCode) { this.case2BureauCode = case2BureauCode; }
    public String getCase2BureauName() { return case2BureauName; }
    public void setCase2BureauName(String case2BureauName) { this.case2BureauName = case2BureauName; }
    public String getCase2Status() { return case2Status; }
    public void setCase2Status(String case2Status) { this.case2Status = case2Status; }
    public String getCase2Priority() { return case2Priority; }
    public void setCase2Priority(String case2Priority) { this.case2Priority = case2Priority; }
    public String getCase2Category() { return case2Category; }
    public void setCase2Category(String case2Category) { this.case2Category = case2Category; }
    public LocalDateTime getCase2ReceiptDate() { return case2ReceiptDate; }
    public void setCase2ReceiptDate(LocalDateTime case2ReceiptDate) { this.case2ReceiptDate = case2ReceiptDate; }
    public String getCase2OfficerName() { return case2OfficerName; }
    public void setCase2OfficerName(String case2OfficerName) { this.case2OfficerName = case2OfficerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }
    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }
    public String getReviewedByUserName() { return reviewedByUserName; }
    public void setReviewedByUserName(String reviewedByUserName) { this.reviewedByUserName = reviewedByUserName; }
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
