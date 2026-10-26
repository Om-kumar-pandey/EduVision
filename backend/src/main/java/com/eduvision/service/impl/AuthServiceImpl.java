package com.eduvision.service.impl;

import com.eduvision.dto.request.LoginRequest;
import com.eduvision.dto.request.RegisterRequest;
import com.eduvision.dto.response.AuthResponse;
import com.eduvision.dto.response.UserProfileResponse;
import com.eduvision.entity.Institution;
import com.eduvision.entity.Role;
import com.eduvision.entity.User;
import com.eduvision.exception.BadRequestException;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.repository.InstitutionRepository;
import com.eduvision.repository.UserRepository;
import com.eduvision.security.JwtTokenProvider;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           InstitutionRepository institutionRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String instName = user.getInstitution() != null ? user.getInstitution().getName() : null;

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                instName
        );
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole() != null ? request.getRole() : Role.STUDENT);
        user.setRollOrEmpId(request.getRollOrEmpId());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());
        user.setEnabled(true);

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElse(null);
            user.setInstitution(institution);
        }

        userRepository.save(user);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        String instName = user.getInstitution() != null ? user.getInstitution().getName() : null;

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                instName
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new BadRequestException("No authenticated user found in session context.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setRollOrEmpId(user.getRollOrEmpId());
        res.setRole(user.getRole());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setDepartment(user.getDepartment());
        res.setCreatedAt(user.getCreatedAt());

        if (user.getInstitution() != null) {
            res.setInstitutionId(user.getInstitution().getId());
            res.setInstitutionName(user.getInstitution().getName());
        }

        return res;
    }
}
