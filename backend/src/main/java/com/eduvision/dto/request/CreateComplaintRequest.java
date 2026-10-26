package com.eduvision.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateComplaintRequest {

    private Long institutionId;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    private String institutionType;

    @NotBlank(message = "Category is required")
    private String category;

    private String subject;

    @NotBlank(message = "Detailed description is required")
    @Size(min = 15, message = "Please provide at least 15 characters describing the issue")
    private String description;

    private LocalDate incidentDate;

    @NotNull(message = "You must accept the truthfulness declaration")
    @AssertTrue(message = "You must accept the truthfulness declaration")
    private Boolean declarationAccepted;

    public CreateComplaintRequest() {}

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() {
        if (subject != null && !subject.trim().isEmpty()) {
            return subject.trim();
        }
        if (description != null && !description.trim().isEmpty()) {
            String trimmed = description.trim().replaceAll("\\s+", " ");
            return trimmed.length() > 80 ? trimmed.substring(0, 77) + "..." : trimmed;
        }
        return "Complaint Details";
    }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public Boolean getDeclarationAccepted() { return declarationAccepted; }
    public void setDeclarationAccepted(Boolean declarationAccepted) { this.declarationAccepted = declarationAccepted; }
}
