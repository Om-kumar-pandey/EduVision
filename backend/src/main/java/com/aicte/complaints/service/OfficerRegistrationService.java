package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.Bureau;
import com.aicte.complaints.entity.OfficerRegistrationRequest;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.BureauRepository;
import com.aicte.complaints.repository.OfficerRegistrationRequestRepository;
import com.aicte.complaints.repository.UserRepository;
import com.aicte.complaints.security.JwtTokenProvider;
import com.aicte.complaints.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OfficerRegistrationService {

    private final OfficerRegistrationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final BureauRepository bureauRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;
    private final EmailNotificationService emailService;

    public OfficerRegistrationService(OfficerRegistrationRequestRepository requestRepository,
                                      UserRepository userRepository,
                                      BureauRepository bureauRepository,
                                      PasswordEncoder passwordEncoder,
                                      JwtTokenProvider tokenProvider,
                                      AuditLogService auditLogService,
                                      EmailNotificationService emailService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.bureauRepository = bureauRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    /**
     * Step 1: Officer submits an access request
     */
    @Transactional
    public OfficerRegistrationRequestDto submitRequest(SubmitOfficerRequestDto dto, String ipAddress) {
        String cleanEmail = dto.getEmail().trim().toLowerCase();

        // 1. Validate Bureau
        String bureauCode = dto.getRequestedBureauCode().trim().toUpperCase();
        if (!bureauCode.equals("RB") && !bureauCode.equals("PGRC")) {
            throw new BadRequestException("Requested Bureau must be either 'RB' (Regulation Bureau) or 'PGRC' (Public Grievance Redressal Cell).");
        }
        bureauRepository.findByCode(bureauCode)
                .orElseThrow(() -> new BadRequestException("Bureau '" + bureauCode + "' is not currently active in the system."));

        // 2. Check if an active account already exists
        Optional<User> existingUser = userRepository.findByEmail(cleanEmail);
        if (existingUser.isPresent() && Boolean.TRUE.equals(existingUser.get().getIsActive())) {
            throw new BadRequestException("An active officer account with email '" + cleanEmail + "' already exists. Please sign in directly.");
        }

        // 3. Check for existing pending request
        if (requestRepository.existsByEmailAndStatus(cleanEmail, "PENDING_APPROVAL")) {
            throw new BadRequestException("An access request for email '" + cleanEmail + "' is already submitted and pending Super Admin review.");
        }

        // 4. Generate unique Request ID: REQ-2026-XXXX
        int year = LocalDateTime.now().getYear();
        String requestId = "REQ-" + year + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        while (requestRepository.findByRequestId(requestId).isPresent()) {
            requestId = "REQ-" + year + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        }

        OfficerRegistrationRequest req = new OfficerRegistrationRequest();
        req.setRequestId(requestId);
        req.setFullName(dto.getFullName().trim());
        req.setEmail(cleanEmail);
        req.setEmployeeId(dto.getEmployeeId().trim());
        req.setRequestedRole("BUREAU_OFFICER");
        req.setRequestedBureauCode(bureauCode);
        req.setDesignation(dto.getDesignation().trim());
        req.setDepartment(dto.getDepartment().trim());
        req.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        req.setVerificationInfo(dto.getVerificationInfo().trim());
        req.setStatus("PENDING_APPROVAL");

        OfficerRegistrationRequest saved = requestRepository.save(req);

        // Audit Log
        auditLogService.logAction(
                null,
                cleanEmail,
                "OFFICER_REGISTRATION_SUBMITTED",
                "OFFICER_REQUEST",
                saved.getRequestId(),
                "New access request submitted for " + saved.getFullName() + " (" + cleanEmail + ") for Bureau " + bureauCode,
                ipAddress != null ? ipAddress : "127.0.0.1"
        );

        return mapToDto(saved);
    }

    /**
     * Step 2: Show the requests in Super Admin dashboard
     */
    @Transactional(readOnly = true)
    public PagedResponse<OfficerRegistrationRequestDto> getRequests(String status, String bureauCode, String query, int page, int size) {
        String effectiveStatus = (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) ? status.toUpperCase() : null;
        String effectiveBureau = (bureauCode != null && !bureauCode.isBlank() && !bureauCode.equalsIgnoreCase("ALL")) ? bureauCode.toUpperCase() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OfficerRegistrationRequest> pageResult = requestRepository.searchRequests(effectiveStatus, effectiveBureau, query, pageable);

        List<OfficerRegistrationRequestDto> dtos = pageResult.getContent().stream()
                .map(this::mapToDto)
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
    public OfficerRegistrationRequestDto getRequestById(Long id) {
        OfficerRegistrationRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found with ID: " + id));
        return mapToDto(req);
    }

    /**
     * Step 3: Super Admin reviews & approves the request
     */
    @Transactional
    public OfficerRegistrationRequestDto approveRequest(Long id, ApproveOfficerRequestDto dto, UserPrincipal adminPrincipal, String ipAddress) {
        OfficerRegistrationRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found with ID: " + id));

        if (!"PENDING_APPROVAL".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is already in status: " + req.getStatus());
        }

        Bureau bureau = bureauRepository.findByCode(req.getRequestedBureauCode())
                .orElseThrow(() -> new BadRequestException("Requested Bureau code '" + req.getRequestedBureauCode() + "' is invalid."));

        User adminUser = userRepository.findById(adminPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Super Admin user not found."));

        // Generate secure 64-char one-time activation token with 48 hours validity
        String activationToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiry = LocalDateTime.now().plusHours(48);

        req.setStatus("APPROVED");
        req.setApprovedBy(adminUser);
        req.setApprovedAt(LocalDateTime.now());
        req.setActivationToken(activationToken);
        req.setTokenExpiry(expiry);
        req.setIsActivated(false);

        OfficerRegistrationRequest saved = requestRepository.save(req);

        // Prepare or reserve user account in deactivated state awaiting activation
        Optional<User> optUser = userRepository.findByEmail(req.getEmail());
        User user = optUser.orElseGet(User::new);
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setRole("BUREAU_OFFICER");
        user.setBureau(bureau);
        user.setDesignation(req.getDesignation());
        user.setPhone(req.getPhone());
        user.setIsActive(false); // deactivated until one-time password setup
        if (user.getPasswordHash() == null) {
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // secure random placeholder
        }
        userRepository.save(user);

        // Step 4: Dispatch secure activation email
        emailService.sendOfficerActivationEmail(
                req.getEmail(),
                req.getFullName(),
                "BUREAU_OFFICER",
                bureau.getName(),
                activationToken,
                expiry
        );

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "OFFICER_REQUEST_APPROVED",
                "OFFICER_REQUEST",
                saved.getRequestId(),
                "Super Admin approved officer request " + saved.getRequestId() + " for " + saved.getFullName() +
                        " (" + saved.getEmail() + ") - Assigned Bureau: " + bureau.getCode(),
                ipAddress != null ? ipAddress : "127.0.0.1"
        );

        return mapToDto(saved);
    }

    /**
     * Step 3: Super Admin rejects the request
     */
    @Transactional
    public OfficerRegistrationRequestDto rejectRequest(Long id, RejectOfficerRequestDto dto, UserPrincipal adminPrincipal, String ipAddress) {
        OfficerRegistrationRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found with ID: " + id));

        if (!"PENDING_APPROVAL".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is already in status: " + req.getStatus());
        }

        User adminUser = userRepository.findById(adminPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Super Admin user not found."));

        req.setStatus("REJECTED");
        req.setRejectionReason(dto.getReason().trim());
        req.setRejectedAt(LocalDateTime.now());

        OfficerRegistrationRequest saved = requestRepository.save(req);

        // Send rejection notification
        emailService.sendOfficerRejectionEmail(req.getEmail(), req.getFullName(), req.getRequestedBureauCode(), dto.getReason().trim());

        auditLogService.logAction(
                adminUser,
                adminUser.getEmail(),
                "OFFICER_REQUEST_REJECTED",
                "OFFICER_REQUEST",
                saved.getRequestId(),
                "Super Admin rejected officer request " + saved.getRequestId() + " (" + saved.getEmail() + "). Reason: " + dto.getReason().trim(),
                ipAddress != null ? ipAddress : "127.0.0.1"
        );

        return mapToDto(saved);
    }

    /**
     * Step 4: Verify one-time activation token
     */
    @Transactional(readOnly = true)
    public OfficerRegistrationRequestDto verifyActivationToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Activation token is required.");
        }

        OfficerRegistrationRequest req = requestRepository.findByActivationToken(token.trim())
                .orElseThrow(() -> new BadRequestException("Invalid or non-existent activation token."));

        if (Boolean.TRUE.equals(req.getIsActivated())) {
            throw new BadRequestException("This official account has already been activated. Please sign in directly.");
        }

        if (req.getTokenExpiry() != null && req.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This activation token has expired. Please contact the AICTE Super Administrator for a new activation link.");
        }

        return mapToDto(req);
    }

    /**
     * Step 5: Officer sets password and activates account
     */
    @Transactional
    public AuthResponse activateAccount(ActivateAccountRequest request, String ipAddress) {
        String token = request.getToken().trim();
        String password = request.getPassword().trim();

        if (password.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters in length.");
        }

        OfficerRegistrationRequest req = requestRepository.findByActivationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or non-existent activation token."));

        if (Boolean.TRUE.equals(req.getIsActivated())) {
            throw new BadRequestException("This official account is already activated.");
        }

        if (req.getTokenExpiry() != null && req.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This activation token has expired. Please contact Super Admin.");
        }

        Bureau bureau = bureauRepository.findByCode(req.getRequestedBureauCode())
                .orElseThrow(() -> new BadRequestException("Bureau " + req.getRequestedBureauCode() + " not found."));

        // Activate or create user account with permanent password
        Optional<User> optUser = userRepository.findByEmail(req.getEmail());
        User user = optUser.orElseGet(User::new);
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("BUREAU_OFFICER");
        user.setBureau(bureau);
        user.setDesignation(req.getDesignation());
        user.setPhone(req.getPhone());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Mark request as activated
        req.setIsActivated(true);
        req.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(req);

        auditLogService.logAction(
                savedUser,
                savedUser.getEmail(),
                "OFFICER_ACCOUNT_ACTIVATED",
                "USER",
                savedUser.getId().toString(),
                "Officer successfully activated account for Bureau: " + bureau.getCode() + " (" + req.getDesignation() + ")",
                ipAddress != null ? ipAddress : "127.0.0.1"
        );

        // Generate JWT token for immediate authenticated session
        UserPrincipal principal = UserPrincipal.create(savedUser);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String jwt = tokenProvider.generateToken(auth);

        UserDto userDto = new UserDto();
        userDto.setId(savedUser.getId());
        userDto.setEmail(savedUser.getEmail());
        userDto.setFullName(savedUser.getFullName());
        userDto.setRole(savedUser.getRole());
        userDto.setBureauId(bureau.getId());
        userDto.setBureauCode(bureau.getCode());
        userDto.setBureauName(bureau.getName());
        userDto.setDesignation(savedUser.getDesignation());
        userDto.setPhone(savedUser.getPhone());
        userDto.setIsActive(true);

        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), userDto);
    }

    public OfficerRegistrationRequestDto mapToDto(OfficerRegistrationRequest r) {
        OfficerRegistrationRequestDto dto = new OfficerRegistrationRequestDto();
        dto.setId(r.getId());
        dto.setRequestId(r.getRequestId());
        dto.setFullName(r.getFullName());
        dto.setEmail(r.getEmail());
        dto.setEmployeeId(r.getEmployeeId());
        dto.setRequestedRole(r.getRequestedRole());
        dto.setRequestedBureauCode(r.getRequestedBureauCode());
        bureauRepository.findByCode(r.getRequestedBureauCode())
                .ifPresent(b -> dto.setRequestedBureauName(b.getName()));
        dto.setDesignation(r.getDesignation());
        dto.setDepartment(r.getDepartment());
        dto.setPhone(r.getPhone());
        dto.setVerificationInfo(r.getVerificationInfo());
        dto.setStatus(r.getStatus());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setActivationToken(r.getActivationToken());
        dto.setTokenExpiry(r.getTokenExpiry());
        dto.setIsActivated(r.getIsActivated());
        if (r.getApprovedBy() != null) {
            dto.setApprovedByName(r.getApprovedBy().getFullName());
        }
        dto.setApprovedAt(r.getApprovedAt());
        dto.setRejectedAt(r.getRejectedAt());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
