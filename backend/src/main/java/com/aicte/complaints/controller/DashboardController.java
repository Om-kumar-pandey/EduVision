package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.service.AdminService;
import com.aicte.complaints.service.AuditLogService;
import com.aicte.complaints.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN', 'BUREAU_OFFICER', 'REGIONAL_OFFICER')")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuditLogService auditLogService;
    private final AdminService adminService;

    public DashboardController(DashboardService dashboardService,
                               AuditLogService auditLogService,
                               AdminService adminService) {
        this.dashboardService = dashboardService;
        this.auditLogService = auditLogService;
        this.adminService = adminService;
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

    @GetMapping("/region-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRegionDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRegionDistribution()));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAlerts() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAlertsSummary()));
    }

    @GetMapping("/activity-history")
    @PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getActivityHistory(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAuditLogs(action, entityType, page, size)));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam(defaultValue = "CASE_SUMMARY") String reportType,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.generateReport(reportType, dateFrom, dateTo, bureauId, region, status)));
    }
}
