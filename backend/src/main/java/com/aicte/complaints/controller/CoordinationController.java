package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.OverlapService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coordination-requests")
@PreAuthorize("isAuthenticated()")
public class CoordinationController {

    private final OverlapService overlapService;

    public CoordinationController(OverlapService overlapService) {
        this.overlapService = overlapService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CoordinationRequestDto>>> getCoordinationRequests(
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<CoordinationRequestDto> result = overlapService.getCoordinationRequests(bureauId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'CENTRAL_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CoordinationRequestDto>> initiateCoordination(
            @Valid @RequestBody InitiateCoordinationRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        CoordinationRequestDto created = overlapService.initiateCoordination(req, principal);
        return new ResponseEntity<>(ApiResponse.success("Cross-Bureau coordination request successfully submitted", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'CENTRAL_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CoordinationRequestDto>> respondToCoordination(
            @PathVariable Long id,
            @Valid @RequestBody RespondCoordinationRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        CoordinationRequestDto updated = overlapService.respondToCoordination(id, req, principal);
        return ResponseEntity.ok(ApiResponse.success("Coordination response recorded successfully", updated));
    }
}
