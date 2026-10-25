package com.eduvision.controller;

import com.eduvision.dto.DashboardSummaryDto;
import com.eduvision.dto.RecentComplaintDto;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Endpoints providing summary statistics and recent grievance activity")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated complaint statistics for the 5 dashboard metric cards")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummaryDto summary = dashboardService.getSummary(principal != null ? principal.getUser() : null);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recent-complaints")
    @Operation(summary = "Get recent complaints matching dashboard table")
    public ResponseEntity<List<RecentComplaintDto>> getRecentComplaints(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RecentComplaintDto> list = dashboardService.getRecentComplaints(principal != null ? principal.getUser() : null);
        return ResponseEntity.ok(list);
    }
}
