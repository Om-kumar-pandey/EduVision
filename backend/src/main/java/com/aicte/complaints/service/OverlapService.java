package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.*;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.matching.HybridOverlapPipeline;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AICTE Overlap & Cross-Bureau Coordination Service
 * 
 * Implements the hybrid matching pipeline, human verification workflows,
 * explainable candidate comparison, and idempotent decision governance.
 */
@Service
public class OverlapService {

    private static final Logger log = LoggerFactory.getLogger(OverlapService.class);

    private final OverlapAlertRepository overlapAlertRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final CaseActionRepository caseActionRepository;
    private final CaseRelationshipRepository caseRelationshipRepository;
    private final CoordinationRequestRepository coordinationRequestRepository;
    private final BureauRepository bureauRepository;
    private final AuditLogService auditLogService;
    private final HybridOverlapPipeline hybridPipeline;

    public OverlapService(OverlapAlertRepository overlapAlertRepository,
                          CaseRepository caseRepository,
                          UserRepository userRepository,
                          CaseActionRepository caseActionRepository,
                          CaseRelationshipRepository caseRelationshipRepository,
                          CoordinationRequestRepository coordinationRequestRepository,
                          BureauRepository bureauRepository,
                          AuditLogService auditLogService,
                          HybridOverlapPipeline hybridPipeline) {
        this.overlapAlertRepository = overlapAlertRepository;
        this.caseRepository = caseRepository;
        this.userRepository = userRepository;
        this.caseActionRepository = caseActionRepository;
        this.caseRelationshipRepository = caseRelationshipRepository;
        this.coordinationRequestRepository = coordinationRequestRepository;
        this.bureauRepository = bureauRepository;
        this.auditLogService = auditLogService;
        this.hybridPipeline = hybridPipeline;
    }

