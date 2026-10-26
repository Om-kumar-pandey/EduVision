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
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BureauRepository bureauRepository;
    private final CaseRepository caseRepository;
    private final InstitutionRepository institutionRepository;
    private final RegionRepository regionRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final CaseActionRepository caseActionRepository;
    private final OverlapAlertRepository overlapAlertRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AuthService authService;
    private final CaseService caseService;

    public AdminService(UserRepository userRepository,
                        BureauRepository bureauRepository,
                        CaseRepository caseRepository,
                        InstitutionRepository institutionRepository,
                        RegionRepository regionRepository,
                        SystemSettingRepository systemSettingRepository,
                        SupportTicketRepository supportTicketRepository,
                        TransferRequestRepository transferRequestRepository,
                        CaseActionRepository caseActionRepository,
                        OverlapAlertRepository overlapAlertRepository,
                        PasswordEncoder passwordEncoder,
                        AuditLogService auditLogService,
                        AuthService authService,
                        CaseService caseService) {
        this.userRepository = userRepository;
        this.bureauRepository = bureauRepository;
        this.caseRepository = caseRepository;
        this.institutionRepository = institutionRepository;
        this.regionRepository = regionRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.caseActionRepository = caseActionRepository;
        this.overlapAlertRepository = overlapAlertRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.authService = authService;
        this.caseService = caseService;
    }

    // ==========================================
    // TAB 1: DASHBOARD STATS & OVERVIEW
    // ==========================================

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        long totalInst = institutionRepository.count();
        long totalCases = caseRepository.count();
        long overdueCases = caseRepository.countOverdueCases(LocalDateTime.now());
        long unassignedCases = caseRepository.countUnassignedCases();
        long potentialDuplicates = caseRepository.countPotentialDuplicateCases();

        // Calculate pending cases (not Disposed/Resolved/Closed)
        long disposed = caseRepository.countByStatus("DISPOSED");
        long resolved = caseRepository.countByStatus("RESOLVED");
        long closed = caseRepository.countByStatus("CLOSED");
        long pendingCases = Math.max(0, totalCases - (disposed + resolved + closed));

        stats.setTotalInstitutions(totalInst);
        stats.setTotalCases(totalCases);
        stats.setPendingCases(pendingCases);
        stats.setOverdueCases(overdueCases);
        stats.setUnassignedCases(unassignedCases);
        stats.setPotentialDuplicateCases(potentialDuplicates);

        // Cases by Bureau
        List<BureauWorkloadDto> bureauWorkloads = bureauRepository.findAll().stream().map(b -> {
            BureauWorkloadDto dto = new BureauWorkloadDto();
            dto.setBureauId(b.getId());
            dto.setBureauCode(b.getCode());
            dto.setBureauName(b.getName());
            dto.setTotalCases(caseRepository.countByBureauId(b.getId()));
            return dto;
        }).collect(Collectors.toList());
        stats.setCasesByBureau(bureauWorkloads);

        // Cases by Status
        Map<String, Long> statusMap = new LinkedHashMap<>();
        String[] statuses = {"RECEIVED", "UNDER_REVIEW", "PENDING_ASSIGNMENT", "IN_PROGRESS", "AWAITING_INSTITUTION_RESPONSE", "AWAITING_INTERNAL_REVIEW", "RESOLVED", "DISPOSED", "CLOSED"};
        for (String s : statuses) {
            statusMap.put(s, caseRepository.countByStatus(s));
        }
        stats.setCasesByStatus(statusMap);

        // Region Summary
        List<RegionDto> regionSummaries = getAllRegions();
        stats.setRegionSummary(regionSummaries);

        // Recent 10 Cases
        List<CaseDto> recentCases = caseRepository.findTop10ByOrderByReceiptDateDesc().stream()
                .map(caseService::mapToDto)
                .collect(Collectors.toList());
        stats.setRecentCases(recentCases);

        // Recent Activities from Audit Logs
        PagedResponse<AuditLogDto> auditResp = auditLogService.getAuditLogs(null, null, 0, 10);
        if (auditResp != null && auditResp.getContent() != null) {
            stats.setRecentActivities(auditResp.getContent());
        }

        return stats;
    }

    // ==========================================
    // TAB 2: USERS & ROLES MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getUsers(String role, Long bureauId, String region, Boolean isActive, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.searchUsers(
                (role != null && !role.isBlank()) ? role.trim().toUpperCase() : null,
                bureauId,
                (region != null && !region.isBlank()) ? region.trim() : null,
                isActive,
                (query != null && !query.isBlank()) ? query.trim() : null,
                pageable
        );

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
        user.setRegion(request.getRegion());
        user.setIsActive(true);

        User saved = userRepository.save(user);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "USER_CREATE",
                "USER",
                saved.getId().toString(),
                "New user account created: " + saved.getEmail() + " with role: " + saved.getRole(),
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
        if (request.getRegion() != null) user.setRegion(request.getRegion());
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

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "USER_UPDATE",
                "USER",
                updated.getId().toString(),
                "User account updated for: " + updated.getEmail() + " (Role: " + updated.getRole() + ")",
                "127.0.0.1"
        );

        return authService.mapToUserDto(updated);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword, UserPrincipal adminPrincipal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters in length.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "PASSWORD_RESET",
                "USER",
                user.getId().toString(),
                "Administrative password reset performed for user: " + user.getEmail(),
                "127.0.0.1"
        );
    }

    @Transactional
    public UserDto toggleUserStatus(Long userId, boolean active, UserPrincipal adminPrincipal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setIsActive(active);
        User saved = userRepository.save(user);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "USER",
                user.getId().toString(),
                "Account status set to " + (active ? "ACTIVE" : "INACTIVE") + " for user: " + user.getEmail(),
                "127.0.0.1"
        );

        return authService.mapToUserDto(saved);
    }

    @Transactional(readOnly = true)
    public UserDto getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return authService.mapToUserDto(user);
    }

    // ==========================================
    // TAB 3: INSTITUTIONS REGISTRY
    // ==========================================

    @Transactional(readOnly = true)
    public PagedResponse<InstitutionDto> getInstitutions(String query, String region, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        Page<Institution> instPage = institutionRepository.searchInstitutions(query, region, pageable);

        List<InstitutionDto> dtos = instPage.getContent().stream()
                .map(this::mapInstitutionToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                instPage.getNumber(),
                instPage.getSize(),
                instPage.getTotalElements(),
                instPage.getTotalPages(),
                instPage.isLast()
        );
    }

    @Transactional
    public InstitutionDto createInstitution(InstitutionDto dto, UserPrincipal adminPrincipal) {
        if (institutionRepository.existsByPermanentId(dto.getPermanentId().trim())) {
            throw new BadRequestException("An institution with Permanent ID '" + dto.getPermanentId() + "' already exists.");
        }

        Institution inst = new Institution();
        inst.setPermanentId(dto.getPermanentId().trim());
        inst.setName(dto.getName().trim());
        inst.setRegion(dto.getRegion());
        inst.setState(dto.getState());
        inst.setCity(dto.getCity());
        inst.setAddress(dto.getAddress());
        inst.setInstitutionType(dto.getInstitutionType() != null ? dto.getInstitutionType() : "Engineering & Technology");
        inst.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "APPROVED");
        inst.setContactEmail(dto.getContactEmail());
        inst.setContactPhone(dto.getContactPhone());
        inst.setIsVerified(dto.isVerified());

        Institution saved = institutionRepository.save(inst);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "INSTITUTION_CREATE",
                "INSTITUTION",
                saved.getPermanentId(),
                "New institution registered: " + saved.getName() + " (" + saved.getPermanentId() + ")",
                "127.0.0.1"
        );

        return mapInstitutionToDto(saved);
    }

    @Transactional
    public InstitutionDto updateInstitution(Long id, InstitutionDto dto, UserPrincipal adminPrincipal) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));

        if (dto.getName() != null) inst.setName(dto.getName().trim());
        if (dto.getRegion() != null) inst.setRegion(dto.getRegion().trim());
        if (dto.getState() != null) inst.setState(dto.getState().trim());
        if (dto.getCity() != null) inst.setCity(dto.getCity().trim());
        if (dto.getAddress() != null) inst.setAddress(dto.getAddress().trim());
        if (dto.getInstitutionType() != null) inst.setInstitutionType(dto.getInstitutionType());
        if (dto.getApprovalStatus() != null) inst.setApprovalStatus(dto.getApprovalStatus());
        if (dto.getContactEmail() != null) inst.setContactEmail(dto.getContactEmail());
        if (dto.getContactPhone() != null) inst.setContactPhone(dto.getContactPhone());
        inst.setIsVerified(dto.isVerified());

        Institution updated = institutionRepository.save(inst);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "INSTITUTION_UPDATE",
                "INSTITUTION",
                updated.getPermanentId(),
                "Institution details updated for: " + updated.getName() + " (" + updated.getPermanentId() + ")",
                "127.0.0.1"
        );

        return mapInstitutionToDto(updated);
    }

    @Transactional
    public InstitutionDto verifyInstitution(Long id, boolean isVerified, UserPrincipal adminPrincipal) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));

        inst.setIsVerified(isVerified);
        Institution updated = institutionRepository.save(inst);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                isVerified ? "INSTITUTION_VERIFIED" : "INSTITUTION_UNVERIFIED",
                "INSTITUTION",
                updated.getPermanentId(),
                "Institution verification status set to " + (isVerified ? "VERIFIED" : "UNVERIFIED") + " for " + updated.getName(),
                "127.0.0.1"
        );

        return mapInstitutionToDto(updated);
    }

    @Transactional(readOnly = true)
    public InstitutionDto getInstitutionDetails(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));
        return mapInstitutionToDto(inst);
    }

    private InstitutionDto mapInstitutionToDto(Institution i) {
        InstitutionDto dto = new InstitutionDto();
        dto.setId(i.getId());
        dto.setPermanentId(i.getPermanentId());
        dto.setName(i.getName());
        dto.setRegion(i.getRegion());
        dto.setState(i.getState());
        dto.setCity(i.getCity());
        dto.setAddress(i.getAddress());
        dto.setInstitutionType(i.getInstitutionType());
        dto.setApprovalStatus(i.getApprovalStatus());
        dto.setContactEmail(i.getContactEmail());
        dto.setContactPhone(i.getContactPhone());
        dto.setVerified(i.getIsVerified() != null && i.getIsVerified());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setUpdatedAt(i.getUpdatedAt());
        return dto;
    }

    // ==========================================
    // TAB 4: BUREAUS & CELLS MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<BureauDto> getAllBureausDetailed() {
        return bureauRepository.findAll().stream().map(b -> {
            BureauDto dto = mapBureauToDto(b);
            dto.setTotalCases(caseRepository.countByBureauId(b.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public BureauDto createBureau(BureauDto dto, UserPrincipal adminPrincipal) {
        if (bureauRepository.findByCode(dto.getCode().trim().toUpperCase()).isPresent()) {
            throw new BadRequestException("A Bureau with short code '" + dto.getCode() + "' already exists.");
        }

        Bureau b = new Bureau();
        b.setCode(dto.getCode().trim().toUpperCase());
        b.setName(dto.getName().trim());
        b.setDescription(dto.getDescription());
        b.setContactEmail(dto.getContactEmail());
        b.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Bureau saved = bureauRepository.save(b);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "BUREAU_CREATE",
                "BUREAU",
                saved.getCode(),
                "New Bureau/Cell created: " + saved.getName() + " (" + saved.getCode() + ")",
                "127.0.0.1"
        );

        return mapBureauToDto(saved);
    }

    @Transactional
    public BureauDto updateBureau(Long id, BureauDto dto, UserPrincipal adminPrincipal) {
        Bureau b = bureauRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bureau not found with ID: " + id));

        if (dto.getName() != null) b.setName(dto.getName().trim());
        if (dto.getDescription() != null) b.setDescription(dto.getDescription().trim());
        if (dto.getContactEmail() != null) b.setContactEmail(dto.getContactEmail());
        if (dto.getIsActive() != null) b.setIsActive(dto.getIsActive());

        Bureau updated = bureauRepository.save(b);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "BUREAU_UPDATE",
                "BUREAU",
                updated.getCode(),
                "Bureau/Cell details updated for: " + updated.getName() + " (" + updated.getCode() + ")",
                "127.0.0.1"
        );

        return mapBureauToDto(updated);
    }

    // ==========================================
    // TAB 5: REGIONS MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<RegionDto> getAllRegions() {
        return regionRepository.findAll().stream().map(r -> {
            RegionDto dto = new RegionDto();
            dto.setId(r.getId());
            dto.setName(r.getName());
            dto.setCode(r.getCode());
            dto.setJurisdictionStates(r.getJurisdictionStates());
            dto.setCoordinatorName(r.getCoordinatorName());
            dto.setCoordinatorEmail(r.getCoordinatorEmail());
            dto.setStatus(r.getStatus());
            dto.setCreatedAt(r.getCreatedAt());

            // Real institution count
            dto.setTotalInstitutions(institutionRepository.countByRegion(r.getName().replace(" Region", "")));
            dto.setTotalCases(caseRepository.countByInstitutionRegion(r.getName().replace(" Region", "")));
            dto.setPendingCases(caseRepository.countActiveByInstitutionRegion(r.getName().replace(" Region", "")));
            dto.setOverdueCases(caseRepository.countOverdueByInstitutionRegion(r.getName().replace(" Region", ""), LocalDateTime.now()));

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public RegionDto createRegion(RegionDto dto, UserPrincipal adminPrincipal) {
        if (regionRepository.findByName(dto.getName().trim()).isPresent()) {
            throw new BadRequestException("A Region named '" + dto.getName() + "' already exists.");
        }

        Region r = new Region();
        r.setName(dto.getName().trim());
        r.setCode(dto.getCode().trim().toUpperCase());
        r.setJurisdictionStates(dto.getJurisdictionStates());
        r.setCoordinatorName(dto.getCoordinatorName());
        r.setCoordinatorEmail(dto.getCoordinatorEmail());
        r.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Region saved = regionRepository.save(r);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "REGION_CREATE",
                "REGION",
                saved.getCode(),
                "New regional jurisdiction created: " + saved.getName() + " (" + saved.getCode() + ")",
                "127.0.0.1"
        );

        return mapRegionToDto(saved);
    }

    @Transactional
    public RegionDto updateRegion(Long id, RegionDto dto, UserPrincipal adminPrincipal) {
        Region r = regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with ID: " + id));

        if (dto.getName() != null) r.setName(dto.getName().trim());
        if (dto.getCode() != null) r.setCode(dto.getCode().trim().toUpperCase());
        if (dto.getJurisdictionStates() != null) r.setJurisdictionStates(dto.getJurisdictionStates());
        if (dto.getCoordinatorName() != null) r.setCoordinatorName(dto.getCoordinatorName());
        if (dto.getCoordinatorEmail() != null) r.setCoordinatorEmail(dto.getCoordinatorEmail());
        if (dto.getStatus() != null) r.setStatus(dto.getStatus());

        Region updated = regionRepository.save(r);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "REGION_UPDATE",
                "REGION",
                updated.getCode(),
                "Regional jurisdiction updated for: " + updated.getName() + " (" + updated.getCode() + ")",
                "127.0.0.1"
        );

        return mapRegionToDto(updated);
    }

    private RegionDto mapRegionToDto(Region r) {
        RegionDto dto = new RegionDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setCode(r.getCode());
        dto.setJurisdictionStates(r.getJurisdictionStates());
        dto.setCoordinatorName(r.getCoordinatorName());
        dto.setCoordinatorEmail(r.getCoordinatorEmail());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    // ==========================================
    // TAB 6: CASES & WORKFLOW MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public PagedResponse<CaseDto> getAdminCases(Long bureauId, String status, String priority, String category, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "receiptDate"));
        Page<CaseEntity> casePage = caseRepository.searchCases(bureauId, status, priority, category, query, pageable);

        List<CaseDto> dtos = casePage.getContent().stream()
                .map(caseService::mapToDto)
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

    @Transactional
    public CaseDto assignCase(Long caseId, AssignCaseRequest request, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        User officer = null;
        if (request.getOfficerUserId() != null) {
            officer = userRepository.findById(request.getOfficerUserId())
                    .orElseThrow(() -> new BadRequestException("Officer user not found with ID: " + request.getOfficerUserId()));
            caseEntity.setAssignedTo(officer);
        }

        if (request.getPrimaryBureauId() != null) {
            Bureau bureau = bureauRepository.findById(request.getPrimaryBureauId())
                    .orElseThrow(() -> new BadRequestException("Bureau not found with ID: " + request.getPrimaryBureauId()));
            caseEntity.setBureau(bureau);
        }

        if (request.getSupportingBureaus() != null) {
            caseEntity.setSupportingBureaus(request.getSupportingBureaus().trim());
        }

        if (request.getDueDate() != null) {
            caseEntity.setExpectedDisposalDate(request.getDueDate());
        }

        if ("RECEIVED".equalsIgnoreCase(caseEntity.getStatus()) || "PENDING_ASSIGNMENT".equalsIgnoreCase(caseEntity.getStatus())) {
            caseEntity.setStatus("IN_PROGRESS");
        }

        CaseEntity saved = caseRepository.save(caseEntity);

        User adminUser = resolveAdminUser(adminPrincipal);

        // Record Case Action Timeline
        CaseAction action = new CaseAction(
                saved,
                adminUser,
                "CASE_ASSIGNED",
                caseEntity.getStatus(),
                saved.getStatus(),
                "Case assigned to Officer: " + (officer != null ? officer.getFullName() : "Bureau Pool") +
                ". Primary Bureau: " + saved.getBureau().getCode() +
                (saved.getSupportingBureaus() != null ? " | Supporting Units: " + saved.getSupportingBureaus() : "") +
                ". Justification: " + (request.getReason() != null ? request.getReason() : "Direct Administrative Allocation")
        );
        caseActionRepository.save(action);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "CASE_ASSIGNED",
                "CASE",
                saved.getCaseNumber(),
                "Case assigned to " + (officer != null ? officer.getEmail() : saved.getBureau().getCode()),
                "127.0.0.1"
        );

        return caseService.mapToDto(saved);
    }

    @Transactional
    public CaseDto updateCaseStatus(Long caseId, String newStatus, String remarks, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        String oldStatus = caseEntity.getStatus();
        String targetStatus = newStatus.trim().toUpperCase();

        caseEntity.setStatus(targetStatus);
        if ("DISPOSED".equalsIgnoreCase(targetStatus) || "RESOLVED".equalsIgnoreCase(targetStatus) || "CLOSED".equalsIgnoreCase(targetStatus)) {
            caseEntity.setDisposedDate(LocalDateTime.now());
        }

        CaseEntity saved = caseRepository.save(caseEntity);

        User adminUser = resolveAdminUser(adminPrincipal);
        CaseAction action = new CaseAction(
                saved,
                adminUser,
                "STATUS_CHANGE",
                oldStatus,
                targetStatus,
                remarks != null ? remarks.trim() : "Super Admin status transition from " + oldStatus + " to " + targetStatus
        );
        caseActionRepository.save(action);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "STATUS_UPDATED",
                "CASE",
                saved.getCaseNumber(),
                "Case status transitioned: " + oldStatus + " -> " + targetStatus + ". Remarks: " + remarks,
                "127.0.0.1"
        );

        return caseService.mapToDto(saved);
    }

    @Transactional
    public CaseActionDto recordInternalNote(Long caseId, String note, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (note == null || note.trim().isEmpty()) {
            throw new BadRequestException("Internal note text cannot be blank.");
        }

        caseEntity.setInternalNotes(
                (caseEntity.getInternalNotes() != null ? caseEntity.getInternalNotes() + "\n---\n" : "") +
                "[" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + " by " +
                (adminPrincipal != null ? adminPrincipal.getUsername() : "Super Admin") + "]: " + note.trim()
        );
        caseRepository.save(caseEntity);

        User adminUser = resolveAdminUser(adminPrincipal);
        CaseAction action = new CaseAction(
                caseEntity,
                adminUser,
                "INTERNAL_NOTE",
                caseEntity.getStatus(),
                caseEntity.getStatus(),
                "Internal Administrative Note recorded: " + note.trim()
        );
        CaseAction savedAction = caseActionRepository.save(action);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "INTERNAL_NOTE_ADDED",
                "CASE",
                caseEntity.getCaseNumber(),
                "Internal administrative note recorded on case " + caseEntity.getCaseNumber(),
                "127.0.0.1"
        );

        return caseService.mapActionToDto(savedAction);
    }

    @Transactional
    public CaseActionDto requestInstitutionResponse(Long caseId, String reason, LocalDateTime dueDate, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        caseEntity.setStatus("AWAITING_INSTITUTION_RESPONSE");
        caseRepository.save(caseEntity);

        User adminUser = resolveAdminUser(adminPrincipal);
        CaseAction action = new CaseAction(
                caseEntity,
                adminUser,
                "INSTITUTION_RESPONSE_REQUESTED",
                caseEntity.getStatus(),
                "AWAITING_INSTITUTION_RESPONSE",
                "Institution official clarification / response requested: " + reason.trim()
        );
        action.setNextAction("Submit Institution Response");
        action.setNextActionDueDate(dueDate != null ? dueDate : LocalDateTime.now().plusDays(10));

        CaseAction savedAction = caseActionRepository.save(action);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "INSTITUTION_RESPONSE_REQUESTED",
                "CASE",
                caseEntity.getCaseNumber(),
                "Official clarification requested from institution representative for case: " + caseEntity.getCaseNumber(),
                "127.0.0.1"
        );

        return caseService.mapActionToDto(savedAction);
    }

    @Transactional
    public CaseActionDto recordInstitutionResponse(Long caseId, String responseText, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        caseEntity.setInstitutionResponse(responseText.trim());
        caseEntity.setInstitutionResponseDate(LocalDateTime.now());
        caseEntity.setStatus("AWAITING_INTERNAL_REVIEW");
        caseRepository.save(caseEntity);

        User adminUser = resolveAdminUser(adminPrincipal);
        CaseAction action = new CaseAction(
                caseEntity,
                adminUser,
                "INSTITUTION_RESPONSE_SUBMITTED",
                "AWAITING_INSTITUTION_RESPONSE",
                "AWAITING_INTERNAL_REVIEW",
                "Official institution response submitted: " + responseText.trim()
        );
        CaseAction savedAction = caseActionRepository.save(action);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "INSTITUTION_RESPONSE_RECORDED",
                "CASE",
                caseEntity.getCaseNumber(),
                "Institution response recorded for case: " + caseEntity.getCaseNumber(),
                "127.0.0.1"
        );

        return caseService.mapActionToDto(savedAction);
    }

    @Transactional
    public CaseDto reviewDuplicateCase(Long caseId, Long duplicateOfCaseId, String decision, String remarks, UserPrincipal adminPrincipal) {
        CaseEntity caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        User adminUser = resolveAdminUser(adminPrincipal);

        if ("CONFIRM".equalsIgnoreCase(decision)) {
            caseEntity.setDuplicateOfCaseId(duplicateOfCaseId);
            caseEntity.setDuplicateStatus("CONFIRMED");
            caseEntity.setStatus("CLOSED");
            caseEntity.setDisposedDate(LocalDateTime.now());

            CaseAction action = new CaseAction(
                    caseEntity,
                    adminUser,
                    "DUPLICATE_CONFIRMED",
                    caseEntity.getStatus(),
                    "CLOSED",
                    "Case confirmed as duplicate of Master Case ID #" + duplicateOfCaseId + ". Reason: " + remarks
            );
            caseActionRepository.save(action);
        } else {
            caseEntity.setDuplicateStatus("DISMISSED");

            CaseAction action = new CaseAction(
                    caseEntity,
                    adminUser,
                    "DUPLICATE_DISMISSED",
                    caseEntity.getStatus(),
                    caseEntity.getStatus(),
                    "Potential duplicate flag dismissed by supervisory review. Remarks: " + remarks
            );
            caseActionRepository.save(action);
        }

        CaseEntity saved = caseRepository.save(caseEntity);

        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "DUPLICATE_REVIEWED",
                "CASE",
                saved.getCaseNumber(),
                "Duplicate review decision: " + decision + " for case " + saved.getCaseNumber(),
                "127.0.0.1"
        );

        return caseService.mapToDto(saved);
    }

    // ==========================================
    // TAB 7: REPORTS & ANALYTICS
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, Object> generateReport(String reportType, String dateFrom, String dateTo, Long bureauId, String region, String status) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", LocalDateTime.now().toString());
        report.put("reportType", reportType != null ? reportType : "CASE_SUMMARY");
        report.put("filters", Map.of(
                "dateFrom", dateFrom != null ? dateFrom : "All",
                "dateTo", dateTo != null ? dateTo : "All",
                "bureauId", bureauId != null ? bureauId : "All",
                "region", region != null ? region : "All",
                "status", status != null ? status : "All"
        ));

        long total = caseRepository.count();
        long overdue = caseRepository.countOverdueCases(LocalDateTime.now());
        long pending = Math.max(0, total - caseRepository.countByStatus("DISPOSED"));

        report.put("summaryMetrics", Map.of(
                "totalCases", total,
                "pendingCases", pending,
                "disposedCases", caseRepository.countByStatus("DISPOSED"),
                "overdueCases", overdue,
                "averageResolutionDays", 14.5,
                "complianceRatePercentage", total > 0 ? Math.round(((double)(total - overdue) / total) * 100) : 100
        ));

        // Bureau Workload Table
        List<Map<String, Object>> bureauRows = bureauRepository.findAll().stream().map(b -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("bureauCode", b.getCode());
            row.put("bureauName", b.getName());
            row.put("caseCount", caseRepository.countByBureauId(b.getId()));
            return row;
        }).collect(Collectors.toList());
        report.put("bureauWorkloads", bureauRows);

        // Region Distribution
        List<Map<String, Object>> regionRows = regionRepository.findAll().stream().map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("regionCode", r.getCode());
            row.put("regionName", r.getName());
            row.put("institutions", institutionRepository.countByRegion(r.getName().replace(" Region", "")));
            row.put("cases", caseRepository.countByInstitutionRegion(r.getName().replace(" Region", "")));
            return row;
        }).collect(Collectors.toList());
        report.put("regionSummaries", regionRows);

        return report;
    }

    // ==========================================
    // TAB 8: SYSTEM SETTINGS
    // ==========================================

    @Transactional(readOnly = true)
    public List<SystemSettingDto> getSettings() {
        return systemSettingRepository.findAll().stream().map(s -> {
            SystemSettingDto dto = new SystemSettingDto();
            dto.setId(s.getId());
            dto.setSettingKey(s.getSettingKey());
            dto.setSettingValue(s.getSettingValue());
            dto.setCategory(s.getCategory());
            dto.setDescription(s.getDescription());
            dto.setUpdatedAt(s.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateSettings(Map<String, String> settings, UserPrincipal adminPrincipal) {
        settings.forEach((key, val) -> {
            SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElseGet(() -> {
                SystemSetting s = new SystemSetting();
                s.setSettingKey(key);
                s.setCategory("GENERAL");
                return s;
            });
            setting.setSettingValue(val);
            systemSettingRepository.save(setting);
        });

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "SETTINGS_UPDATED",
                "SYSTEM",
                "SETTINGS",
                "Platform system settings updated: " + settings.keySet(),
                "127.0.0.1"
        );
    }

    // ==========================================
    // TAB 11: HELP & TECHNICAL SUPPORT TICKETS
    // ==========================================

    @Transactional(readOnly = true)
    public PagedResponse<SupportTicketDto> getSupportTickets(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SupportTicket> ticketPage = (status != null && !status.isBlank()) ?
                supportTicketRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable) :
                supportTicketRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<SupportTicketDto> dtos = ticketPage.getContent().stream()
                .map(this::mapTicketToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                ticketPage.getNumber(),
                ticketPage.getSize(),
                ticketPage.getTotalElements(),
                ticketPage.getTotalPages(),
                ticketPage.isLast()
        );
    }

    @Transactional
    public SupportTicketDto createSupportTicket(SupportTicketDto dto, UserPrincipal principal) {
        SupportTicket ticket = new SupportTicket();
        ticket.setTicketNumber("TKT-" + LocalDateTime.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
        ticket.setTitle(dto.getTitle().trim());
        ticket.setDescription(dto.getDescription().trim());
        ticket.setCategory(dto.getCategory() != null ? dto.getCategory() : "GENERAL_INQUIRY");
        ticket.setPriority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM");
        ticket.setStatus("OPEN");

        if (principal != null) {
            User user = userRepository.findById(principal.getId()).orElse(null);
            ticket.setCreatedBy(user);
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapTicketToDto(saved);
    }

    @Transactional
    public SupportTicketDto updateSupportTicket(Long id, String status, String resolutionNotes, UserPrincipal adminPrincipal) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with ID: " + id));

        if (status != null) ticket.setStatus(status.toUpperCase());
        if (resolutionNotes != null) ticket.setResolutionNotes(resolutionNotes.trim());

        SupportTicket saved = supportTicketRepository.save(ticket);

        User adminUser = resolveAdminUser(adminPrincipal);
        auditLogService.logAction(
                adminUser,
                adminUser != null ? adminUser.getEmail() : "ADMIN",
                "TICKET_RESOLVED",
                "SUPPORT_TICKET",
                ticket.getTicketNumber(),
                "Support ticket updated to status " + ticket.getStatus() + ". Notes: " + resolutionNotes,
                "127.0.0.1"
        );

        return mapTicketToDto(saved);
    }

    private SupportTicketDto mapTicketToDto(SupportTicket t) {
        SupportTicketDto dto = new SupportTicketDto();
        dto.setId(t.getId());
        dto.setTicketNumber(t.getTicketNumber());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setCategory(t.getCategory());
        dto.setPriority(t.getPriority());
        if (t.getCreatedBy() != null) {
            dto.setCreatedByUserId(t.getCreatedBy().getId());
            dto.setCreatedByUserName(t.getCreatedBy().getFullName());
            dto.setCreatedByUserEmail(t.getCreatedBy().getEmail());
        }
        dto.setStatus(t.getStatus());
        dto.setResolutionNotes(t.getResolutionNotes());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    // ==========================================
    // TOP NAV: GLOBAL SEARCH & NOTIFICATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, Object> globalSearch(String query) {
        Map<String, Object> results = new LinkedHashMap<>();
        if (query == null || query.trim().length() < 2) {
            results.put("cases", List.of());
            results.put("institutions", List.of());
            results.put("users", List.of());
            return results;
        }

        String q = query.trim();

        // 1. Search Cases
        Page<CaseEntity> casePage = caseRepository.searchCases(null, null, null, null, q, PageRequest.of(0, 5));
        results.put("cases", casePage.getContent().stream().map(caseService::mapToDto).collect(Collectors.toList()));

        // 2. Search Institutions
        Page<Institution> instPage = institutionRepository.searchInstitutions(q, null, PageRequest.of(0, 5));
        results.put("institutions", instPage.getContent().stream().map(this::mapInstitutionToDto).collect(Collectors.toList()));

        // 3. Search Users
        Page<User> userPage = userRepository.searchUsers(null, null, null, null, q, PageRequest.of(0, 5));
        results.put("users", userPage.getContent().stream().map(authService::mapToUserDto).collect(Collectors.toList()));

        return results;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotifications() {
        List<Map<String, Object>> notes = new ArrayList<>();

        // Check for overdue cases
        long overdueCount = caseRepository.countOverdueCases(LocalDateTime.now());
        if (overdueCount > 0) {
            notes.add(Map.of(
                    "type", "ALERT",
                    "title", "Overdue Complaint SLA Alert",
                    "message", overdueCount + " complaints have exceeded the approved SLA disposal timeline.",
                    "timestamp", LocalDateTime.now().minusMinutes(15).toString(),
                    "link", "cases"
            ));
        }

        // Check for unassigned cases
        long unassignedCount = caseRepository.countUnassignedCases();
        if (unassignedCount > 0) {
            notes.add(Map.of(
                    "type", "INFO",
                    "title", "Unassigned Complaints Pending Allocation",
                    "message", unassignedCount + " newly received complaints require officer allocation.",
                    "timestamp", LocalDateTime.now().minusMinutes(45).toString(),
                    "link", "cases"
            ));
        }

        // Check for pending inter-bureau transfer requests
        long pendingTransfers = transferRequestRepository.findAll().stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();
        if (pendingTransfers > 0) {
            notes.add(Map.of(
                    "type", "TRANSFER",
                    "title", "Inter-Bureau Transfer Requests",
                    "message", pendingTransfers + " case transfer requests are awaiting supervisory decision.",
                    "timestamp", LocalDateTime.now().minusHours(2).toString(),
                    "link", "bureaus"
            ));
        }

        return notes;
    }

    // ==========================================
    // REUSED HELPER MAPPINGS
    // ==========================================

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

        User adminUser = resolveAdminUser(adminPrincipal);
        CaseEntity caseEntity = request.getCaseEntity();

        if (approve) {
            Bureau oldBureau = caseEntity.getBureau();
            Bureau targetBureau = request.getToBureau();

            caseEntity.setBureau(targetBureau);
            caseRepository.save(caseEntity);

            request.setStatus("APPROVED");
            request.setReviewedBy(adminUser);
            request.setDecisionRemarks(decisionRemarks);
            transferRequestRepository.save(request);

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
                    "Case transferred to " + targetBureau.getCode() + ". Canonical Case ID preserved.",
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

    private User resolveAdminUser(UserPrincipal adminPrincipal) {
        if (adminPrincipal != null && adminPrincipal.getId() != null) {
            Optional<User> u = userRepository.findById(adminPrincipal.getId());
            if (u.isPresent()) return u.get();
        }
        return userRepository.findByRole("SYS_ADMIN").stream().findFirst().orElseGet(() ->
                userRepository.findAll().stream().findFirst().orElse(null));
    }
}
