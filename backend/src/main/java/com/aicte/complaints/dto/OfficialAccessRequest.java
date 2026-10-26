package com.aicte.complaints.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OfficialAccessRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Official email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    private String phone;

    @NotBlank(message = "Role is required")
    private String requestedRole;

    private String organizationUnit;

    @NotBlank(message = "Justification is required")
    @Size(max = 500)
    private String justification;

    public OfficialAccessRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }
    public String getOrganizationUnit() { return organizationUnit; }
    public void setOrganizationUnit(String organizationUnit) { this.organizationUnit = organizationUnit; }
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
}
