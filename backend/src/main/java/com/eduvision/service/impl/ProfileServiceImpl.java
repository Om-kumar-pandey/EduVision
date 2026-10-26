package com.eduvision.service.impl;

import com.eduvision.dto.request.ChangePasswordRequest;
import com.eduvision.dto.request.UpdateProfileRequest;
import com.eduvision.dto.response.UserProfileResponse;
import com.eduvision.entity.User;
import com.eduvision.exception.BadRequestException;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.repository.UserRepository;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.ProfileService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName().trim());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());

        User saved = userRepository.save(user);

        UserProfileResponse res = new UserProfileResponse();
        res.setId(saved.getId());
        res.setEmail(saved.getEmail());
        res.setFullName(saved.getFullName());
        res.setRollOrEmpId(saved.getRollOrEmpId());
        res.setRole(saved.getRole());
        res.setPhoneNumber(saved.getPhoneNumber());
        res.setDepartment(saved.getDepartment());
        res.setCreatedAt(saved.getCreatedAt());

        if (saved.getInstitution() != null) {
            res.setInstitutionId(saved.getInstitution().getId());
            res.setInstitutionName(saved.getInstitution().getName());
        }

        return res;
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password provided does not match our records.");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
