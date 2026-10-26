package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.repository.CaseRepository;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.OverlapService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/overlaps")
@PreAuthorize("isAuthenticated()")
public class OverlapController {

    private final OverlapService overlapService;
    private final CaseRepository caseRepository;

    public OverlapController(OverlapService overlapService, CaseRepository caseRepository) {
        this.overlapService = overlapService;
        this.caseRepository = caseRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OverlapAlertDto>>> getOverlapAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String decisionStatus,
            @RequestParam(required = false) String reviewBand,
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OverlapAlertDto> result = overlapService.getFilteredOverlaps(
                status, decisionStatus, reviewBand, bureauId, institutionId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OverlapStatsDto>> getOverlapStats() {
        return ResponseEntity.ok(ApiResponse.success(overlapService.getStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OverlapAlertDto>> getOverlapById(@PathVariable Long id) {
        OverlapAlertDto alert = overlapService.getOverlapById(id);
        return ResponseEntity.ok(ApiResponse.success(alert));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CENTRAL_OFFICER', 'CENTRAL_MONITOR', 'BUREAU_OFFICER', 'REGIONAL_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<OverlapAlertDto>> reviewOverlap(
            @PathVariable Long id,
            @Valid @RequestBody ReviewOverlapRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        OverlapAlertDto reviewed = overlapService.reviewOverlap(id, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Overlap review decision recorded successfully", reviewed));
    }

    @PostMapping("/{id}/reopen")
    @PreAuthorize("hasAnyRole('CENTRAL_OFFICER', 'CENTRAL_MONITOR', 'BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<OverlapAlertDto>> reopenOverlap(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String reason = body.getOrDefault("reason", "Administrative review reopened");
        OverlapAlertDto reopened = overlapService.reopenOverlap(id, reason, principal);
        return ResponseEntity.ok(ApiResponse.success("Overlap review successfully reopened for re-investigation", reopened));
    }

    @PostMapping("/reanalyze")
    @PreAuthorize("hasAnyRole('CENTRAL_OFFICER', 'CENTRAL_MONITOR', 'BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> reanalyzeAllCases() {
        List<CaseEntity> allCases = caseRepository.findAll();
        int count = 0;
        for (CaseEntity c : allCases) {
            overlapService.checkForOverlaps(c);
            count++;
        }
        return ResponseEntity.ok(ApiResponse.success("Re-analyzed " + count + " cases with hybrid overlap matching engine."));
    }
}
