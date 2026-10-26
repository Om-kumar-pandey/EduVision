package com.eduvision.controller;

import com.eduvision.dto.*;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'AICTE_OFFICER', 'INSTITUTION_HEAD', 'HOD')")
@Tag(name = "Admin / Officer", description = "Endpoints for grievance administration, officer assignment, status workflow, and CSV reporting")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/complaints")
    @Operation(summary = "Get list of all grievances across technical institutions")
    public ResponseEntity<List<ComplaintResponseDto>> getAllComplaints() {
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    @PatchMapping("/complaints/{trackingId}/status")
    @Operation(summary = "Update grievance status with mandatory remarks or rejection reason")
    public ResponseEntity<ComplaintResponseDto> updateStatus(
            @PathVariable String trackingId,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto response = adminService.updateStatus(trackingId, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/complaints/{trackingId}/assignment")
    @Operation(summary = "Assign a grievance to a designated regional officer or institutional ombudsman")
    public ResponseEntity<ComplaintResponseDto> assignOfficer(
            @PathVariable String trackingId,
            @Valid @RequestBody AssignOfficerRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto response = adminService.assignOfficer(trackingId, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports/complaints")
    @Operation(summary = "Export grievance records as a downloadable CSV report")
    public ResponseEntity<String> exportComplaintsCsv() {
        String csvData = adminService.exportComplaintsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"eduvision_complaints_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users and roles")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
}
