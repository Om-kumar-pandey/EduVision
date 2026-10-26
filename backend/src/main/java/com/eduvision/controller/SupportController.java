package com.eduvision.controller;

import com.eduvision.dto.SupportRequestDto;
import com.eduvision.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/support-requests")
@Tag(name = "Support", description = "Endpoints for public help desk and technical inquiry submissions")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @PostMapping
    @Operation(summary = "Submit a helpdesk inquiry or technical support request")
    public ResponseEntity<Map<String, String>> submitSupportRequest(@Valid @RequestBody SupportRequestDto request) {
        supportService.saveSupportRequest(request);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Your inquiry has been received. Our helpdesk team will review and reply shortly.");
        return ResponseEntity.ok(res);
    }
}
