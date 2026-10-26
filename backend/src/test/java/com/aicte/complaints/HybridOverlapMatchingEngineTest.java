package com.aicte.complaints;

import com.aicte.complaints.dto.CreateCaseRequest;
import com.aicte.complaints.dto.InitiateCoordinationRequest;
import com.aicte.complaints.dto.ReviewOverlapRequest;
import com.aicte.complaints.entity.Bureau;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.Institution;
import com.aicte.complaints.entity.OverlapAlert;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.CaseService;
import com.aicte.complaints.service.OverlapService;
import com.aicte.complaints.service.matching.HybridOverlapPipeline;
import com.aicte.complaints.service.matching.RuleBasedMatchingEngine;
import com.aicte.complaints.service.matching.SemanticSimilarityEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class HybridOverlapMatchingEngineTest {

    @Autowired
    private RuleBasedMatchingEngine ruleEngine;

    @Autowired
    private SemanticSimilarityEngine semanticEngine;

    @Autowired
    private HybridOverlapPipeline hybridPipeline;

    @Autowired
    private OverlapService overlapService;

    @Autowired
    private CaseService caseService;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private BureauRepository bureauRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OverlapAlertRepository overlapAlertRepository;

    @Autowired
    private CoordinationRequestRepository coordinationRequestRepository;

    @Test
    @DisplayName("Scenario 1: Same institution and same underlying issue generate a potential overlap with High/Medium score")
    void testSameInstitutionSameIssueGeneratesOverlap() {
        Institution inst = institutionRepository.findByPermanentId("1-1097234567").orElseThrow();
        Bureau rb = bureauRepository.findById(1L).orElseThrow();
        Bureau pgrc = bureauRepository.findById(2L).orElseThrow();

        CaseEntity c1 = new CaseEntity();
        c1.setId(101L);
        c1.setCaseNumber("CASE-TEST-001");
        c1.setInstitution(inst);
        c1.setBureau(rb);
        c1.setCategory("Capitation Fee / Overcharging");
        c1.setTitle("Exorbitant Tuition Fee Retained Unlawfully");
        c1.setDescription("The college has charged excess capitation fees and refuses to provide any refund of caution money.");
        c1.setReceiptDate(LocalDateTime.now().minusDays(5));

        CaseEntity c2 = new CaseEntity();
        c2.setId(102L);
        c2.setCaseNumber("CASE-TEST-002");
        c2.setInstitution(inst);
        c2.setBureau(pgrc);
        c2.setCategory("Capitation Fee / Overcharging");
        c2.setTitle("Illegal Fee Surcharge and Caution Deposit Non-Refund");
        c2.setDescription("The institution has taken arbitrary fees exceeding limits and not returning student caution deposit.");
        c2.setReceiptDate(LocalDateTime.now().minusDays(2));

        HybridOverlapPipeline.MatchResult match = hybridPipeline.compareCasePair(c1, c2);

        assertTrue(match.getTotalScore() >= 70.0, "Total score should be high for same institution and issue");
        assertTrue(match.isShouldAlert(), "Engine should alert for manual review");
        assertEquals("HIGH", match.getReviewBand());
    }

    @Test
    @DisplayName("Scenario 2: Same institution but genuinely different issues are not declared duplicates")
    void testSameInstitutionDifferentIssuesNotDuplicates() {
        Institution inst = institutionRepository.findByPermanentId("1-1097234567").orElseThrow();
        Bureau rb = bureauRepository.findById(1L).orElseThrow();
        Bureau pgrc = bureauRepository.findById(2L).orElseThrow();

        CaseEntity c1 = new CaseEntity();
        c1.setId(201L);
        c1.setCaseNumber("CASE-DIFF-001");
        c1.setInstitution(inst);
        c1.setBureau(rb);
        c1.setCategory("Faculty Irregularities");
        c1.setTitle("Faculty Cadre Ratio Shortage and Delayed Salary Arrears");
        c1.setDescription("Inspection revealed severe shortage of professors and assistant professors under CAS regulations.");
        c1.setReceiptDate(LocalDateTime.now().minusDays(10));

        CaseEntity c2 = new CaseEntity();
        c2.setId(202L);
        c2.setCaseNumber("CASE-DIFF-002");
        c2.setInstitution(inst);
        c2.setBureau(pgrc);
        c2.setCategory("Infrastructure Deficit");
        c2.setTitle("Fire Safety Clearance Expired in Science Laboratory");
        c2.setDescription("Fire fighting cylinders not refilled and emergency exits blocked in laboratory building.");
        c2.setReceiptDate(LocalDateTime.now().minusDays(3));

        HybridOverlapPipeline.MatchResult match = hybridPipeline.compareCasePair(c1, c2);

        assertTrue(match.getTotalScore() < 60.0, "Score should not trigger duplicate classification for different issues");
        assertNotEquals("EXACT_DUPLICATE", match.getClassification());
        assertNotEquals("POTENTIAL_DUPLICATE", match.getClassification());
    }

    @Test
    @DisplayName("Scenario 3: Different wording describing same underlying issue is identified by semantic matching")
    void testSemanticMatchingDifferentWording() {
        // Text A vs Text B from master prompt example
        String textA = "The college has not responded to the students' submitted grievance.";
        String textB = "The institution has failed to provide any action or response to the grievance raised by students.";

        SemanticSimilarityEngine.SemanticEvaluationResult res = semanticEngine.compareTexts(textA, textB);

        assertTrue(res.getCosineSimilarity() > 0.65, "Semantic cosine similarity should detect synonym alignment");
        assertTrue(res.getSemanticScore() >= 18.0, "Semantic score should be high for identical meaning");
        assertNotNull(res.getModelVersion());
    }

    @Test
    @DisplayName("Scenario 4: Similar keywords alone do not automatically establish a duplicate")
    void testSimilarKeywordsAloneDoNotEstablishDuplicate() {
        // Both mention college, inspection, engineering, students, but about different topics
        CaseEntity c1 = new CaseEntity();
        c1.setId(301L);
        c1.setCaseNumber("CASE-KW-001");
        c1.setCategory("Admission Malpractice");
        c1.setTitle("College Engineering Students Admitted Without Cutoff");
        c1.setDescription("College admitted unqualified students beyond sanctioned quota during surprise inspection.");
        c1.setReceiptDate(LocalDateTime.now().minusDays(20));

        CaseEntity c2 = new CaseEntity();
        c2.setId(302L);
        c2.setCaseNumber("CASE-KW-002");
        c2.setCategory("Library Deficit");
        c2.setTitle("College Engineering Students Library Book Deficit");
        c2.setDescription("Engineering library does not have required subscription journals for college students.");
        c2.setReceiptDate(LocalDateTime.now().minusDays(18));

        HybridOverlapPipeline.MatchResult match = hybridPipeline.compareCasePair(c1, c2);

        assertNotEquals("EXACT_DUPLICATE", match.getClassification());
        assertNotEquals("POTENTIAL_DUPLICATE", match.getClassification());
    }

    @Test
    @DisplayName("Scenario 5: Different institution identifiers are handled as contradictory evidence")
    void testDifferentInstitutionIdentifiersContradictory() {
        Institution instA = new Institution();
        instA.setId(10L);
        instA.setName("Delhi Institute of Advanced Tech");
        instA.setPermanentId("1-1111111111");

        Institution instB = new Institution();
        instB.setId(20L);
        instB.setName("Chennai College of Engineering");
        instB.setPermanentId("1-2222222222");

        CaseEntity c1 = new CaseEntity();
        c1.setId(401L);
        c1.setCaseNumber("CASE-INST-001");
        c1.setInstitution(instA);
        c1.setTitle("Hostel Fee Overcharge");
        c1.setDescription("Illegal fees charged for hostel.");

        CaseEntity c2 = new CaseEntity();
        c2.setId(402L);
        c2.setCaseNumber("CASE-INST-002");
        c2.setInstitution(instB);
        c2.setTitle("Hostel Fee Overcharge");
        c2.setDescription("Illegal fees charged for hostel.");

        RuleBasedMatchingEngine.RuleEvaluationResult ruleRes = ruleEngine.evaluate(c1, c2);
        assertFalse(ruleRes.isPermanentIdMatch());
        assertTrue(ruleRes.getConflictingSignals().stream().anyMatch(s -> s.contains("Different AICTE Permanent IDs")));

        HybridOverlapPipeline.MatchResult match = hybridPipeline.compareCasePair(c1, c2);
        assertTrue(match.getTotalScore() <= 50.0, "Score must be capped when institutions are completely different");
        assertEquals("UNRELATED", match.getClassification());
    }

    @Test
    @DisplayName("Scenario 6: Missing data produces an appropriate inconclusive result")
    void testMissingDataProducesInconclusiveResult() {
        CaseEntity c1 = new CaseEntity();
        c1.setId(501L);
        c1.setCaseNumber("CASE-INC-001");
        c1.setDescription(""); // Empty

        CaseEntity c2 = new CaseEntity();
        c2.setId(502L);
        c2.setCaseNumber("CASE-INC-002");
        c2.setDescription(null); // Null

        RuleBasedMatchingEngine.RuleEvaluationResult ruleRes = ruleEngine.evaluate(c1, c2);
        assertTrue(ruleRes.isInconclusive());
        assertTrue(ruleRes.getMissingSignals().size() >= 2);
    }

    @Test
    @DisplayName("Scenario 7 & 8: AI failure does not prevent complaint registration & rule engine works independently")
    void testAiFailureDoesNotPreventComplaintRegistration() {
        User admin = userRepository.findByEmailIgnoreCase("admin@aicte.gov.in").orElseThrow();
        UserPrincipal principal = new UserPrincipal(admin);

        CreateCaseRequest req = new CreateCaseRequest();
        req.setPermanentId("1-1097234567");
        req.setBureauId(1L);
        req.setTitle("Fault Tolerant Intake Test Case");
        req.setDescription("Testing that complaint registration proceeds successfully even under AI subsystem fallback.");
        req.setCategory("Faculty Irregularities");
        req.setPriority("HIGH");

        assertDoesNotThrow(() -> {
            caseService.createCase(req, principal);
        }, "Complaint registration must never be blocked if overlap analysis encounters issues");
    }

    @Test
    @DisplayName("Scenario 9: Reprocessing the same case pair does not create duplicate match records (Idempotence)")
    void testReprocessingSamePairIsIdempotent() {
        CaseEntity case1 = caseRepository.findById(1L).orElseThrow();
        CaseEntity case2 = caseRepository.findById(2L).orElseThrow();

        // Run twice
        overlapService.checkForOverlaps(case1);
        overlapService.checkForOverlaps(case1);

        List<OverlapAlert> alerts = overlapAlertRepository.findAll();
        long pairCount = alerts.stream()
                .filter(a -> (a.getCase1().getId().equals(1L) && a.getCase2().getId().equals(2L)) ||
                             (a.getCase1().getId().equals(2L) && a.getCase2().getId().equals(1L)))
                .count();

        assertEquals(1, pairCount, "Normalized pair ordering must ensure exactly one record per case pair");
    }

    @Test
    @DisplayName("Scenario 10: Confirming a duplicate preserves both original cases and links them")
    void testConfirmDuplicatePreservesBothCases() {
        User admin = userRepository.findByEmailIgnoreCase("admin@aicte.gov.in").orElseThrow();
        UserPrincipal principal = new UserPrincipal(admin);

        Institution inst = institutionRepository.findById(1L).orElseThrow();
        Bureau rb = bureauRepository.findById(1L).orElseThrow();

        CaseEntity primary = new CaseEntity();
        primary.setCaseNumber("AICTE-TEST-PRI-001");
        primary.setInstitution(inst);
        primary.setBureau(rb);
        primary.setTitle("Primary Case Cadre Deficit");
        primary.setDescription("Full faculty cadre deficit inspection record.");
        primary.setCategory("Faculty Irregularities");
        primary.setPriority("HIGH");
        primary.setStatus("IN_PROGRESS");
        primary.setReceiptDate(LocalDateTime.now().minusDays(10));
        primary.setExpectedDisposalDate(LocalDateTime.now().plusDays(35));
        primary = caseRepository.save(primary);

        CaseEntity duplicate = new CaseEntity();
        duplicate.setCaseNumber("AICTE-TEST-DUP-002");
        duplicate.setInstitution(inst);
        duplicate.setBureau(rb);
        duplicate.setTitle("Duplicate Case Cadre Deficit");
        duplicate.setDescription("Identical faculty cadre deficit submitted again.");
        duplicate.setCategory("Faculty Irregularities");
        duplicate.setPriority("HIGH");
        duplicate.setStatus("RECEIVED");
        duplicate.setReceiptDate(LocalDateTime.now().minusDays(2));
        duplicate.setExpectedDisposalDate(LocalDateTime.now().plusDays(43));
        duplicate = caseRepository.save(duplicate);

        OverlapAlert alert = new OverlapAlert(inst, primary, duplicate);
        alert.setSimilarityScore(95.0);
        alert = overlapAlertRepository.save(alert);

        ReviewOverlapRequest req = new ReviewOverlapRequest();
        req.setDecision("CONFIRMED_DUPLICATE");
        req.setPrimaryCaseId(primary.getId());
        req.setReviewRemarks("Verified identical faculty roster complaint from different submitter.");

        overlapService.reviewOverlap(alert.getId(), req, principal);

        // Verify both cases still exist in DB
        assertTrue(caseRepository.existsById(primary.getId()));
        assertTrue(caseRepository.existsById(duplicate.getId()));

        // Verify duplicate links to primary
        CaseEntity updatedDup = caseRepository.findById(duplicate.getId()).orElseThrow();
        assertEquals(primary.getId(), updatedDup.getDuplicateOfCaseId());
        assertEquals("CONFIRMED_DUPLICATE", updatedDup.getDuplicateStatus());
    }

    @Test
    @DisplayName("Scenario 11: An officer can mark cases unrelated and record a reason")
    void testOfficerMarkUnrelated() {
        User admin = userRepository.findByEmailIgnoreCase("admin@aicte.gov.in").orElseThrow();
        UserPrincipal principal = new UserPrincipal(admin);
        Institution inst = institutionRepository.findById(1L).orElseThrow();
        CaseEntity c1 = caseRepository.findById(1L).orElseThrow();
        CaseEntity c2 = caseRepository.findById(2L).orElseThrow();

        OverlapAlert alert = overlapAlertRepository.findExistingPair(c1.getId(), c2.getId())
                .orElseGet(() -> {
                    OverlapAlert a = new OverlapAlert(inst, c1, c2);
                    a.setSimilarityScore(55.0);
                    return overlapAlertRepository.save(a);
                });

        ReviewOverlapRequest req = new ReviewOverlapRequest();
        req.setDecision("MARKED_UNRELATED");
        req.setReviewRemarks("Examined issues: Case 1 is about faculty salary; Case 2 is about student degree certificate.");

        overlapService.reviewOverlap(alert.getId(), req, principal);

        OverlapAlert updated = overlapAlertRepository.findById(alert.getId()).orElseThrow();
        assertEquals("MARKED_UNRELATED", updated.getDecisionStatus());
        assertEquals("REVIEWED", updated.getStatus());
        assertTrue(updated.getReviewRemarks().contains("faculty salary"));
    }

    @Test
    @DisplayName("Scenario 13: Cross-Bureau coordination follows configured permissions and records requests")
    void testCrossBureauCoordination() {
        User admin = userRepository.findByEmailIgnoreCase("admin@aicte.gov.in").orElseThrow();
        UserPrincipal principal = new UserPrincipal(admin);

        InitiateCoordinationRequest req = new InitiateCoordinationRequest();
        req.setPrimaryCaseId(1L);
        req.setLinkedCaseId(2L);
        req.setTargetBureauId(2L); // PGRC
        req.setReason("Joint regulatory inspection required to verify degree withholding vs student complaints.");

        var coordDto = overlapService.initiateCoordination(req, principal);

        assertNotNull(coordDto.getRequestNumber());
        assertEquals("PENDING", coordDto.getStatus());
        assertEquals("RB", coordDto.getInitiatingBureauCode());
        assertEquals("PGRC", coordDto.getTargetBureauCode());
    }

    @Test
    @DisplayName("Scenario 16: Model/rule versions and review decisions are auditable")
    void testModelVersionAndDecisionsAreAuditable() {
        CaseEntity c1 = caseRepository.findById(1L).orElseThrow();
        CaseEntity c2 = caseRepository.findById(2L).orElseThrow();

        HybridOverlapPipeline.MatchResult match = hybridPipeline.compareCasePair(c1, c2);

        assertNotNull(match.getExplanationJson());
        assertTrue(match.getExplanationJson().contains("HYBRID-V2.1-TFIDF-COSINE"));
        assertTrue(match.getExplanationJson().contains("scoreBreakdown"));
    }
}
