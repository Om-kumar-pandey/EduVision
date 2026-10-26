package com.eduvision.dto.response;

import com.eduvision.entity.Role;
import java.time.LocalDateTime;

public class UserProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String rollOrEmpId;
    private Role role;
    private String phoneNumber;
    private Long institutionId;
    private String institutionName;
    private String department;
    private LocalDateTime createdAt;

    public UserProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRollOrEmpId() { return rollOrEmpId; }
    public void setRollOrEmpId(String rollOrEmpId) { this.rollOrEmpId = rollOrEmpId; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
