package com.aicte.complaints.service;

import com.aicte.complaints.dto.OverlapAlertDto;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.dto.ReviewOverlapRequest;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.Institution;
import com.aicte.complaints.entity.OverlapAlert;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.CaseRepository;
import com.aicte.complaints.repository.OverlapAlertRepository;
import com.aicte.complaints.repository.UserRepository;
import com.aicte.complaints.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OverlapService {

    private final OverlapAlertRepository overlapAlertRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public OverlapService(OverlapAlertRepository overlapAlertRepository,
                          CaseRepository caseRepository,
                          UserRepository userRepository,
                          AuditLogService auditLogService) {
        this.overlapAlertRepository = overlapAlertRepository;
        this.caseRepository = caseRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public void checkForOverlaps(CaseEntity newCase) {
        if ("DISPOSED".equalsIgnoreCase(newCase.getStatus())) {
            return;
        }

        Institution institution = newCase.getInstitution();
        Long bureauId = newCase.getBureau().getId();

        // Find active cases for the same institution under different bureaus
        List<CaseEntity> otherActiveCases = caseRepository.findActiveCasesForOtherBureaus(institution.getId(), bureauId);

        for (CaseEntity otherCase : otherActiveCases) {
            if (otherCase.getId().equals(newCase.getId())) {
                continue;
            }

            Optional<OverlapAlert> existing = overlapAlertRepository.findExistingPair(newCase.getId(), otherCase.getId());
            if (existing.isEmpty()) {
                OverlapAlert alert = new OverlapAlert(institution, newCase, otherCase);
                overlapAlertRepository.save(alert);

                auditLogService.logAction(
                        null,
                        "SYSTEM",
                        "OVERLAP_DETECTED",
                        "OVERLAP_ALERT",
                        alert.getId().toString(),
                        "Cross-bureau overlap alert detected between Case " + newCase.getCaseNumber() +
                        " (" + newCase.getBureau().getCode() + ") and Case " + otherCase.getCaseNumber() +
                        " (" + otherCase.getBureau().getCode() + ") for Institution: " + institution.getPermanentId(),
                        "127.0.0.1"
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<OverlapAlertDto> getOverlapAlerts(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OverlapAlert> alertsPage = overlapAlertRepository.findAllWithFilter(status, pageable);

        List<OverlapAlertDto> dtos = alertsPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                alertsPage.getNumber(),
                alertsPage.getSize(),
                alertsPage.getTotalElements(),
                alertsPage.getTotalPages(),
                alertsPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public OverlapAlertDto getOverlapById(Long id) {
        OverlapAlert alert = overlapAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overlap alert not found with ID: " + id));
        return mapToDto(alert);
    }

    @Transactional(readOnly = true)
    public List<OverlapAlertDto> getOverlapsForInstitution(Long institutionId) {
        List<OverlapAlert> alerts = overlapAlertRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
        return alerts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public OverlapAlertDto reviewOverlap(Long id, ReviewOverlapRequest request, UserPrincipal principal) {
        OverlapAlert alert = overlapAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overlap alert not found with ID: " + id));

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        alert.setStatus("REVIEWED");
        alert.setClassification(request.getClassification().toUpperCase());
        alert.setReviewRemarks(request.getReviewRemarks());
        alert.setReviewedBy(user);
        alert.setReviewedAt(LocalDateTime.now());

        OverlapAlert updated = overlapAlertRepository.save(alert);

        auditLogService.logAction(
                user,
                user.getEmail(),
                "OVERLAP_REVIEWED",
                "OVERLAP_ALERT",
                alert.getId().toString(),
                "Overlap alert reviewed and classified as " + request.getClassification() +
                ". Remarks: " + request.getReviewRemarks(),
                "127.0.0.1"
        );

        return mapToDto(updated);
    }

    public OverlapAlertDto mapToDto(OverlapAlert a) {
        OverlapAlertDto dto = new OverlapAlertDto();
        dto.setId(a.getId());
        if (a.getInstitution() != null) {
            dto.setInstitutionId(a.getInstitution().getId());
            dto.setInstitutionName(a.getInstitution().getName());
            dto.setPermanentId(a.getInstitution().getPermanentId());
            dto.setRegion(a.getInstitution().getRegion());
            dto.setState(a.getInstitution().getState());
            dto.setCity(a.getInstitution().getCity());
        }

        if (a.getCase1() != null) {
            dto.setCase1Id(a.getCase1().getId());
            dto.setCase1Number(a.getCase1().getCaseNumber());
            dto.setCase1Title(a.getCase1().getTitle());
            dto.setCase1BureauCode(a.getCase1().getBureau().getCode());
            dto.setCase1BureauName(a.getCase1().getBureau().getName());
            dto.setCase1Status(a.getCase1().getStatus());
            dto.setCase1Priority(a.getCase1().getPriority());
            dto.setCase1Category(a.getCase1().getCategory());
        }

        if (a.getCase2() != null) {
            dto.setCase2Id(a.getCase2().getId());
            dto.setCase2Number(a.getCase2().getCaseNumber());
            dto.setCase2Title(a.getCase2().getTitle());
            dto.setCase2BureauCode(a.getCase2().getBureau().getCode());
            dto.setCase2BureauName(a.getCase2().getBureau().getName());
            dto.setCase2Status(a.getCase2().getStatus());
            dto.setCase2Priority(a.getCase2().getPriority());
            dto.setCase2Category(a.getCase2().getCategory());
        }

        dto.setStatus(a.getStatus());
        dto.setClassification(a.getClassification());
        dto.setReviewRemarks(a.getReviewRemarks());
        if (a.getReviewedBy() != null) {
            dto.setReviewedByUserId(a.getReviewedBy().getId());
            dto.setReviewedByUserName(a.getReviewedBy().getFullName());
        }
        dto.setReviewedAt(a.getReviewedAt());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
