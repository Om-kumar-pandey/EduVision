package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class InstitutionDto {
    private Long id;
    private String permanentId;
    private String name;
    private String region;
    private String state;
    private String city;
    private String address;
    private String institutionType;
    private String approvalStatus;
    private String contactEmail;
    private String contactPhone;
    private Boolean isVerified;
    private long totalCases;
    private long activeCases;
    private long disposedCases;
    private LocalDateTime createdAt;

    public InstitutionDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPermanentId() { return permanentId; }
    public void setPermanentId(String permanentId) { this.permanentId = permanentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    public long getActiveCases() { return activeCases; }
    public void setActiveCases(long activeCases) { this.activeCases = activeCases; }
    public long getDisposedCases() { return disposedCases; }
    public void setDisposedCases(long disposedCases) { this.disposedCases = disposedCases; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
