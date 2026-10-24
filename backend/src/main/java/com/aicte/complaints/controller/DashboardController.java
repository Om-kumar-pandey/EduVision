package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/central-kpis")
    public ResponseEntity<ApiResponse<CentralKpiDto>> getCentralKpis() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getCentralKpis()));
    }

    @GetMapping("/bureau-workload")
    public ResponseEntity<ApiResponse<List<BureauWorkloadDto>>> getBureauWorkload() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getBureauWorkloads()));
    }

    @GetMapping("/monthly-trends")
    public ResponseEntity<ApiResponse<MonthlyTrendDto>> getMonthlyTrends() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlyTrends()));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAlerts() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAlertsSummary()));
    }
}
