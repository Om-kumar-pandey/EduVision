package com.aicte.complaints.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SubmitOfficerRequestDto {

    @NotBlank(message = "Full name is required")
    @Size(max = 150)
    private String fullName;

    @NotBlank(message = "Official email address is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Employee/Officer ID is required")
    @Size(max = 50)
    private String employeeId;

    @NotBlank(message = "Requested Bureau / Cell is required (RB or PGRC)")
    private String requestedBureauCode; // "RB" or "PGRC"

    @NotBlank(message = "Official designation is required")
    @Size(max = 100)
    private String designation;

    @NotBlank(message = "Department or organizational unit is required")
    @Size(max = 150)
    private String department;

    private String phone;

    @NotBlank(message = "Official verification information or justification is required")
    @Size(max = 1000)
    private String verificationInfo;

    public SubmitOfficerRequestDto() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getRequestedBureauCode() { return requestedBureauCode; }
    public void setRequestedBureauCode(String requestedBureauCode) { this.requestedBureauCode = requestedBureauCode; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVerificationInfo() { return verificationInfo; }
    public void setVerificationInfo(String verificationInfo) { this.verificationInfo = verificationInfo; }
}
