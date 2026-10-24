package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.*;
import com.aicte.complaints.exception.AccessDeniedCustomException;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CaseService {

    private final CaseRepository caseRepository;
    private final InstitutionRepository institutionRepository;
    private final BureauRepository bureauRepository;
    private final UserRepository userRepository;
    private final CaseActionRepository caseActionRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final CaseAttachmentRepository caseAttachmentRepository;
    private final OverlapService overlapService;
    private final AuditLogService auditLogService;

    public CaseService(CaseRepository caseRepository,
                       InstitutionRepository institutionRepository,
                       BureauRepository bureauRepository,
                       UserRepository userRepository,
                       CaseActionRepository caseActionRepository,
                       TransferRequestRepository transferRequestRepository,
                       CaseAttachmentRepository caseAttachmentRepository,
                       OverlapService overlapService,
                       AuditLogService auditLogService) {
        this.caseRepository = caseRepository;
        this.institutionRepository = institutionRepository;
        this.bureauRepository = bureauRepository;
        this.userRepository = userRepository;
        this.caseActionRepository = caseActionRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.caseAttachmentRepository = caseAttachmentRepository;
        this.overlapService = overlapService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<CaseDto> getQueue(Long bureauId, String status, String priority, String category,
                                          String query, String sortBy, String sortDir, int page, int size,
                                          UserPrincipal principal) {
        Long effectiveBureauId = bureauId;
        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            effectiveBureauId = principal.getBureauId();
        }

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"),
                sortBy != null ? sortBy : "receiptDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CaseEntity> casePage = caseRepository.searchCases(effectiveBureauId, status, priority, category, query, pageable);

        List<CaseDto> dtos = casePage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                casePage.getNumber(),
                casePage.getSize(),
                casePage.getTotalElements(),
                casePage.getTotalPages(),
                casePage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public CaseDto getCaseById(Long id, UserPrincipal principal) {
        CaseEntity c = caseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + id));

        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            if (!c.getBureau().getId().equals(principal.getBureauId())) {
                throw new AccessDeniedCustomException("Access denied: You are not authorized to view cases belonging to another Bureau.");
            }
        }

        return mapToDto(c);
    }

    @Transactional
    public CaseDto createCase(CreateCaseRequest request, UserPrincipal principal) {
        Institution institution = institutionRepository.findByPermanentId(request.getPermanentId().trim())
                .orElseThrow(() -> new BadRequestException("Institution with AICTE Permanent ID '" + request.getPermanentId() + "' not found"));

        Long targetBureauId = request.getBureauId();
        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            targetBureauId = principal.getBureauId();
        }
        final Long finalBureauId = targetBureauId;
        Bureau bureau = bureauRepository.findById(finalBureauId)
                .orElseThrow(() -> new BadRequestException("Bureau not found with ID: " + finalBureauId));

        User user = null;
        if (principal != null) {
            user = userRepository.findById(principal.getId()).orElse(null);
        }

        CaseEntity caseEntity = new CaseEntity();
        caseEntity.setCaseNumber(generateUniqueCaseNumber());
        caseEntity.setSourceCaseId(request.getSourceCaseId());
        caseEntity.setInstitution(institution);
        caseEntity.setBureau(bureau);
        caseEntity.setTitle(request.getTitle().trim());
        caseEntity.setDescription(request.getDescription().trim());
        caseEntity.setCategory(request.getCategory().trim());
        caseEntity.setPriority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM");
        caseEntity.setStatus("RECEIVED");
        caseEntity.setReceiptDate(request.getReceiptDate() != null ? request.getReceiptDate() : LocalDateTime.now());
        caseEntity.setExpectedDisposalDate(request.getExpectedDisposalDate() != null ? request.getExpectedDisposalDate() : caseEntity.getReceiptDate().plusDays(45));
        caseEntity.setCreatedBy(user);

        CaseEntity saved = caseRepository.save(caseEntity);

        CaseAction initialAction = new CaseAction(
                saved,
                user,
                "STATUS_CHANGE",
                null,
                "RECEIVED",
                "Case intake formally registered and assigned to " + bureau.getName() + " (" + bureau.getCode() + ")."
        );
        caseActionRepository.save(initialAction);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "SYSTEM",
                "CASE_CREATE",
                "CASE",
                saved.getCaseNumber(),
                "New case created for institution " + institution.getPermanentId() + " under Bureau " + bureau.getCode(),
                "127.0.0.1"
        );

        overlapService.checkForOverlaps(saved);
        return mapToDto(saved);
    }

    @Transactional
    public CaseDto fileComplaintByComplainant(FileComplaintRequest req, UserPrincipal complainant, HttpServletRequest httpRequest) {
        Institution inst = institutionRepository.findByPermanentId(req.getInstitutionPermanentId().trim())
                .orElseThrow(() -> new BadRequestException("Institution with Permanent ID '" + req.getInstitutionPermanentId() + "' not found."));

        String cat = req.getCategory().toLowerCase();
        String bureauCode = "PGRC";
        if (cat.contains("faculty") || cat.contains("infrastructure") || cat.contains("norm") || cat.contains("cadre")) {
            bureauCode = "RB";
        } else if (cat.contains("admission") || cat.contains("intake") || cat.contains("approval") || cat.contains("affiliation")) {
            bureauCode = "APPROVAL";
        } else if (cat.contains("fee") || cat.contains("capitation") || cat.contains("certificate") || cat.contains("harassment") || cat.contains("grievance")) {
            bureauCode = "PGRC";
        }

        final String targetBureauCode = bureauCode;
        Bureau bureau = bureauRepository.findByCode(targetBureauCode)
                .orElseGet(() -> bureauRepository.findAll().stream().findFirst().orElseThrow(() -> new BadRequestException("No active Bureau configured.")));

        User user = null;
        if (complainant != null) {
            user = userRepository.findById(complainant.getId()).orElse(null);
        }

        int year = LocalDateTime.now().getYear();
        String caseNumber = "EDU-" + year + "-COMP-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        while (caseRepository.existsByCaseNumber(caseNumber)) {
            caseNumber = "EDU-" + year + "-COMP-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        }

        CaseEntity c = new CaseEntity();
        c.setCaseNumber(caseNumber);
        c.setSourceCaseId("PORTAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        c.setInstitution(inst);
        c.setBureau(bureau);
        c.setTitle(req.getTitle().trim());
        c.setDescription(req.getDescription().trim());
        c.setCategory(req.getCategory());
        c.setPriority(req.getPriority() != null && !req.getPriority().isBlank() ? req.getPriority().toUpperCase() : "MEDIUM");
        c.setStatus("RECEIVED");
        c.setReceiptDate(LocalDateTime.now());
        c.setExpectedDisposalDate(LocalDateTime.now().plusDays(45));
        c.setCreatedBy(user);

        CaseEntity savedCase = caseRepository.save(c);

        overlapService.checkForOverlaps(savedCase);

        CaseAction action = new CaseAction(
                savedCase,
                user,
                "COMPLAINT_FILED",
                null,
                "RECEIVED",
                "Grievance officially filed via EduVision Complaint Portal. Assigned to " + bureau.getName() + " (" + bureau.getCode() + ")."
        );
        action.setNextAction("Scrutiny & document verification by Bureau Officer");
        action.setNextActionDueDate(LocalDateTime.now().plusDays(7));
        caseActionRepository.save(action);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "COMPLAINANT",
                "COMPLAINT_SUBMITTED",
                "CASE",
                savedCase.getCaseNumber(),
                "Complainant submitted grievance against " + inst.getName() + " (" + inst.getPermanentId() + ") assigned to " + bureau.getCode(),
                httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1"
        );

        return mapToDto(savedCase);
    }

    @Transactional(readOnly = true)
    public List<CaseDto> getComplainantCases(UserPrincipal complainant) {
        if (complainant == null) return List.of();
        List<CaseEntity> list = caseRepository.findByCreatedBy_IdOrderByReceiptDateDesc(complainant.getId());
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PublicTrackingDto trackComplaintPublic(String caseNumber) {
        CaseEntity c = caseRepository.findByCaseNumber(caseNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No complaint record found with Case Reference: " + caseNumber));

        PublicTrackingDto dto = new PublicTrackingDto();
        dto.setCaseNumber(c.getCaseNumber());
        dto.setTitle(c.getTitle());
        dto.setCategory(c.getCategory());
        dto.setPriority(c.getPriority());
        dto.setStatus(c.getStatus());
        if (c.getInstitution() != null) {
            dto.setInstitutionName(c.getInstitution().getName());
            dto.setInstitutionPermanentId(c.getInstitution().getPermanentId());
            dto.setInstitutionRegion(c.getInstitution().getRegion());
            dto.setInstitutionCity(c.getInstitution().getCity());
        }
        if (c.getBureau() != null) {
            dto.setBureauName(c.getBureau().getName());
        }
        dto.setReceiptDate(c.getReceiptDate());
        dto.setExpectedDisposalDate(c.getExpectedDisposalDate());
        dto.setDisposedDate(c.getDisposedDate());

        List<CaseAction> actions = caseActionRepository.findByCaseEntityIdOrderByCreatedAtAsc(c.getId());
        for (CaseAction a : actions) {
            String stage = a.getActionType();
            String desc = a.getRemarks();
            if ("STATUS_CHANGE".equalsIgnoreCase(stage)) {
                stage = "Status: " + a.getToStatus();
            } else if ("COMPLAINT_FILED".equalsIgnoreCase(stage)) {
                stage = "Complaint Registered";
            }
            dto.getMilestones().add(new PublicTrackingDto.Milestone(stage, a.getToStatus() != null ? a.getToStatus() : c.getStatus(), desc, a.getCreatedAt()));
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public PagedResponse<CaseDto> getRegionalCases(String region, String status, String priority, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "receiptDate"));
        Page<CaseEntity> casePage = caseRepository.searchRegionalCases(region, status, priority, query, pageable);
        List<CaseDto> dtos = casePage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return new PagedResponse<>(dtos, casePage.getNumber(), casePage.getSize(), casePage.getTotalElements(), casePage.getTotalPages(), casePage.isLast());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRegionalStats(String region) {
        long total = caseRepository.countByInstitutionRegion(region);
        long active = caseRepository.countActiveByInstitutionRegion(region);
        long disposed = caseRepository.countDisposedByInstitutionRegion(region);
        long overdue = caseRepository.countOverdueByInstitutionRegion(region, LocalDateTime.now());

        Map<String, Object> map = new HashMap<>();
        map.put("region", region);
        map.put("totalCases", total);
        map.put("activeCases", active);
        map.put("disposedCases", disposed);
        map.put("overdueCases", overdue);
        return map;
    }

    @Transactional
    public CaseDto escalateRegionalCase(Long caseId, String reason, UserPrincipal principal, HttpServletRequest httpRequest) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;

        CaseAction action = new CaseAction(
                caseEntity,
                user,
                "REGIONAL_ESCALATION",
                caseEntity.getStatus(),
                caseEntity.getStatus(),
                "Escalated by Regional Office (" + (principal != null ? principal.getRegion() : "RO") + "): " + reason.trim()
        );
        action.setNextAction("Senior Authority Review & Directives");
        action.setNextActionDueDate(LocalDateTime.now().plusDays(5));
        caseActionRepository.save(action);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "REGIONAL_OFFICER",
                "CASE_ESCALATED",
                "CASE",
                caseEntity.getCaseNumber(),
                "Case escalated by Regional Office to Senior Authority. Reason: " + reason,
                httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1"
        );

        return mapToDto(caseEntity);
    }

    @Transactional
    public CaseDto updateStatus(Long caseId, UpdateStatusRequest request, UserPrincipal principal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            if (!caseEntity.getBureau().getId().equals(principal.getBureauId())) {
                throw new AccessDeniedCustomException("Access denied: You cannot update status of a case belonging to another Bureau.");
            }
        }

        String oldStatus = caseEntity.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        if (request.getRemarks() == null || request.getRemarks().trim().isEmpty()) {
            throw new BadRequestException("Mandatory action remarks are required for all status changes.");
        }

        caseEntity.setStatus(newStatus);
        if ("DISPOSED".equalsIgnoreCase(newStatus)) {
            caseEntity.setDisposedDate(LocalDateTime.now());
        } else {
            caseEntity.setDisposedDate(null);
        }

        CaseEntity updated = caseRepository.save(caseEntity);

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;

        CaseAction action = new CaseAction(updated, user, "STATUS_CHANGE", oldStatus, newStatus, request.getRemarks().trim());
        action.setNextAction(request.getNextAction());
        action.setNextActionDueDate(request.getNextActionDueDate());
        caseActionRepository.save(action);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "SYSTEM",
                "CASE_STATUS_UPDATE",
                "CASE",
                updated.getCaseNumber(),
                "Status changed from " + oldStatus + " to " + newStatus + ". Remarks: " + request.getRemarks(),
                "127.0.0.1"
        );

        return mapToDto(updated);
    }

    @Transactional
    public CaseActionDto addAction(Long caseId, AddActionRequest request, UserPrincipal principal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            if (!caseEntity.getBureau().getId().equals(principal.getBureauId())) {
                throw new AccessDeniedCustomException("Access denied: You cannot add actions to another Bureau's case.");
            }
        }

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;

        CaseAction action = new CaseAction(
                caseEntity,
                user,
                request.getActionType() != null ? request.getActionType() : "REMARK_ADDED",
                caseEntity.getStatus(),
                caseEntity.getStatus(),
                request.getRemarks().trim()
        );
        action.setNextAction(request.getNextAction());
        action.setNextActionDueDate(request.getNextActionDueDate());

        CaseAction saved = caseActionRepository.save(action);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "SYSTEM",
                "ACTION_ADDED",
                "CASE",
                caseEntity.getCaseNumber(),
                "Action recorded: " + request.getRemarks(),
                "127.0.0.1"
        );

        return mapActionToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CaseActionDto> getCaseHistory(Long caseId, UserPrincipal principal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            if (!caseEntity.getBureau().getId().equals(principal.getBureauId())) {
                throw new AccessDeniedCustomException("Access denied: Cannot view history of another Bureau's case.");
            }
        }

        List<CaseAction> actions = caseActionRepository.findByCaseEntityIdOrderByCreatedAtAsc(caseId);
        return actions.stream().map(this::mapActionToDto).collect(Collectors.toList());
    }

    @Transactional
    public TransferRequestDto createTransferRequest(Long caseId, CreateTransferRequest request, UserPrincipal principal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (principal != null && "BUREAU_OFFICER".equalsIgnoreCase(principal.getRole())) {
            if (!caseEntity.getBureau().getId().equals(principal.getBureauId())) {
                throw new AccessDeniedCustomException("Access denied: You can only request transfers for cases assigned to your Bureau.");
            }
        }

        Bureau toBureau = bureauRepository.findById(request.getToBureauId())
                .orElseThrow(() -> new BadRequestException("Destination Bureau not found with ID: " + request.getToBureauId()));

        if (caseEntity.getBureau().getId().equals(toBureau.getId())) {
            throw new BadRequestException("Cannot transfer a case to the same Bureau it is currently assigned to.");
        }

        User user = (principal != null) ? userRepository.findById(principal.getId()).orElse(null) : null;

        TransferRequest transfer = new TransferRequest();
        transfer.setCaseEntity(caseEntity);
        transfer.setFromBureau(caseEntity.getBureau());
        transfer.setToBureau(toBureau);
        transfer.setRequestedBy(user);
        transfer.setReason(request.getReason().trim());
        transfer.setStatus("PENDING");

        TransferRequest saved = transferRequestRepository.save(transfer);

        CaseAction action = new CaseAction(
                caseEntity,
                user,
                "TRANSFER_REQUESTED",
                caseEntity.getStatus(),
                caseEntity.getStatus(),
                "Inter-Bureau transfer requested from " + caseEntity.getBureau().getCode() + " to " +
                toBureau.getCode() + ". Reason: " + request.getReason().trim()
        );
        caseActionRepository.save(action);

        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "SYSTEM",
                "TRANSFER_REQUEST",
                "CASE",
                caseEntity.getCaseNumber(),
                "Transfer requested from " + caseEntity.getBureau().getCode() + " to " + toBureau.getCode(),
                "127.0.0.1"
        );

        return mapTransferToDto(saved);
    }

    public synchronized String generateUniqueCaseNumber() {
        int year = LocalDateTime.now().getYear();
        long count = caseRepository.count() + 1;
        String candidate = String.format("AICTE-%d-CASE-%03d", year, count);
        while (caseRepository.existsByCaseNumber(candidate)) {
            count++;
            candidate = String.format("AICTE-%d-CASE-%03d", year, count);
        }
        return candidate;
    }

    public CaseDto mapToDto(CaseEntity c) {
        CaseDto dto = new CaseDto();
        dto.setId(c.getId());
        dto.setCaseNumber(c.getCaseNumber());
        dto.setSourceCaseId(c.getSourceCaseId());
        if (c.getInstitution() != null) {
            dto.setInstitutionId(c.getInstitution().getId());
            dto.setInstitutionName(c.getInstitution().getName());
            dto.setPermanentId(c.getInstitution().getPermanentId());
            dto.setRegion(c.getInstitution().getRegion());
            dto.setState(c.getInstitution().getState());
            dto.setCity(c.getInstitution().getCity());
        }
        if (c.getBureau() != null) {
            dto.setBureauId(c.getBureau().getId());
            dto.setBureauCode(c.getBureau().getCode());
            dto.setBureauName(c.getBureau().getName());
        }
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setPriority(c.getPriority());
        dto.setStatus(c.getStatus());
        dto.setReceiptDate(c.getReceiptDate());
        dto.setExpectedDisposalDate(c.getExpectedDisposalDate());
        dto.setDisposedDate(c.getDisposedDate());
        dto.setOverdue(c.isOverdue());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    public CaseActionDto mapActionToDto(CaseAction a) {
        CaseActionDto dto = new CaseActionDto();
        dto.setId(a.getId());
        dto.setCaseId(a.getCaseEntity().getId());
        if (a.getUser() != null) {
            dto.setUserId(a.getUser().getId());
            dto.setUserFullName(a.getUser().getFullName());
            dto.setUserRole(a.getUser().getRole());
            if (a.getUser().getBureau() != null) {
                dto.setUserBureauCode(a.getUser().getBureau().getCode());
            }
        }
        dto.setActionType(a.getActionType());
        dto.setFromStatus(a.getFromStatus());
        dto.setToStatus(a.getToStatus());
        dto.setRemarks(a.getRemarks());
        dto.setNextAction(a.getNextAction());
        dto.setNextActionDueDate(a.getNextActionDueDate());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    public TransferRequestDto mapTransferToDto(TransferRequest t) {
        TransferRequestDto dto = new TransferRequestDto();
        dto.setId(t.getId());
        dto.setCaseId(t.getCaseEntity().getId());
        dto.setCaseNumber(t.getCaseEntity().getCaseNumber());
        dto.setCaseTitle(t.getCaseEntity().getTitle());
        if (t.getCaseEntity().getInstitution() != null) {
            dto.setInstitutionId(t.getCaseEntity().getInstitution().getId());
            dto.setInstitutionName(t.getCaseEntity().getInstitution().getName());
        }
        if (t.getFromBureau() != null) {
            dto.setFromBureauId(t.getFromBureau().getId());
            dto.setFromBureauCode(t.getFromBureau().getCode());
            dto.setFromBureauName(t.getFromBureau().getName());
        }
        if (t.getToBureau() != null) {
            dto.setToBureauId(t.getToBureau().getId());
            dto.setToBureauCode(t.getToBureau().getCode());
            dto.setToBureauName(t.getToBureau().getName());
        }
        if (t.getRequestedBy() != null) {
            dto.setRequestedByUserId(t.getRequestedBy().getId());
            dto.setRequestedByUserName(t.getRequestedBy().getFullName());
        }
        if (t.getReviewedBy() != null) {
            dto.setReviewedByUserId(t.getReviewedBy().getId());
            dto.setReviewedByUserName(t.getReviewedBy().getFullName());
        }
        dto.setReason(t.getReason());
        dto.setStatus(t.getStatus());
        dto.setDecisionRemarks(t.getDecisionRemarks());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
}
