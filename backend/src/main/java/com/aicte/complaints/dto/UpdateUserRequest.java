package com.aicte.complaints.dto;

public class UpdateUserRequest {
    private String fullName;
    private String role;
    private Long bureauId;
    private String designation;
    private String phone;
    private Boolean isActive;
    private String password;

    public UpdateUserRequest() {}
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getBureauId() { return bureauId; }
    public void setBureauId(Long bureauId) { this.bureauId = bureauId; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
