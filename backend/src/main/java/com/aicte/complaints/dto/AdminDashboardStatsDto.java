package com.aicte.complaints.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsDto {
    private long totalInstitutions;
    private long totalCases;
    private long pendingCases;
    private long overdueCases;
    private long unassignedCases;
    private long potentialDuplicateCases;
    private List<BureauWorkloadDto> casesByBureau;
    private Map<String, Long> casesByStatus;
    private List<RegionDto> regionSummary;
    private List<CaseDto> recentCases;
    private List<AuditLogDto> recentActivities;

    public AdminDashboardStatsDto() {}

    public long getTotalInstitutions() { return totalInstitutions; }
    public void setTotalInstitutions(long totalInstitutions) { this.totalInstitutions = totalInstitutions; }
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getPendingCases() { return pendingCases; }
    public void setPendingCases(long pendingCases) { this.pendingCases = pendingCases; }
    public long getOverdueCases() { return overdueCases; }
    public void setOverdueCases(long overdueCases) { this.overdueCases = overdueCases; }
    public long getUnassignedCases() { return unassignedCases; }
    public void setUnassignedCases(long unassignedCases) { this.unassignedCases = unassignedCases; }
    public long getPotentialDuplicateCases() { return potentialDuplicateCases; }
    public void setPotentialDuplicateCases(long potentialDuplicateCases) { this.potentialDuplicateCases = potentialDuplicateCases; }
    public List<BureauWorkloadDto> getCasesByBureau() { return casesByBureau; }
    public void setCasesByBureau(List<BureauWorkloadDto> casesByBureau) { this.casesByBureau = casesByBureau; }
    public Map<String, Long> getCasesByStatus() { return casesByStatus; }
    public void setCasesByStatus(Map<String, Long> casesByStatus) { this.casesByStatus = casesByStatus; }
    public List<RegionDto> getRegionSummary() { return regionSummary; }
    public void setRegionSummary(List<RegionDto> regionSummary) { this.regionSummary = regionSummary; }
    public List<CaseDto> getRecentCases() { return recentCases; }
    public void setRecentCases(List<CaseDto> recentCases) { this.recentCases = recentCases; }
    public List<AuditLogDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<AuditLogDto> recentActivities) { this.recentActivities = recentActivities; }
}
