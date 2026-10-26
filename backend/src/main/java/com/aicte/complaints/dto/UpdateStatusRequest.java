package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class UpdateStatusRequest {
    @NotBlank(message = "New status is required")
    private String status;
    @NotBlank(message = "Remarks are mandatory")
    private String remarks;
    private String nextAction;
    private LocalDateTime nextActionDueDate;

    public UpdateStatusRequest() {}
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public LocalDateTime getNextActionDueDate() { return nextActionDueDate; }
    public void setNextActionDueDate(LocalDateTime nextActionDueDate) { this.nextActionDueDate = nextActionDueDate; }
}
