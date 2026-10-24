package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.*;
import com.aicte.complaints.exception.AccessDeniedCustomException;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
        // Enforce bureau scoping for BUREAU_OFFICER
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

        // Enforce bureau scoping: a bureau officer can only access cases assigned to their bureau
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

        // Append initial action history
        CaseAction initialAction = new CaseAction(
                saved,
                user,
                "STATUS_CHANGE",
                null,
                "RECEIVED",
                "Case intake formally registered and assigned to " + bureau.getName() + " (" + bureau.getCode() + ")."
        );
        caseActionRepository.save(initialAction);

        // Audit Log
        auditLogService.logAction(
                user,
                user != null ? user.getEmail() : "SYSTEM",
                "CASE_CREATE",
                "CASE",
                saved.getCaseNumber(),
                "New case created for institution " + institution.getPermanentId() + " under Bureau " + bureau.getCode(),
                "127.0.0.1"
        );

        // Check for cross-bureau overlaps
        overlapService.checkForOverlaps(saved);

        return mapToDto(saved);
    }

    @Transactional
    public CaseDto updateStatus(Long caseId, UpdateStatusRequest request, UserPrincipal principal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        // Enforce bureau scoping
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

        // Append immutable action history
        CaseAction action = new CaseAction(updated, user, "STATUS_CHANGE", oldStatus, newStatus, request.getRemarks().trim());
        action.setNextAction(request.getNextAction());
        action.setNextActionDueDate(request.getNextActionDueDate());
        caseActionRepository.save(action);

        // Audit Log
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

        // Append to immutable action history
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
