package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.dto.TransferRequestDto;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/transfer-requests")
@PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN', 'BUREAU_OFFICER')")
public class TransferRequestController {

    private final AdminService adminService;

    public TransferRequestController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransferRequestDto>>> getTransferRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TransferRequestDto> result = adminService.getTransferRequests(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('CENTRAL_MONITOR', 'SYS_ADMIN')")
    public ResponseEntity<ApiResponse<TransferRequestDto>> decideTransfer(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String remarks = (String) body.get("remarks");
        TransferRequestDto dto = adminService.decideTransfer(id, approve, remarks, principal);
        return ResponseEntity.ok(ApiResponse.success("Inter-Bureau transfer supervisory decision recorded successfully", dto));
    }
}
