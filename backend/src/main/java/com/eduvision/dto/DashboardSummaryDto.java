package com.eduvision.dto;

public class DashboardSummaryDto {
    private long total;
    private long inProcess;
    private long resolved;
    private long rejected;
    private long underReview;
    private long submitted;
    private long closed;

    private String inProcessPercent;
    private String resolvedPercent;
    private String rejectedPercent;
    private String underReviewPercent;

    private String lastUpdated;

    public DashboardSummaryDto() {}

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public long getInProcess() { return inProcess; }
    public void setInProcess(long inProcess) { this.inProcess = inProcess; }

    public long getResolved() { return resolved; }
    public void setResolved(long resolved) { this.resolved = resolved; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getSubmitted() { return submitted; }
    public void setSubmitted(long submitted) { this.submitted = submitted; }

    public long getClosed() { return closed; }
    public void setClosed(long closed) { this.closed = closed; }

    public String getInProcessPercent() { return inProcessPercent; }
    public void setInProcessPercent(String inProcessPercent) { this.inProcessPercent = inProcessPercent; }

    public String getResolvedPercent() { return resolvedPercent; }
    public void setResolvedPercent(String resolvedPercent) { this.resolvedPercent = resolvedPercent; }

    public String getRejectedPercent() { return rejectedPercent; }
    public void setRejectedPercent(String rejectedPercent) { this.rejectedPercent = rejectedPercent; }

    public String getUnderReviewPercent() { return underReviewPercent; }
    public void setUnderReviewPercent(String underReviewPercent) { this.underReviewPercent = underReviewPercent; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}
