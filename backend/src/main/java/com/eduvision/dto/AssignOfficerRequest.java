package com.eduvision.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignOfficerRequest {
    @NotBlank(message = "Assigned officer is required")
    private String assignedOfficer;
    private String assignmentNotes;

    public AssignOfficerRequest() {}

    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
}
