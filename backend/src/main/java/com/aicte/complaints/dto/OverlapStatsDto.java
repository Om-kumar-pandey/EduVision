package com.aicte.complaints.dto;

public class OverlapStatsDto {
    private long totalOverlaps;
    private long pendingReview;
    private long highSimilarity;
    private long mediumSimilarity;
    private long lowSimilarity;
    private long inconclusive;
    private long confirmedDuplicates;
    private long relatedCases;
    private long unrelatedCases;
    private long activeCoordinationRequests;

    public OverlapStatsDto() {}

    public long getTotalOverlaps() { return totalOverlaps; }
    public void setTotalOverlaps(long totalOverlaps) { this.totalOverlaps = totalOverlaps; }
    public long getPendingReview() { return pendingReview; }
    public void setPendingReview(long pendingReview) { this.pendingReview = pendingReview; }
    public long getHighSimilarity() { return highSimilarity; }
    public void setHighSimilarity(long highSimilarity) { this.highSimilarity = highSimilarity; }
    public long getMediumSimilarity() { return mediumSimilarity; }
    public void setMediumSimilarity(long mediumSimilarity) { this.mediumSimilarity = mediumSimilarity; }
    public long getLowSimilarity() { return lowSimilarity; }
    public void setLowSimilarity(long lowSimilarity) { this.lowSimilarity = lowSimilarity; }
    public long getInconclusive() { return inconclusive; }
    public void setInconclusive(long inconclusive) { this.inconclusive = inconclusive; }
    public long getConfirmedDuplicates() { return confirmedDuplicates; }
    public void setConfirmedDuplicates(long confirmedDuplicates) { this.confirmedDuplicates = confirmedDuplicates; }
    public long getRelatedCases() { return relatedCases; }
    public void setRelatedCases(long relatedCases) { this.relatedCases = relatedCases; }
    public long getUnrelatedCases() { return unrelatedCases; }
    public void setUnrelatedCases(long unrelatedCases) { this.unrelatedCases = unrelatedCases; }
    public long getActiveCoordinationRequests() { return activeCoordinationRequests; }
    public void setActiveCoordinationRequests(long activeCoordinationRequests) { this.activeCoordinationRequests = activeCoordinationRequests; }
}