    /**
     * Executes the hybrid overlap detection pipeline whenever a case is created or updated.
     * Never throws uncaught exceptions to prevent blocking primary complaint intake.
     */
    @Transactional
    public void checkForOverlaps(CaseEntity newCase) {
        if (newCase == null || "DISPOSED".equalsIgnoreCase(newCase.getStatus())) {
            return;
        }

        try {
            List<HybridOverlapPipeline.MatchResult> matches = hybridPipeline.analyzeCaseForOverlaps(newCase);

            for (HybridOverlapPipeline.MatchResult match : matches) {
                CaseEntity c1 = match.getCase1();
                CaseEntity c2 = match.getCase2();

                Optional<OverlapAlert> existingOpt = overlapAlertRepository.findExistingPair(c1.getId(), c2.getId());

                if (existingOpt.isPresent()) {
                    OverlapAlert alert = existingOpt.get();
                    // If not yet finalized by human officer, update with latest analysis
                    if ("AWAITING_REVIEW".equalsIgnoreCase(alert.getDecisionStatus())) {
                        alert.setSimilarityScore(match.getTotalScore());
                        alert.setRuleScore(match.getRuleScore());
                        alert.setSemanticScore(match.getSemanticScore());
                        alert.setReviewBand(match.getReviewBand());
                        alert.setClassification(match.getClassification());
                        alert.setExplanationJson(match.getExplanationJson());
                        alert.setAnalysisTimestamp(LocalDateTime.now());
                        overlapAlertRepository.save(alert);
                    }
                } else {
                    OverlapAlert alert = new OverlapAlert(newCase.getInstitution(), c1, c2);
                    alert.setSimilarityScore(match.getTotalScore());
                    alert.setRuleScore(match.getRuleScore());
                    alert.setSemanticScore(match.getSemanticScore());
                    alert.setReviewBand(match.getReviewBand());
                    alert.setClassification(match.getClassification());
                    alert.setDecisionStatus("AWAITING_REVIEW");
                    alert.setExplanationJson(match.getExplanationJson());
                    alert.setMatchingVersion("HYBRID-V2.1-TFIDF-COSINE");
                    alert.setAnalysisTimestamp(LocalDateTime.now());
                    alert.setCoordinationStatus("NONE");

                    OverlapAlert saved = overlapAlertRepository.save(alert);

                    auditLogService.logAction(
                            null,
                            "SYSTEM",
                            "HYBRID_OVERLAP_DETECTED",
                            "OVERLAP_ALERT",
                            saved.getId().toString(),
                            "Hybrid AI overlap detected: Case " + c1.getCaseNumber() + " vs Case " + c2.getCaseNumber() +
                            " | Score: " + match.getTotalScore() + "% (" + match.getReviewBand() + ") for " +
                            newCase.getInstitution().getPermanentId(),
                            "127.0.0.1"
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error executing hybrid overlap detection for case {}: {}", newCase.getCaseNumber(), e.getMessage(), e);
        }
    }

    /**
     * Paged, multi-criteria filtered overlap list.
     */
    @Transactional(readOnly = true)
    public PagedResponse<OverlapAlertDto> getFilteredOverlaps(
            String status,
            String decisionStatus,
            String reviewBand,
            Long bureauId,
            Long institutionId,
            String query,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OverlapAlert> alertsPage = overlapAlertRepository.findFilteredOverlaps(
                status, decisionStatus, reviewBand, bureauId, institutionId, query, pageable);

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
    public PagedResponse<OverlapAlertDto> getOverlapAlerts(String status, int page, int size) {
        return getFilteredOverlaps(status, null, null, null, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public OverlapAlertDto getOverlapById(Long id) {
        OverlapAlert alert = overlapAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overlap candidate record not found with ID: " + id));
        return mapToDto(alert);
    }

    @Transactional(readOnly = true)
    public List<OverlapAlertDto> getOverlapsForInstitution(Long institutionId) {
        List<OverlapAlert> alerts = overlapAlertRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
        return alerts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Executes official human verification decisions on candidate overlaps.
     */
    @Transactional
    public OverlapAlertDto reviewOverlap(Long id, ReviewOverlapRequest request, UserPrincipal principal) {
        OverlapAlert alert = overlapAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overlap candidate record not found with ID: " + id));

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;
        if (user == null) {
            user = userRepository.findByRole("SYS_ADMIN").stream().findFirst().orElse(null);
        }

        String decision = request.getDecision() != null ? request.getDecision().trim().toUpperCase() : "REVIEWED";
        String remarks = request.getReviewRemarks() != null ? request.getReviewRemarks().trim() : "Reviewed by officer";

        CaseEntity case1 = alert.getCase1();
        CaseEntity case2 = alert.getCase2();

        alert.setStatus("REVIEWED");
        alert.setDecisionStatus(decision);
        alert.setClassification(decision);
        alert.setReviewRemarks(remarks);
        alert.setReviewedBy(user);
        alert.setReviewedAt(LocalDateTime.now());

        if ("CONFIRMED_DUPLICATE".equalsIgnoreCase(decision)) {
            // Preserve both cases, designate primary case, set duplicate flag
            Long primaryId = request.getPrimaryCaseId();
            CaseEntity primary = (primaryId != null && primaryId.equals(case2.getId())) ? case2 : case1;
            CaseEntity duplicate = primary == case1 ? case2 : case1;

            alert.setPrimaryCaseId(primary.getId());

            // Mark duplicate on entity without deleting history
            duplicate.setDuplicateOfCaseId(primary.getId());
            duplicate.setDuplicateStatus("CONFIRMED_DUPLICATE");
            caseRepository.save(duplicate);

            // Record Case Relationship
            CaseRelationship rel = new CaseRelationship(
                    duplicate, primary, "DUPLICATE_OF", alert.getSimilarityScore(), remarks, user);
            caseRelationshipRepository.save(rel);

            // Record audit actions on both cases
            recordCaseAction(duplicate, user, "DUPLICATE_CONFIRMED", duplicate.getStatus(), duplicate.getStatus(),
                    "Confirmed duplicate of primary Case " + primary.getCaseNumber() + " by " + (user != null ? user.getFullName() : "Admin") + ". Justification: " + remarks);
            recordCaseAction(primary, user, "DUPLICATE_LINKED", primary.getStatus(), primary.getStatus(),
                    "Linked secondary duplicate Case " + duplicate.getCaseNumber() + ". Justification: " + remarks);

        } else if ("CONFIRMED_RELATED".equalsIgnoreCase(decision)) {
            // Related matter: link cases without merging independent workflows
            CaseRelationship rel = new CaseRelationship(
                    case1, case2, "RELATED_TO", alert.getSimilarityScore(), remarks, user);
            caseRelationshipRepository.save(rel);

            recordCaseAction(case1, user, "RELATED_CASE_LINKED", case1.getStatus(), case1.getStatus(),
                    "Cross-case link established with Case " + case2.getCaseNumber() + " (" + case2.getBureau().getCode() + "). Remarks: " + remarks);
            recordCaseAction(case2, user, "RELATED_CASE_LINKED", case2.getStatus(), case2.getStatus(),
                    "Cross-case link established with Case " + case1.getCaseNumber() + " (" + case1.getBureau().getCode() + "). Remarks: " + remarks);

        } else if ("MARKED_UNRELATED".equalsIgnoreCase(decision)) {
            recordCaseAction(case1, user, "OVERLAP_MARKED_UNRELATED", case1.getStatus(), case1.getStatus(),
                    "Evaluated against Case " + case2.getCaseNumber() + " and confirmed unrelated. Justification: " + remarks);
            recordCaseAction(case2, user, "OVERLAP_MARKED_UNRELATED", case2.getStatus(), case2.getStatus(),
                    "Evaluated against Case " + case1.getCaseNumber() + " and confirmed unrelated. Justification: " + remarks);

        } else if ("COORDINATION_REQUESTED".equalsIgnoreCase(decision)) {
            alert.setCoordinationStatus("REQUESTED");
            // Also initiate formal cross-bureau coordination request
            initiateCoordinationInternal(alert, case1, case2, request.getCoordinationReason(), user);
        }

        OverlapAlert updated = overlapAlertRepository.save(alert);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "ADMIN",
                "OVERLAP_DECISION_" + decision,
                "OVERLAP_ALERT",
                alert.getId().toString(),
                "Overlap review decision: " + decision + " for Case " + case1.getCaseNumber() +
                " and Case " + case2.getCaseNumber() + ". Justification: " + remarks,
                "127.0.0.1"
        );

        return mapToDto(updated);
    }

    /**
     * Reopens an overlap review, supporting reversal of an incorrect decision without deleting history.
     */
    @Transactional
    public OverlapAlertDto reopenOverlap(Long id, String reason, UserPrincipal principal) {
        OverlapAlert alert = overlapAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overlap candidate record not found with ID: " + id));

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;
        if (user == null) {
            user = userRepository.findByRole("SYS_ADMIN").stream().findFirst().orElse(null);
        }

        String historyEntry = "[" + LocalDateTime.now() + " by " + (user != null ? user.getFullName() : "Admin") + "]: " +
                              "Reopened from previous status '" + alert.getDecisionStatus() + "'. Reason: " + reason;

        String prevHistory = alert.getReversalHistory();
        alert.setReversalHistory(prevHistory == null ? historyEntry : prevHistory + "\n" + historyEntry);

        // Revert duplicate flags on cases if previously marked duplicate
        if ("CONFIRMED_DUPLICATE".equalsIgnoreCase(alert.getDecisionStatus())) {
            CaseEntity c1 = alert.getCase1();
            CaseEntity c2 = alert.getCase2();
            if (c1.getDuplicateOfCaseId() != null && c1.getDuplicateOfCaseId().equals(c2.getId())) {
                c1.setDuplicateOfCaseId(null);
                c1.setDuplicateStatus("NONE");
                caseRepository.save(c1);
            }
            if (c2.getDuplicateOfCaseId() != null && c2.getDuplicateOfCaseId().equals(c1.getId())) {
                c2.setDuplicateOfCaseId(null);
                c2.setDuplicateStatus("NONE");
                caseRepository.save(c2);
            }
        }

        alert.setStatus("DETECTED");
        alert.setDecisionStatus("REOPENED");
        alert.setClassification("REOPENED_FOR_REVIEW");
        alert.setReviewRemarks("Reopened: " + reason);
        alert.setPrimaryCaseId(null);

        OverlapAlert saved = overlapAlertRepository.save(alert);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "ADMIN",
                "OVERLAP_REOPENED",
                "OVERLAP_ALERT",
                alert.getId().toString(),
                "Overlap review reopened for Case " + alert.getCase1().getCaseNumber() +
                " and Case " + alert.getCase2().getCaseNumber() + ". Reason: " + reason,
                "127.0.0.1"
        );

        return mapToDto(saved);
    }

    /**
     * Cross-Bureau Coordination management
     */
    @Transactional
    public CoordinationRequestDto initiateCoordination(InitiateCoordinationRequest req, UserPrincipal principal) {
        CaseEntity primary = caseRepository.findById(req.getPrimaryCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary case not found with ID: " + req.getPrimaryCaseId()));
        CaseEntity linked = caseRepository.findById(req.getLinkedCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Linked case not found with ID: " + req.getLinkedCaseId()));

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;
        if (user == null) {
            user = userRepository.findByRole("SYS_ADMIN").stream().findFirst().orElse(null);
        }

        OverlapAlert alert = null;
        if (req.getOverlapAlertId() != null) {
            alert = overlapAlertRepository.findById(req.getOverlapAlertId()).orElse(null);
            if (alert != null) {
                alert.setCoordinationStatus("IN_PROGRESS");
                overlapAlertRepository.save(alert);
            }
        }

        Bureau targetBureau = (req.getTargetBureauId() != null)
                ? bureauRepository.findById(req.getTargetBureauId()).orElse(linked.getBureau())
                : linked.getBureau();

        CoordinationRequest coord = new CoordinationRequest();
        coord.setRequestNumber("COORD-" + LocalDateTime.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000)));
        coord.setOverlapAlert(alert);
        coord.setPrimaryCase(primary);
        coord.setLinkedCase(linked);
        coord.setInitiatingBureau(primary.getBureau());
        coord.setTargetBureau(targetBureau);
        coord.setRequestedBy(user);
        coord.setReason(req.getReason());
        coord.setDeadline(req.getDeadline() != null ? req.getDeadline() : LocalDateTime.now().plusDays(14));
        coord.setStatus("PENDING");

        CoordinationRequest saved = coordinationRequestRepository.save(coord);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "ADMIN",
                "COORDINATION_INITIATED",
                "COORDINATION_REQUEST",
                saved.getRequestNumber(),
                "Cross-bureau coordination requested between " + coord.getInitiatingBureau().getCode() +
                " and " + coord.getTargetBureau().getCode() + " for Case " + primary.getCaseNumber(),
                "127.0.0.1"
        );

        return mapCoordinationToDto(saved);
    }

    private void initiateCoordinationInternal(OverlapAlert alert, CaseEntity c1, CaseEntity c2, String reason, User user) {
        Bureau b1 = c1.getBureau();
        Bureau b2 = c2.getBureau();

        CoordinationRequest coord = new CoordinationRequest();
        coord.setRequestNumber("COORD-" + LocalDateTime.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000)));
        coord.setOverlapAlert(alert);
        coord.setPrimaryCase(c1);
        coord.setLinkedCase(c2);
        coord.setInitiatingBureau(b1);
        coord.setTargetBureau(b2);
        coord.setRequestedBy(user != null ? user : userRepository.findByRole("SYS_ADMIN").stream().findFirst().orElse(null));
        coord.setReason(reason != null && !reason.isBlank() ? reason : "Cross-bureau coordination initiated following high overlap detection");
        coord.setDeadline(LocalDateTime.now().plusDays(14));
        coord.setStatus("PENDING");

        coordinationRequestRepository.save(coord);
    }

    @Transactional
    public CoordinationRequestDto respondToCoordination(Long id, RespondCoordinationRequest req, UserPrincipal principal) {
        CoordinationRequest coord = coordinationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coordination request not found with ID: " + id));

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;

        String dec = req.getDecision().toUpperCase();
        if (!"ACCEPTED".equals(dec) && !"DECLINED".equals(dec) && !"COMPLETED".equals(dec)) {
            throw new BadRequestException("Decision must be ACCEPTED, DECLINED, or COMPLETED");
        }

        coord.setStatus(dec);
        coord.setOfficerRemarks(req.getRemarks());
        coord.setResponseDocumentRef(req.getDocumentRef());

        CoordinationRequest updated = coordinationRequestRepository.save(coord);

        if (coord.getOverlapAlert() != null) {
            coord.getOverlapAlert().setCoordinationStatus(dec);
            overlapAlertRepository.save(coord.getOverlapAlert());
        }

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "OFFICER",
                "COORDINATION_RESPONDED_" + dec,
                "COORDINATION_REQUEST",
                coord.getRequestNumber(),
                "Coordination request " + coord.getRequestNumber() + " responded with: " + dec,
                "127.0.0.1"
        );

        return mapCoordinationToDto(updated);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CoordinationRequestDto> getCoordinationRequests(Long bureauId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CoordinationRequest> pageResult = coordinationRequestRepository.findFiltered(bureauId, status, pageable);

        List<CoordinationRequestDto> dtos = pageResult.getContent().stream()
                .map(this::mapCoordinationToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    @Transactional(readOnly = true)
    public OverlapStatsDto getStats() {
        OverlapStatsDto stats = new OverlapStatsDto();
        stats.setTotalOverlaps(overlapAlertRepository.count());
        stats.setPendingReview(overlapAlertRepository.countPendingReviewOverlaps());
        stats.setHighSimilarity(overlapAlertRepository.countByReviewBand("HIGH"));
        stats.setMediumSimilarity(overlapAlertRepository.countByReviewBand("MEDIUM"));
        stats.setLowSimilarity(overlapAlertRepository.countByReviewBand("LOW"));
        stats.setInconclusive(overlapAlertRepository.countByReviewBand("INCONCLUSIVE"));
        stats.setConfirmedDuplicates(overlapAlertRepository.countByDecisionStatus("CONFIRMED_DUPLICATE"));
        stats.setRelatedCases(overlapAlertRepository.countByDecisionStatus("CONFIRMED_RELATED"));
        stats.setUnrelatedCases(overlapAlertRepository.countByDecisionStatus("MARKED_UNRELATED"));
        stats.setActiveCoordinationRequests(coordinationRequestRepository.countByStatus("PENDING"));
        return stats;
    }

    private void recordCaseAction(CaseEntity caseEntity, User user, String actionType, String fromStatus, String toStatus, String remarks) {
        CaseAction action = new CaseAction(caseEntity, user, actionType, fromStatus, toStatus, remarks);
        caseActionRepository.save(action);
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
            dto.setCase1Description(a.getCase1().getDescription());
            dto.setCase1BureauCode(a.getCase1().getBureau() != null ? a.getCase1().getBureau().getCode() : "N/A");
            dto.setCase1BureauName(a.getCase1().getBureau() != null ? a.getCase1().getBureau().getName() : "N/A");
            dto.setCase1Status(a.getCase1().getStatus());
            dto.setCase1Priority(a.getCase1().getPriority());
            dto.setCase1Category(a.getCase1().getCategory());
            dto.setCase1ReceiptDate(a.getCase1().getReceiptDate());
            dto.setCase1OfficerName(a.getCase1().getAssignedTo() != null ? a.getCase1().getAssignedTo().getFullName() : "Unassigned");
        }

        if (a.getCase2() != null) {
            dto.setCase2Id(a.getCase2().getId());
            dto.setCase2Number(a.getCase2().getCaseNumber());
            dto.setCase2Title(a.getCase2().getTitle());
            dto.setCase2Description(a.getCase2().getDescription());
            dto.setCase2BureauCode(a.getCase2().getBureau() != null ? a.getCase2().getBureau().getCode() : "N/A");
            dto.setCase2BureauName(a.getCase2().getBureau() != null ? a.getCase2().getBureau().getName() : "N/A");
            dto.setCase2Status(a.getCase2().getStatus());
            dto.setCase2Priority(a.getCase2().getPriority());
            dto.setCase2Category(a.getCase2().getCategory());
            dto.setCase2ReceiptDate(a.getCase2().getReceiptDate());
            dto.setCase2OfficerName(a.getCase2().getAssignedTo() != null ? a.getCase2().getAssignedTo().getFullName() : "Unassigned");
        }

        dto.setStatus(a.getStatus());
        dto.setClassification(a.getClassification());
        dto.setReviewRemarks(a.getReviewRemarks());
        if (a.getReviewedBy() != null) {
            dto.setReviewedByUserId(a.getReviewedBy().getId());
            dto.setReviewedByUserName(a.getReviewedBy().getFullName());
        }
        dto.setReviewedAt(a.getReviewedAt());

        dto.setSimilarityScore(a.getSimilarityScore() != null ? a.getSimilarityScore() : 0.0);
        dto.setRuleScore(a.getRuleScore() != null ? a.getRuleScore() : 0.0);
        dto.setSemanticScore(a.getSemanticScore() != null ? a.getSemanticScore() : 0.0);
        dto.setReviewBand(a.getReviewBand() != null ? a.getReviewBand() : "INCONCLUSIVE");
        dto.setDecisionStatus(a.getDecisionStatus() != null ? a.getDecisionStatus() : "AWAITING_REVIEW");
        dto.setExplanationJson(a.getExplanationJson());
        dto.setMatchingVersion(a.getMatchingVersion());
        dto.setAnalysisTimestamp(a.getAnalysisTimestamp());
        dto.setCoordinationStatus(a.getCoordinationStatus());
        dto.setPrimaryCaseId(a.getPrimaryCaseId());
        dto.setReversalHistory(a.getReversalHistory());

        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }

    public CoordinationRequestDto mapCoordinationToDto(CoordinationRequest c) {
        CoordinationRequestDto dto = new CoordinationRequestDto();
        dto.setId(c.getId());
        dto.setRequestNumber(c.getRequestNumber());
        if (c.getOverlapAlert() != null) dto.setOverlapAlertId(c.getOverlapAlert().getId());

        if (c.getPrimaryCase() != null) {
            dto.setPrimaryCaseId(c.getPrimaryCase().getId());
            dto.setPrimaryCaseNumber(c.getPrimaryCase().getCaseNumber());
            dto.setPrimaryCaseTitle(c.getPrimaryCase().getTitle());
        }
        if (c.getLinkedCase() != null) {
            dto.setLinkedCaseId(c.getLinkedCase().getId());
            dto.setLinkedCaseNumber(c.getLinkedCase().getCaseNumber());
            dto.setLinkedCaseTitle(c.getLinkedCase().getTitle());
        }
        if (c.getInitiatingBureau() != null) {
            dto.setInitiatingBureauId(c.getInitiatingBureau().getId());
            dto.setInitiatingBureauCode(c.getInitiatingBureau().getCode());
            dto.setInitiatingBureauName(c.getInitiatingBureau().getName());
        }
        if (c.getTargetBureau() != null) {
            dto.setTargetBureauId(c.getTargetBureau().getId());
            dto.setTargetBureauCode(c.getTargetBureau().getCode());
            dto.setTargetBureauName(c.getTargetBureau().getName());
        }
        if (c.getRequestedBy() != null) {
            dto.setRequestedByUserId(c.getRequestedBy().getId());
            dto.setRequestedByUserName(c.getRequestedBy().getFullName());
        }
        dto.setReason(c.getReason());
        dto.setDeadline(c.getDeadline());
        dto.setStatus(c.getStatus());
        dto.setOfficerRemarks(c.getOfficerRemarks());
        dto.setResponseDocumentRef(c.getResponseDocumentRef());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
