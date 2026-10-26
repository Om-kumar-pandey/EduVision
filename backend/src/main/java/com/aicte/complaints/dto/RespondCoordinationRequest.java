package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;

public class RespondCoordinationRequest {
    @NotBlank(message = "Action decision is required: ACCEPTED or DECLINED")
    private String decision; // ACCEPTED, DECLINED, COMPLETED

    private String remarks;
    private String documentRef;

    public RespondCoordinationRequest() {}

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }
}
