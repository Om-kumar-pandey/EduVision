package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.AdminService;
import com.aicte.complaints.service.AuditLogService;
import com.aicte.complaints.service.CaseService;
import com.aicte.complaints.service.CsvImportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('SYS_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CsvImportService csvImportService;
    private final AuditLogService auditLogService;
    private final CaseService caseService;
    private final com.aicte.complaints.service.OfficerRegistrationService officerRegistrationService;

    public AdminController(AdminService adminService,
                           CsvImportService csvImportService,
                           AuditLogService auditLogService,
                           CaseService caseService,
                           com.aicte.complaints.service.OfficerRegistrationService officerRegistrationService) {
        this.adminService = adminService;
        this.csvImportService = csvImportService;
        this.auditLogService = auditLogService;
        this.caseService = caseService;
        this.officerRegistrationService = officerRegistrationService;
    }

    // ==========================================
    // OFFICER ACCESS REQUESTS (RB & PGRC)
    // ==========================================

    @GetMapping("/officer-requests")
    public ResponseEntity<ApiResponse<PagedResponse<OfficerRegistrationRequestDto>>> getOfficerRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bureauCode,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OfficerRegistrationRequestDto> res = officerRegistrationService.getRequests(status, bureauCode, query, page, size);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/officer-requests/{id}")
    public ResponseEntity<ApiResponse<OfficerRegistrationRequestDto>> getOfficerRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(officerRegistrationService.getRequestById(id)));
    }

    @PostMapping("/officer-requests/{id}/approve")
    public ResponseEntity<ApiResponse<OfficerRegistrationRequestDto>> approveOfficerRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveOfficerRequestDto request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ip = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
        if (request == null) request = new ApproveOfficerRequestDto();
        OfficerRegistrationRequestDto approved = officerRegistrationService.approveRequest(id, request, adminPrincipal, ip);
        return ResponseEntity.ok(ApiResponse.success("Officer registration request approved successfully. Activation instructions dispatched.", approved));
    }

    @PostMapping("/officer-requests/{id}/reject")
    public ResponseEntity<ApiResponse<OfficerRegistrationRequestDto>> rejectOfficerRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectOfficerRequestDto request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ip = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
        OfficerRegistrationRequestDto rejected = officerRegistrationService.rejectRequest(id, request, adminPrincipal, ip);
        return ResponseEntity.ok(ApiResponse.success("Officer registration request rejected.", rejected));
    }

    // ==========================================
    // TAB 1: DASHBOARD STATS
    // ==========================================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ==========================================
    // TAB 2: USERS & ROLES
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers(role, bureauId, region, isActive, query, page, size)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserDetails(id)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        UserDto created = adminService.createUser(request, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("User account created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        UserDto updated = adminService.updateUser(id, request, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("User account updated successfully", updated));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String newPassword = body.get("newPassword");
        adminService.resetPassword(id, newPassword, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("User password has been reset successfully."));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        UserDto dto = adminService.toggleUserStatus(id, active, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("User account status updated.", dto));
    }

    // ==========================================
    // TAB 3: INSTITUTIONS
    // ==========================================

    @GetMapping("/institutions")
    public ResponseEntity<ApiResponse<PagedResponse<InstitutionDto>>> getInstitutions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getInstitutions(query, region, page, size)));
    }

    @GetMapping("/institutions/{id}")
    public ResponseEntity<ApiResponse<InstitutionDto>> getInstitutionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getInstitutionDetails(id)));
    }

    @PostMapping("/institutions")
    public ResponseEntity<ApiResponse<InstitutionDto>> createInstitution(
            @RequestBody InstitutionDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        InstitutionDto created = adminService.createInstitution(dto, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("Institution successfully registered", created), HttpStatus.CREATED);
    }

    @PatchMapping("/institutions/{id}")
    public ResponseEntity<ApiResponse<InstitutionDto>> updateInstitution(
            @PathVariable Long id,
            @RequestBody InstitutionDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        InstitutionDto updated = adminService.updateInstitution(id, dto, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Institution details updated successfully", updated));
    }

    @PatchMapping("/institutions/{id}/verify")
    public ResponseEntity<ApiResponse<InstitutionDto>> verifyInstitution(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        boolean isVerified = Boolean.TRUE.equals(body.get("verified"));
        InstitutionDto dto = adminService.verifyInstitution(id, isVerified, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Institution verification status updated", dto));
    }

    // ==========================================
    // TAB 4: BUREAUS & CELLS
    // ==========================================

    @GetMapping("/bureaus")
    public ResponseEntity<ApiResponse<List<BureauDto>>> getBureaus() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBureausDetailed()));
    }

    @PostMapping("/bureaus")
    public ResponseEntity<ApiResponse<BureauDto>> createBureau(
            @RequestBody BureauDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        BureauDto created = adminService.createBureau(dto, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("Bureau/Cell created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/bureaus/{id}")
    public ResponseEntity<ApiResponse<BureauDto>> updateBureau(
            @PathVariable Long id,
            @RequestBody BureauDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        BureauDto updated = adminService.updateBureau(id, dto, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Bureau/Cell updated successfully", updated));
    }

    @GetMapping("/transfer-requests")
    public ResponseEntity<ApiResponse<PagedResponse<TransferRequestDto>>> getTransferRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTransferRequests(status, page, size)));
    }

    @PatchMapping("/transfer-requests/{id}/decision")
    public ResponseEntity<ApiResponse<TransferRequestDto>> decideTransfer(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String remarks = (String) body.get("remarks");
        TransferRequestDto dto = adminService.decideTransfer(id, approve, remarks, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Transfer decision recorded successfully", dto));
    }

    // ==========================================
    // TAB 5: REGIONS
    // ==========================================

    @GetMapping("/regions")
    public ResponseEntity<ApiResponse<List<RegionDto>>> getRegions() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllRegions()));
    }

    @PostMapping("/regions")
    public ResponseEntity<ApiResponse<RegionDto>> createRegion(
            @RequestBody RegionDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        RegionDto created = adminService.createRegion(dto, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("Regional jurisdiction created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/regions/{id}")
    public ResponseEntity<ApiResponse<RegionDto>> updateRegion(
            @PathVariable Long id,
            @RequestBody RegionDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        RegionDto updated = adminService.updateRegion(id, dto, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Regional jurisdiction updated successfully", updated));
    }

    // ==========================================
    // TAB 6: CASES & WORKFLOW
    // ==========================================

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<PagedResponse<CaseDto>>> getCases(
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAdminCases(bureauId, status, priority, category, query, page, size)));
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ApiResponse<CaseDto>> getCaseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        return ResponseEntity.ok(ApiResponse.success(caseService.getCaseById(id, adminPrincipal)));
    }

    @PatchMapping("/cases/{id}/assign")
    public ResponseEntity<ApiResponse<CaseDto>> assignCase(
            @PathVariable Long id,
            @RequestBody AssignCaseRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        CaseDto dto = adminService.assignCase(id, request, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Case successfully assigned", dto));
    }

    @PatchMapping("/cases/{id}/status")
    public ResponseEntity<ApiResponse<CaseDto>> updateCaseStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String status = body.get("status");
        String remarks = body.get("remarks");
        CaseDto dto = adminService.updateCaseStatus(id, status, remarks, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Case status updated successfully to " + dto.getStatus(), dto));
    }

    @PostMapping("/cases/{id}/notes")
    public ResponseEntity<ApiResponse<CaseActionDto>> recordInternalNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String note = body.get("note");
        CaseActionDto dto = adminService.recordInternalNote(id, note, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Internal administrative note recorded", dto));
    }

    @PostMapping("/cases/{id}/request-response")
    public ResponseEntity<ApiResponse<CaseActionDto>> requestInstitutionResponse(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String reason = body.get("reason");
        CaseActionDto dto = adminService.requestInstitutionResponse(id, reason, null, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Institution clarification requested", dto));
    }

    @PostMapping("/cases/{id}/institution-response")
    public ResponseEntity<ApiResponse<CaseActionDto>> recordInstitutionResponse(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String responseText = body.get("response");
        CaseActionDto dto = adminService.recordInstitutionResponse(id, responseText, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Institution response recorded", dto));
    }

    @PostMapping("/cases/{id}/review-duplicate")
    public ResponseEntity<ApiResponse<CaseDto>> reviewDuplicateCase(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        Long duplicateOfCaseId = body.get("duplicateOfCaseId") != null ? Long.valueOf(body.get("duplicateOfCaseId").toString()) : null;
        String decision = (String) body.get("decision");
        String remarks = (String) body.get("remarks");
        CaseDto dto = adminService.reviewDuplicateCase(id, duplicateOfCaseId, decision, remarks, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Duplicate case review decision recorded", dto));
    }

    // ==========================================
    // TAB 7: REPORTS
    // ==========================================

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.generateReport(reportType, dateFrom, dateTo, bureauId, region, status)));
    }

    // ==========================================
    // TAB 8: SYSTEM SETTINGS
    // ==========================================

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSettings()));
    }

    @PostMapping("/settings")
    public ResponseEntity<ApiResponse<String>> updateSettings(
            @RequestBody Map<String, String> settings,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        adminService.updateSettings(settings, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Platform settings updated successfully"));
    }

    // ==========================================
    // TAB 9: AUDIT LOGS
    // ==========================================

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAuditLogs(action, entityType, page, size)));
    }

    // ==========================================
    // TAB 10: DATA IMPORT
    // ==========================================

    @PostMapping(value = "/import-csv/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CsvPreviewResponse>> previewCsv(
            @RequestParam("file") MultipartFile file) {
        CsvPreviewResponse preview = csvImportService.previewCsv(file);
        return ResponseEntity.ok(ApiResponse.success("CSV file validated successfully", preview));
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportBatchDto>> importCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        ImportBatchDto batch = csvImportService.importCsv(file, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("CSV bulk import executed successfully with Batch ID: " + batch.getBatchId(), batch), HttpStatus.CREATED);
    }

    @GetMapping("/import-batches")
    public ResponseEntity<ApiResponse<PagedResponse<ImportBatchDto>>> getImportBatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(csvImportService.getImportBatches(page, size)));
    }

    @GetMapping("/import-batches/{id}")
    public ResponseEntity<ApiResponse<ImportBatchDto>> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(csvImportService.getBatchById(id)));
    }

    // ==========================================
    // TAB 11: HELP & SUPPORT TICKETS
    // ==========================================

    @GetMapping("/support-tickets")
    public ResponseEntity<ApiResponse<PagedResponse<SupportTicketDto>>> getSupportTickets(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSupportTickets(status, page, size)));
    }

    @PostMapping("/support-tickets")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createSupportTicket(
            @RequestBody SupportTicketDto dto,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        SupportTicketDto created = adminService.createSupportTicket(dto, adminPrincipal);
        return new ResponseEntity<>(ApiResponse.success("Technical support request submitted", created), HttpStatus.CREATED);
    }

    @PatchMapping("/support-tickets/{id}")
    public ResponseEntity<ApiResponse<SupportTicketDto>> updateSupportTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String status = body.get("status");
        String resolutionNotes = body.get("resolutionNotes");
        SupportTicketDto updated = adminService.updateSupportTicket(id, status, resolutionNotes, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Support ticket updated successfully", updated));
    }

    // ==========================================
    // TOP NAV: GLOBAL SEARCH & NOTIFICATIONS
    // ==========================================

    @GetMapping("/global-search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "q", required = false) String q) {
        String searchQuery = (query != null && !query.isBlank()) ? query : (q != null ? q : "");
        return ResponseEntity.ok(ApiResponse.success(adminService.globalSearch(searchQuery)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getNotifications()));
    }
}
