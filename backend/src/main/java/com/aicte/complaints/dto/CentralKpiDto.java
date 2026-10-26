package com.aicte.complaints.dto;

public class CentralKpiDto {
    private long totalCases;
    private long pendingCases;
    private long underProcessCases;
    private long disposedCases;
    private long transferredCases;
    private long overdueCases;
    private long potentialOverlaps;
    private long unassignedCases;
    private long pendingApprovalRequests;
    private long pendingCoordinationRequests;
    private long criticalEscalatedCases;

    public CentralKpiDto() {}

    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getPendingCases() { return pendingCases; }
    public void setPendingCases(long pendingCases) { this.pendingCases = pendingCases; }
    public long getUnderProcessCases() { return underProcessCases; }
    public void setUnderProcessCases(long underProcessCases) { this.underProcessCases = underProcessCases; }
    public long getDisposedCases() { return disposedCases; }
    public void setDisposedCases(long disposedCases) { this.disposedCases = disposedCases; }
    public long getTransferredCases() { return transferredCases; }
    public void setTransferredCases(long transferredCases) { this.transferredCases = transferredCases; }
    public long getOverdueCases() { return overdueCases; }
    public void setOverdueCases(long overdueCases) { this.overdueCases = overdueCases; }
    public long getPotentialOverlaps() { return potentialOverlaps; }
    public void setPotentialOverlaps(long potentialOverlaps) { this.potentialOverlaps = potentialOverlaps; }
    public long getUnassignedCases() { return unassignedCases; }
    public void setUnassignedCases(long unassignedCases) { this.unassignedCases = unassignedCases; }
    public long getPendingApprovalRequests() { return pendingApprovalRequests; }
    public void setPendingApprovalRequests(long pendingApprovalRequests) { this.pendingApprovalRequests = pendingApprovalRequests; }
    public long getPendingCoordinationRequests() { return pendingCoordinationRequests; }
    public void setPendingCoordinationRequests(long pendingCoordinationRequests) { this.pendingCoordinationRequests = pendingCoordinationRequests; }
    public long getCriticalEscalatedCases() { return criticalEscalatedCases; }
    public void setCriticalEscalatedCases(long criticalEscalatedCases) { this.criticalEscalatedCases = criticalEscalatedCases; }
}
