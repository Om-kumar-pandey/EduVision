package com.eduvision.service;

import com.eduvision.dto.UpdateProfileRequest;
import com.eduvision.dto.UserProfileDto;
import com.eduvision.entity.User;
import com.eduvision.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileDto getProfile(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getInstitutionName(),
                user.getAvatarUrl()
        );
    }

    @Transactional
    public UserProfileDto updateProfile(User user, UpdateProfileRequest request) {
        user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getInstitutionName() != null) {
            user.setInstitutionName(request.getInstitutionName());
        }

        User updated = userRepository.save(user);

        return new UserProfileDto(
                updated.getId(),
                updated.getEmail(),
                updated.getFullName(),
                updated.getPhoneNumber(),
                updated.getRole(),
                updated.getInstitutionName(),
                updated.getAvatarUrl()
        );
    }
}
