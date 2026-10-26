package com.aicte.complaints;

import com.aicte.complaints.dto.CreateCaseRequest;
import com.aicte.complaints.dto.CreateTransferRequest;
import com.aicte.complaints.dto.UpdateStatusRequest;
import com.aicte.complaints.entity.Bureau;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.Institution;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.exception.AccessDeniedCustomException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.CaseService;
import com.aicte.complaints.service.OverlapService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ComplaintMonitoringTests {

    @Autowired
    private CaseService caseService;

    @Autowired
    private OverlapService overlapService;

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

    @Test
    @DisplayName("Scenario 1: Valid Case Registration generates unique Case ID (HTTP 201 equivalent)")
    void testValidCaseRegistration() {
        User admin = userRepository.findByEmailIgnoreCase("admin@aicte.gov.in").orElseThrow();
        UserPrincipal principal = new UserPrincipal(admin);

        CreateCaseRequest req = new CreateCaseRequest();
        req.setPermanentId("1-1097234567");
        req.setBureauId(1L); // RB
        req.setTitle("Test Case Registration for Cadre Deficit");
        req.setDescription("Faculty shortage observed during surprise inspection");
        req.setCategory("Faculty Irregularities");
        req.setPriority("HIGH");

        var created = caseService.createCase(req, principal);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertNotNull(created.getCaseNumber());
        assertTrue(created.getCaseNumber().startsWith("AICTE-"));
        assertEquals("RECEIVED", created.getStatus());
    }

    @Test
    @DisplayName("Scenario 2: Bureau Officer updating another Bureau's case throws AccessDeniedCustomException (HTTP 403)")
    void testBureauLevelScopingRestriction() {
        // Case 1 belongs to RB (Bureau ID: 1)
        CaseEntity case1 = caseRepository.findById(1L).orElseThrow();
        assertEquals(1L, case1.getBureau().getId());

        // PGRC Officer belongs to Bureau ID: 2
        User pgrcOfficer = userRepository.findByEmailIgnoreCase("pgrc_officer@aicte.gov.in").orElseThrow();
        assertEquals(2L, pgrcOfficer.getBureau().getId());
        UserPrincipal pgrcPrincipal = new UserPrincipal(pgrcOfficer);

        UpdateStatusRequest updateReq = new UpdateStatusRequest();
        updateReq.setStatus("UNDER_PROCESS");
        updateReq.setRemarks("Attempting unauthorized status update across bureau boundary");

        assertThrows(AccessDeniedCustomException.class, () -> {
            caseService.updateStatus(case1.getId(), updateReq, pgrcPrincipal);
        });
    }

    @Test
    @DisplayName("Scenario 3: Cross-Bureau Overlap Flag triggers when two active cases exist across Bureaus for same Institution")
    void testCrossBureauOverlapTrigger() {
        Institution inst = institutionRepository.findByPermanentId("1-3958102931").orElseThrow(); // Deccan College
        Bureau rb = bureauRepository.findByCodeIgnoreCase("RB").orElseThrow();
        Bureau pgrc = bureauRepository.findByCodeIgnoreCase("PGRC").orElseThrow();

        // Create Active Case 1 under RB
        CaseEntity c1 = new CaseEntity();
        c1.setCaseNumber("TEST-CASE-RB-001");
        c1.setInstitution(inst);
        c1.setBureau(rb);
        c1.setTitle("Regulatory Audit Inconsistency");
        c1.setDescription("Testing overlap detection");
        c1.setCategory("Regulatory Adherence");
        c1.setPriority("HIGH");
        c1.setStatus("UNDER_PROCESS");
        c1.setReceiptDate(LocalDateTime.now());
        c1.setExpectedDisposalDate(LocalDateTime.now().plusDays(30));
        caseRepository.save(c1);

        // Create Active Case 2 under PGRC
        CaseEntity c2 = new CaseEntity();
        c2.setCaseNumber("TEST-CASE-PGRC-002");
        c2.setInstitution(inst);
        c2.setBureau(pgrc);
        c2.setTitle("Student Fee Exorbitance Complaint");
        c2.setDescription("Testing overlap detection cell");
        c2.setCategory("Capitation Fee / Overcharging");
        c2.setPriority("URGENT");
        c2.setStatus("RECEIVED");
        c2.setReceiptDate(LocalDateTime.now());
        c2.setExpectedDisposalDate(LocalDateTime.now().plusDays(30));
        caseRepository.save(c2);

        // Run overlap detection
        overlapService.checkForOverlaps(c2);

        var existingPair = overlapAlertRepository.findExistingPair(c1.getId(), c2.getId());
        assertTrue(existingPair.isPresent(), "Cross-bureau overlap alert must be triggered!");
        assertEquals("DETECTED", existingPair.get().getStatus());
    }

    @Test
    @DisplayName("Scenario 4: Case Transfer preserves original Case ID")
    void testCaseTransferPreservesCaseId() {
        CaseEntity case1 = caseRepository.findById(1L).orElseThrow();
        String originalCaseNumber = case1.getCaseNumber();

        User rbOfficer = userRepository.findByEmailIgnoreCase("rb_officer@aicte.gov.in").orElseThrow();
        UserPrincipal rbPrincipal = new UserPrincipal(rbOfficer);

        CreateTransferRequest req = new CreateTransferRequest();
        req.setToBureauId(2L); // Transfer to PGRC
        req.setReason("Student grievance dimension discovered during inquiry.");

        var transferDto = caseService.createTransferRequest(case1.getId(), req, rbPrincipal);

        assertNotNull(transferDto);
        assertEquals(originalCaseNumber, transferDto.getCaseNumber());
        assertEquals("PENDING", transferDto.getStatus());

        // Verify original case number remains identical
        CaseEntity afterTransfer = caseRepository.findById(1L).orElseThrow();
        assertEquals(originalCaseNumber, afterTransfer.getCaseNumber());
    }
}
