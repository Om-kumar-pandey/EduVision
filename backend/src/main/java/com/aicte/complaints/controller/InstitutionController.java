package com.aicte.complaints.controller;

import com.aicte.complaints.dto.ApiResponse;
import com.aicte.complaints.dto.CaseDto;
import com.aicte.complaints.dto.InstitutionDto;
import com.aicte.complaints.dto.OverlapAlertDto;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/institutions")
@PreAuthorize("isAuthenticated()")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<InstitutionDto>>> searchInstitutions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<InstitutionDto> result = institutionService.searchInstitutions(query, region, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InstitutionDto>> getInstitutionById(@PathVariable Long id) {
        InstitutionDto inst = institutionService.getInstitutionById(id);
        return ResponseEntity.ok(ApiResponse.success(inst));
    }

    @GetMapping("/permanent-id/{permanentId}")
    public ResponseEntity<ApiResponse<InstitutionDto>> getInstitutionByPermanentId(@PathVariable String permanentId) {
        InstitutionDto inst = institutionService.getInstitutionByPermanentId(permanentId);
        return ResponseEntity.ok(ApiResponse.success(inst));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<CaseDto>>> getInstitutionHistory(@PathVariable Long id) {
        List<CaseDto> history = institutionService.getInstitutionCaseHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/{id}/overlaps")
    public ResponseEntity<ApiResponse<List<OverlapAlertDto>>> getInstitutionOverlaps(@PathVariable Long id) {
        List<OverlapAlertDto> overlaps = institutionService.getInstitutionOverlaps(id);
        return ResponseEntity.ok(ApiResponse.success(overlaps));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInstitutionStats(@PathVariable Long id) {
        Map<String, Object> stats = institutionService.getInstitutionStats(id);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
