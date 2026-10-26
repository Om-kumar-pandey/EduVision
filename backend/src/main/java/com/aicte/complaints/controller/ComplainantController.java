package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.CaseDto;
import com.aicte.complaints.dto.FileComplaintRequest;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.CaseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complainant")
@PreAuthorize("isAuthenticated()")
public class ComplainantController {

    private final CaseService caseService;

    public ComplainantController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<CaseDto>> fileComplaint(
            @Valid @RequestBody FileComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        CaseDto created = caseService.fileComplaintByComplainant(request, principal, httpRequest);
        return new ResponseEntity<>(
                ApiResponse.success("Complaint successfully filed with Reference ID: " + created.getCaseNumber(), created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/my-complaints")
    public ResponseEntity<ApiResponse<List<CaseDto>>> getMyComplaints(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CaseDto> list = caseService.getComplainantCases(principal);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
