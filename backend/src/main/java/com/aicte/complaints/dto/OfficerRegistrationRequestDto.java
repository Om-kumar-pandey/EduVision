package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class OfficerRegistrationRequestDto {
    private Long id;
    private String requestId;
    private String fullName;
    private String email;
    private String employeeId;
    private String requestedRole;
    private String requestedBureauCode;
    private String requestedBureauName;
    private String designation;
    private String department;
    private String phone;
    private String verificationInfo;
    private String status;
    private String rejectionReason;
    private String activationToken;
    private LocalDateTime tokenExpiry;
    private Boolean isActivated;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime createdAt;

    public OfficerRegistrationRequestDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
    public String getRequestedBureauCode() { return requestedBureauCode; }
    public void setRequestedBureauCode(String requestedBureauCode) { this.requestedBureauCode = requestedBureauCode; }
    public String getRequestedBureauName() { return requestedBureauName; }
    public void setRequestedBureauName(String requestedBureauName) { this.requestedBureauName = requestedBureauName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVerificationInfo() { return verificationInfo; }
    public void setVerificationInfo(String verificationInfo) { this.verificationInfo = verificationInfo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getActivationToken() { return activationToken; }
    public void setActivationToken(String activationToken) { this.activationToken = activationToken; }
    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
    public Boolean getIsActivated() { return isActivated; }
    public void setIsActivated(Boolean isActivated) { this.isActivated = isActivated; }
    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
