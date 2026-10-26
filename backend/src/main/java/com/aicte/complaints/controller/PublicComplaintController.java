package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.PublicTrackingDto;
import com.aicte.complaints.service.CaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/complaints")
public class PublicComplaintController {

    private final CaseService caseService;

    public PublicComplaintController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping("/track/{caseNumber}")
    public ResponseEntity<ApiResponse<PublicTrackingDto>> trackComplaint(@PathVariable String caseNumber) {
        PublicTrackingDto tracking = caseService.trackComplaintPublic(caseNumber);
        return ResponseEntity.ok(ApiResponse.success(tracking));
    }
}
