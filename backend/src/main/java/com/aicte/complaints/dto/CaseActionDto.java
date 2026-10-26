package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class CaseActionDto {
    private Long id;
    private Long caseId;
    private Long userId;
    private String userFullName;
    private String userRole;
    private String userBureauCode;
    private String actionType;
    private String fromStatus;
    private String toStatus;
    private String remarks;
    private String nextAction;
    private LocalDateTime nextActionDueDate;
    private LocalDateTime createdAt;

    public CaseActionDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public String getUserBureauCode() { return userBureauCode; }
    public void setUserBureauCode(String userBureauCode) { this.userBureauCode = userBureauCode; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }
    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public LocalDateTime getNextActionDueDate() { return nextActionDueDate; }
    public void setNextActionDueDate(LocalDateTime nextActionDueDate) { this.nextActionDueDate = nextActionDueDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
