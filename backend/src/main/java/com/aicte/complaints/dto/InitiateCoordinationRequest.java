package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class InitiateCoordinationRequest {
    private Long overlapAlertId;

    @NotNull(message = "Primary case ID is required")
    private Long primaryCaseId;

    @NotNull(message = "Linked case ID is required")
    private Long linkedCaseId;

    @NotNull(message = "Target bureau ID is required")
    private Long targetBureauId;

    @NotNull(message = "Coordination reason is mandatory")
    private String reason;

    private LocalDateTime deadline;

    public InitiateCoordinationRequest() {}

    public Long getOverlapAlertId() { return overlapAlertId; }
    public void setOverlapAlertId(Long overlapAlertId) { this.overlapAlertId = overlapAlertId; }
    public Long getPrimaryCaseId() { return primaryCaseId; }
    public void setPrimaryCaseId(Long primaryCaseId) { this.primaryCaseId = primaryCaseId; }
    public Long getLinkedCaseId() { return linkedCaseId; }
    public void setLinkedCaseId(Long linkedCaseId) { this.linkedCaseId = linkedCaseId; }
    public Long getTargetBureauId() { return targetBureauId; }
    public void setTargetBureauId(Long targetBureauId) { this.targetBureauId = targetBureauId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
}
