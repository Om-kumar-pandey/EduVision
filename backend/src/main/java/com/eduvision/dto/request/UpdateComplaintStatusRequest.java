package com.eduvision.dto.request;

import com.eduvision.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateComplaintStatusRequest {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    private String remarks;

    private String resolutionSummary;

    private String rejectionReason;

    public UpdateComplaintStatusRequest() {}

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
