package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.OverlapAlertDto;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.dto.ReviewOverlapRequest;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.OverlapService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/overlaps")
@PreAuthorize("isAuthenticated()")
public class OverlapController {

    private final OverlapService overlapService;

    public OverlapController(OverlapService overlapService) {
        this.overlapService = overlapService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OverlapAlertDto>>> getOverlapAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OverlapAlertDto> result = overlapService.getOverlapAlerts(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OverlapAlertDto>> getOverlapById(@PathVariable Long id) {
        OverlapAlertDto alert = overlapService.getOverlapById(id);
        return ResponseEntity.ok(ApiResponse.success(alert));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<OverlapAlertDto>> reviewOverlap(
            @PathVariable Long id,
            @Valid @RequestBody ReviewOverlapRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OverlapAlertDto reviewed = overlapService.reviewOverlap(id, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Overlap alert successfully reviewed and classified", reviewed));
    }
}
