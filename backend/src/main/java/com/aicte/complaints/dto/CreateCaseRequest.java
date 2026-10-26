package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateCaseRequest {
    private String sourceCaseId;
    @NotBlank(message = "Institution Permanent ID is required")
    private String permanentId;
    @NotNull(message = "Bureau ID is required")
    private Long bureauId;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    @NotBlank(message = "Category is required")
    private String category;
    private String priority = "MEDIUM";
    private LocalDateTime receiptDate;
    private LocalDateTime expectedDisposalDate;

    public CreateCaseRequest() {}
    public String getSourceCaseId() { return sourceCaseId; }
    public void setSourceCaseId(String sourceCaseId) { this.sourceCaseId = sourceCaseId; }
    public String getPermanentId() { return permanentId; }
    public void setPermanentId(String permanentId) { this.permanentId = permanentId; }
    public Long getBureauId() { return bureauId; }
    public void setBureauId(Long bureauId) { this.bureauId = bureauId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDateTime getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDateTime receiptDate) { this.receiptDate = receiptDate; }
    public LocalDateTime getExpectedDisposalDate() { return expectedDisposalDate; }
    public void setExpectedDisposalDate(LocalDateTime expectedDisposalDate) { this.expectedDisposalDate = expectedDisposalDate; }
}
