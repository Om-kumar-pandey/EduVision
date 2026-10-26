package com.eduvision.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/guidelines")
@Tag(name = "Guidelines", description = "Endpoints for grievance submission rules, file criteria, and regulations")
public class GuidelinesController {

    @GetMapping
    @Operation(summary = "Get official complaint filing guidelines, limits and FAQ definitions")
    public ResponseEntity<Map<String, Object>> getGuidelines() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("title", "AICTE Technical Grievance Redressal Protocol");
        data.put("maxFileSize", "5MB");
        data.put("allowedFormats", Arrays.asList("PDF", "JPG", "PNG", "DOC", "DOCX"));
        data.put("resolutionTargetDays", 15);

        List<String> steps = Arrays.asList(
                "Register / Login securely via student or staff credentials",
                "Fill Complaint Form with factual chronological data and institutional parameters",
                "Submit Complaint and receive an official non-guessable CMP tracking ID",
                "Track status milestones, notices, and institutional resolution summary"
        );
        data.put("processSteps", steps);

        return ResponseEntity.ok(data);
    }
}
