package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.CaseDto;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.CaseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/regional")
@PreAuthorize("hasAnyRole('REGIONAL_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN')")
public class RegionalController {

    private final CaseService caseService;

    public RegionalController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<PagedResponse<CaseDto>>> getRegionalCases(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        String effectiveRegion = region;
        if ((effectiveRegion == null || effectiveRegion.isBlank()) && principal != null && principal.getRegion() != null) {
            effectiveRegion = principal.getRegion();
        }
        if (effectiveRegion == null) {
            effectiveRegion = "Western";
        }

        PagedResponse<CaseDto> response = caseService.getRegionalCases(effectiveRegion, status, priority, query, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRegionalStats(
            @RequestParam(required = false) String region,
            @AuthenticationPrincipal UserPrincipal principal) {

        String effectiveRegion = region;
        if ((effectiveRegion == null || effectiveRegion.isBlank()) && principal != null && principal.getRegion() != null) {
            effectiveRegion = principal.getRegion();
        }
        if (effectiveRegion == null) {
            effectiveRegion = "Western";
        }

        Map<String, Object> stats = caseService.getRegionalStats(effectiveRegion);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/cases/{id}/escalate")
    public ResponseEntity<ApiResponse<CaseDto>> escalateCase(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {

        String reason = body.getOrDefault("reason", "Escalated for supervisory senior authority directive.");
        CaseDto escalated = caseService.escalateRegionalCase(id, reason, principal, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Case successfully escalated to Senior Authority", escalated));
    }
}
