package com.aicte.complaints.dto;

public class BureauWorkloadDto {
    private Long bureauId;
    private String bureauCode;
    private String bureauName;
    private long totalCases;
    private long receivedCases;
    private long underProcessCases;
    private long disposedCases;
    private long overdueCases;

    public BureauWorkloadDto() {}
    public BureauWorkloadDto(Long bureauId, String bureauCode, String bureauName, long totalCases, long receivedCases, long underProcessCases, long disposedCases, long overdueCases) {
        this.bureauId = bureauId;
        this.bureauCode = bureauCode;
        this.bureauName = bureauName;
        this.totalCases = totalCases;
        this.receivedCases = receivedCases;
        this.underProcessCases = underProcessCases;
        this.disposedCases = disposedCases;
        this.overdueCases = overdueCases;
    }
    public Long getBureauId() { return bureauId; }
    public void setBureauId(Long bureauId) { this.bureauId = bureauId; }
    public String getBureauCode() { return bureauCode; }
    public void setBureauCode(String bureauCode) { this.bureauCode = bureauCode; }
    public String getBureauName() { return bureauName; }
    public void setBureauName(String bureauName) { this.bureauName = bureauName; }
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getReceivedCases() { return receivedCases; }
    public void setReceivedCases(long receivedCases) { this.receivedCases = receivedCases; }
    public long getUnderProcessCases() { return underProcessCases; }
    public void setUnderProcessCases(long underProcessCases) { this.underProcessCases = underProcessCases; }
    public long getDisposedCases() { return disposedCases; }
    public void setDisposedCases(long disposedCases) { this.disposedCases = disposedCases; }
    public long getOverdueCases() { return overdueCases; }
    public void setOverdueCases(long overdueCases) { this.overdueCases = overdueCases; }
}
