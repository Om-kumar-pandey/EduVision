package com.eduvision.controller;

import com.eduvision.dto.ComplaintResponseDto;
import com.eduvision.dto.CreateComplaintRequest;
import com.eduvision.dto.PublicTrackingDto;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
@Tag(name = "Complaints", description = "Endpoints for grievance submission, tracking, and detail inspection")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @Operation(summary = "Submit a new grievance")
    public ResponseEntity<ComplaintResponseDto> submitComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateComplaintRequest request) {
        ComplaintResponseDto response = complaintService.createComplaint(principal.getUser(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Get list of grievances filed by the authenticated user")
    public ResponseEntity<List<ComplaintResponseDto>> getMyComplaints(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ComplaintResponseDto> complaints = complaintService.getUserComplaints(principal.getUser());
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{trackingId}")
    @Operation(summary = "Get complete grievance details (authorized owner or staff only)")
    public ResponseEntity<ComplaintResponseDto> getComplaintDetails(
            @PathVariable String trackingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponseDto response = complaintService.getComplaintDetails(trackingId, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackingId}")
    @Operation(summary = "Public tracking query for a complaint (safe view without private complainant data)")
    public ResponseEntity<PublicTrackingDto> trackPublicComplaint(@PathVariable String trackingId) {
        PublicTrackingDto trackingInfo = complaintService.getPublicTrackingInfo(trackingId);
        return ResponseEntity.ok(trackingInfo);
    }
}
