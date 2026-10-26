package com.eduvision.dto.response;

import java.util.ArrayList;
import java.util.List;

public class DashboardSummaryResponse {

    private long totalComplaints;
    private long inProcessCount;
    private String inProcessPct;
    private long resolvedCount;
    private String resolvedPct;
    private long rejectedCount;
    private String rejectedPct;
    private long underReviewCount;
    private String underReviewPct;
    private String lastUpdated;
    private List<ComplaintSummaryResponse> recentComplaints = new ArrayList<>();

    public DashboardSummaryResponse() {}

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public long getInProcessCount() { return inProcessCount; }
    public void setInProcessCount(long inProcessCount) { this.inProcessCount = inProcessCount; }

    public String getInProcessPct() { return inProcessPct; }
    public void setInProcessPct(String inProcessPct) { this.inProcessPct = inProcessPct; }

    public long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(long resolvedCount) { this.resolvedCount = resolvedCount; }

    public String getResolvedPct() { return resolvedPct; }
    public void setResolvedPct(String resolvedPct) { this.resolvedPct = resolvedPct; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public String getRejectedPct() { return rejectedPct; }
    public void setRejectedPct(String rejectedPct) { this.rejectedPct = rejectedPct; }

    public long getUnderReviewCount() { return underReviewCount; }
    public void setUnderReviewCount(long underReviewCount) { this.underReviewCount = underReviewCount; }

    public String getUnderReviewPct() { return underReviewPct; }
    public void setUnderReviewPct(String underReviewPct) { this.underReviewPct = underReviewPct; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public List<ComplaintSummaryResponse> getRecentComplaints() { return recentComplaints; }
    public void setRecentComplaints(List<ComplaintSummaryResponse> recentComplaints) { this.recentComplaints = recentComplaints; }
}
