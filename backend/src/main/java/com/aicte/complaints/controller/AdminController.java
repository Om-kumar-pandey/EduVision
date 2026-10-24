package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.AdminService;
import com.aicte.complaints.service.AuditLogService;
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

    public AdminController(AdminService adminService,
                           CsvImportService csvImportService,
                           AuditLogService auditLogService) {
        this.adminService = adminService;
        this.csvImportService = csvImportService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers(page, size)));
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

    @GetMapping("/bureaus")
    public ResponseEntity<ApiResponse<List<BureauDto>>> getBureaus() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBureaus()));
    }

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

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAuditLogs(action, entityType, page, size)));
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
}
