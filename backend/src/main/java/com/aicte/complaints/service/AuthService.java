package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.repository.UserRepository;
import com.aicte.complaints.security.JwtTokenProvider;
import com.aicte.complaints.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().trim(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        auditLogService.logAction(
                user,
                user.getEmail(),
                "LOGIN_SUCCESS",
                "USER",
                user.getId().toString(),
                "User successfully authenticated with role " + user.getRole(),
                request != null ? request.getRemoteAddr() : "127.0.0.1"
        );

        UserDto userDto = mapToUserDto(user);
        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), userDto);
    }

    @Transactional
    public AuthResponse registerComplainant(RegisterComplainantRequest regRequest, HttpServletRequest request) {
        String cleanEmail = regRequest.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = new User();
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(regRequest.getPassword()));
        user.setFullName(regRequest.getFullName().trim());
        user.setRole("COMPLAINANT");
        user.setPhone(regRequest.getPhone());
        user.setDesignation(regRequest.getComplainantType() != null ? regRequest.getComplainantType() : "Complainant");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        auditLogService.logAction(
                savedUser,
                savedUser.getEmail(),
                "COMPLAINANT_REGISTER",
                "USER",
                savedUser.getId().toString(),
                "New public complainant account registered: " + savedUser.getFullName() + " (" + user.getDesignation() + ")",
                request != null ? request.getRemoteAddr() : "127.0.0.1"
        );

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, regRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserDto userDto = mapToUserDto(savedUser);
        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), userDto);
    }

    @Transactional
    public void requestOfficialAccess(OfficialAccessRequest req, HttpServletRequest request) {
        auditLogService.logAction(
                null,
                req.getEmail().trim(),
                "OFFICIAL_ACCESS_REQUESTED",
                "OFFICIAL_ACCESS",
                req.getRequestedRole(),
                "Official access requested by " + req.getFullName() + " (" + req.getEmail() + ") for role: "
                        + req.getRequestedRole() + ", Unit: " + req.getOrganizationUnit() + ". Justification: " + req.getJustification(),
                request != null ? request.getRemoteAddr() : "127.0.0.1"
        );
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return mapToUserDto(user);
    }

    public UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        if (user.getBureau() != null) {
            dto.setBureauId(user.getBureau().getId());
            dto.setBureauCode(user.getBureau().getCode());
            dto.setBureauName(user.getBureau().getName());
        }
        if (user.getInstitution() != null) {
            dto.setInstitutionId(user.getInstitution().getId());
            dto.setInstitutionName(user.getInstitution().getName());
            dto.setInstitutionPermanentId(user.getInstitution().getPermanentId());
        }
        dto.setRegion(user.getRegion());
        dto.setDesignation(user.getDesignation());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
