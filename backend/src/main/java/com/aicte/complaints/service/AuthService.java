package com.aicte.complaints.service;

import com.aicte.complaints.dto.AuthResponse;
import com.aicte.complaints.dto.LoginRequest;
import com.aicte.complaints.dto.UserDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
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
        dto.setDesignation(user.getDesignation());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
