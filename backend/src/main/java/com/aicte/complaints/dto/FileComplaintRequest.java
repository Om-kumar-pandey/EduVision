package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FileComplaintRequest {

    @NotBlank(message = "Institution Permanent ID is required")
    private String institutionPermanentId;

    @NotBlank(message = "Complaint title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    private String priority = "MEDIUM";

    @NotBlank(message = "Detailed description is required")
    private String description;

    private String complainantType;
    private String documentName;

    public FileComplaintRequest() {}

    public String getInstitutionPermanentId() { return institutionPermanentId; }
    public void setInstitutionPermanentId(String institutionPermanentId) { this.institutionPermanentId = institutionPermanentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getComplainantType() { return complainantType; }
    public void setComplainantType(String complainantType) { this.complainantType = complainantType; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
}
