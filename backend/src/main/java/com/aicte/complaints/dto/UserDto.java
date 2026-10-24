package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private Long bureauId;
    private String bureauCode;
    private String bureauName;
    private String designation;
    private String phone;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public UserDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getBureauId() { return bureauId; }
    public void setBureauId(Long bureauId) { this.bureauId = bureauId; }
    public String getBureauCode() { return bureauCode; }
    public void setBureauCode(String bureauCode) { this.bureauCode = bureauCode; }
    public String getBureauName() { return bureauName; }
    public void setBureauName(String bureauName) { this.bureauName = bureauName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
