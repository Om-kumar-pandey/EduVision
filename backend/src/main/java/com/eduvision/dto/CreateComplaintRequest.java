package com.eduvision.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class CreateComplaintRequest {

    @NotBlank(message = "Complainant name is required")
    private String complainantName;

    @NotBlank(message = "Complainant email is required")
    private String complainantEmail;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    private String institutionType;
    private String institutionState;

    @NotBlank(message = "Grievance category is required")
    private String category;

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 150, message = "Subject must be between 5 and 150 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(min = 20, message = "Description must be at least 20 characters")
    private String description;

    private LocalDate incidentDate;

    public CreateComplaintRequest() {}

    public String getComplainantName() { return complainantName; }
    public void setComplainantName(String complainantName) { this.complainantName = complainantName; }

    public String getComplainantEmail() { return complainantEmail; }
    public void setComplainantEmail(String complainantEmail) { this.complainantEmail = complainantEmail; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }

    public String getInstitutionState() { return institutionState; }
    public void setInstitutionState(String institutionState) { this.institutionState = institutionState; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
}
