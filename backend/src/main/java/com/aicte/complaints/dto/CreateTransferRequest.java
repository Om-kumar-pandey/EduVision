package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTransferRequest {
    @NotNull(message = "Destination Bureau ID is required")
    private Long toBureauId;
    @NotBlank(message = "Transfer justification reason is required")
    private String reason;

    public CreateTransferRequest() {}
    public Long getToBureauId() { return toBureauId; }
    public void setToBureauId(Long toBureauId) { this.toBureauId = toBureauId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
