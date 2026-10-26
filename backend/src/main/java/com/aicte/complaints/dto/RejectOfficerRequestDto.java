package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectOfficerRequestDto {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
    private String reason;

    public RejectOfficerRequestDto() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
