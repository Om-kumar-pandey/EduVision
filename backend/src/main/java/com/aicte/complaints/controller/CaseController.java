package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<CaseDto>>> getQueue(
            @RequestParam(required = false) Long bureauId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "receiptDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        PagedResponse<CaseDto> queue = caseService.getQueue(bureauId, status, priority, category, query, sortBy, sortDir, page, size, principal);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CaseDto>> getCaseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        CaseDto caseDto = caseService.getCaseById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(caseDto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CaseDto>> createCase(
            @Valid @RequestBody CreateCaseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CaseDto created = caseService.createCase(request, principal);
        return new ResponseEntity<>(ApiResponse.success("Case successfully created with Case ID: " + created.getCaseNumber(), created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CaseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CaseDto updated = caseService.updateStatus(id, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Case status successfully updated to " + updated.getStatus(), updated));
    }

    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<CaseActionDto>> addAction(
            @PathVariable Long id,
            @Valid @RequestBody AddActionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CaseActionDto action = caseService.addAction(id, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Action remark successfully recorded", action));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<CaseActionDto>>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CaseActionDto> history = caseService.getCaseHistory(id, principal);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/{id}/transfer-requests")
    @PreAuthorize("hasAnyRole('BUREAU_OFFICER', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<TransferRequestDto>> createTransferRequest(
            @PathVariable Long id,
            @Valid @RequestBody CreateTransferRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TransferRequestDto transfer = caseService.createTransferRequest(id, request, principal);
        return new ResponseEntity<>(ApiResponse.success("Inter-Bureau transfer request submitted successfully", transfer), HttpStatus.CREATED);
    }
}
