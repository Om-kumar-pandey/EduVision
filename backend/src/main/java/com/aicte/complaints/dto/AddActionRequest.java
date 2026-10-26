package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class AddActionRequest {
    private String actionType = "REMARK_ADDED";
    @NotBlank(message = "Remarks cannot be empty")
    private String remarks;
    private String nextAction;
    private LocalDateTime nextActionDueDate;

    public AddActionRequest() {}
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public LocalDateTime getNextActionDueDate() { return nextActionDueDate; }
    public void setNextActionDueDate(LocalDateTime nextActionDueDate) { this.nextActionDueDate = nextActionDueDate; }
}
