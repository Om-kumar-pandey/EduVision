package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class RegionDto {
    private Long id;
    private String name;
    private String code;
    private String jurisdictionStates;
    private String coordinatorName;
    private String coordinatorEmail;
    private String status;
    private long totalInstitutions;
    private long totalCases;
    private long pendingCases;
    private long overdueCases;
    private LocalDateTime createdAt;

    public RegionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getJurisdictionStates() { return jurisdictionStates; }
    public void setJurisdictionStates(String jurisdictionStates) { this.jurisdictionStates = jurisdictionStates; }
    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }
    public String getCoordinatorEmail() { return coordinatorEmail; }
    public void setCoordinatorEmail(String coordinatorEmail) { this.coordinatorEmail = coordinatorEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getTotalInstitutions() { return totalInstitutions; }
    public void setTotalInstitutions(long totalInstitutions) { this.totalInstitutions = totalInstitutions; }
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getPendingCases() { return pendingCases; }
    public void setPendingCases(long pendingCases) { this.pendingCases = pendingCases; }
    public long getOverdueCases() { return overdueCases; }
    public void setOverdueCases(long overdueCases) { this.overdueCases = overdueCases; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
