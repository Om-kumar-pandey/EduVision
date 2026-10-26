package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class BureauDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String contactEmail;
    private Boolean isActive;
    private Long totalCases;
    private Long pendingCases;
    private Long overdueCases;
    private LocalDateTime createdAt;

    public BureauDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Long getTotalCases() { return totalCases; }
    public void setTotalCases(Long totalCases) { this.totalCases = totalCases; }
    public Long getPendingCases() { return pendingCases; }
    public void setPendingCases(Long pendingCases) { this.pendingCases = pendingCases; }
    public Long getOverdueCases() { return overdueCases; }
    public void setOverdueCases(Long overdueCases) { this.overdueCases = overdueCases; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
