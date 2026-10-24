package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.*;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BureauRepository bureauRepository;
    private final CaseRepository caseRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final CaseActionRepository caseActionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public AdminService(UserRepository userRepository,
                        BureauRepository bureauRepository,
                        CaseRepository caseRepository,
                        TransferRequestRepository transferRequestRepository,
                        CaseActionRepository caseActionRepository,
                        PasswordEncoder passwordEncoder,
                        AuditLogService auditLogService,
                        AuthService authService) {
        this.userRepository = userRepository;
        this.bureauRepository = bureauRepository;
        this.caseRepository = caseRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.caseActionRepository = caseActionRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findByOrderByCreatedAtDesc(pageable);

        List<UserDto> dtos = userPage.getContent().stream()
                .map(authService::mapToUserDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, UserPrincipal adminPrincipal) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException("A user with email '" + request.getEmail() + "' already exists.");
        }

        Bureau bureau = null;
        if (request.getBureauId() != null) {
            bureau = bureauRepository.findById(request.getBureauId())
                    .orElseThrow(() -> new BadRequestException("Bureau not found with ID: " + request.getBureauId()));
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole().toUpperCase());
        user.setBureau(bureau);
        user.setDesignation(request.getDesignation());
        user.setPhone(request.getPhone());
        user.setIsActive(true);

        User saved = userRepository.save(user);

        User adminUser = (adminPrincipal != null) ? userRepository.findById(adminPrincipal.getId()).orElse(null) : null;
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "USER_CREATE",
                "USER",
                saved.getId().toString(),
                "New user created: " + saved.getEmail() + " with role " + saved.getRole(),
                "127.0.0.1"
        );

        return authService.mapToUserDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long userId, UpdateUserRequest request, UserPrincipal adminPrincipal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getRole() != null) user.setRole(request.getRole().toUpperCase());
        if (request.getDesignation() != null) user.setDesignation(request.getDesignation());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        if (request.getBureauId() != null) {
            Bureau bureau = bureauRepository.findById(request.getBureauId())
                    .orElseThrow(() -> new BadRequestException("Bureau not found with ID: " + request.getBureauId()));
            user.setBureau(bureau);
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updated = userRepository.save(user);

        User adminUser = (adminPrincipal != null) ? userRepository.findById(adminPrincipal.getId()).orElse(null) : null;
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "USER_UPDATE",
                "USER",
                updated.getId().toString(),
                "User account updated for: " + updated.getEmail(),
                "127.0.0.1"
        );

        return authService.mapToUserDto(updated);
    }

    @Transactional(readOnly = true)
    public List<BureauDto> getAllBureaus() {
        return bureauRepository.findAll().stream().map(this::mapBureauToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransferRequestDto> getTransferRequests(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransferRequest> reqPage = (status != null && !status.isEmpty()) ?
                transferRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable) :
                transferRequestRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<TransferRequestDto> dtos = reqPage.getContent().stream()
                .map(this::mapTransferToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                reqPage.getNumber(),
                reqPage.getSize(),
                reqPage.getTotalElements(),
                reqPage.getTotalPages(),
                reqPage.isLast()
        );
    }

    @Transactional
    public TransferRequestDto decideTransfer(Long requestId, boolean approve, String decisionRemarks, UserPrincipal adminPrincipal) {
        TransferRequest request = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer request not found with ID: " + requestId));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Transfer request is already processed with status: " + request.getStatus());
        }

        User adminUser = (adminPrincipal != null) ? userRepository.findById(adminPrincipal.getId()).orElse(null) : null;
        CaseEntity caseEntity = request.getCaseEntity();

        if (approve) {
            Bureau oldBureau = caseEntity.getBureau();
            Bureau targetBureau = request.getToBureau();

            // Re-assign bureau while preserving original Case ID
            caseEntity.setBureau(targetBureau);
            caseRepository.save(caseEntity);

            request.setStatus("APPROVED");
            request.setReviewedBy(adminUser);
            request.setDecisionRemarks(decisionRemarks);
            transferRequestRepository.save(request);

            // Log immutable case action
            CaseAction action = new CaseAction(
                    caseEntity,
                    adminUser,
                    "TRANSFER_APPROVED",
                    caseEntity.getStatus(),
                    caseEntity.getStatus(),
                    "Inter-Bureau transfer APPROVED from " + oldBureau.getCode() + " to " + targetBureau.getCode() +
                    ". Decision remarks: " + (decisionRemarks != null ? decisionRemarks : "None")
            );
            caseActionRepository.save(action);

            auditLogService.logAction(
                    adminUser,
                    adminUser != null ? adminUser.getEmail() : "ADMIN",
                    "TRANSFER_APPROVED",
                    "CASE",
                    caseEntity.getCaseNumber(),
                    "Case transferred to " + targetBureau.getCode() + ". Case ID preserved.",
                    "127.0.0.1"
            );
        } else {
            request.setStatus("REJECTED");
            request.setReviewedBy(adminUser);
            request.setDecisionRemarks(decisionRemarks);
            transferRequestRepository.save(request);

            CaseAction action = new CaseAction(
                    caseEntity,
                    adminUser,
                    "TRANSFER_REJECTED",
                    caseEntity.getStatus(),
                    caseEntity.getStatus(),
                    "Inter-Bureau transfer REJECTED by supervisory authority. Remarks: " +
                    (decisionRemarks != null ? decisionRemarks : "None")
            );
            caseActionRepository.save(action);

            auditLogService.logAction(
                    adminUser,
                    adminUser != null ? adminUser.getEmail() : "ADMIN",
                    "TRANSFER_REJECTED",
                    "CASE",
                    caseEntity.getCaseNumber(),
                    "Transfer rejected. Case remains with " + caseEntity.getBureau().getCode(),
                    "127.0.0.1"
            );
        }

        return mapTransferToDto(request);
    }

    public BureauDto mapBureauToDto(Bureau b) {
        BureauDto dto = new BureauDto();
        dto.setId(b.getId());
        dto.setCode(b.getCode());
        dto.setName(b.getName());
        dto.setDescription(b.getDescription());
        dto.setContactEmail(b.getContactEmail());
        dto.setIsActive(b.getIsActive());
        dto.setCreatedAt(b.getCreatedAt());
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
