package com.eduvision.controller;

import com.eduvision.dto.UpdateProfileRequest;
import com.eduvision.dto.UserProfileDto;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@Tag(name = "Profile", description = "Endpoints to view and update user profile data")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get authenticated user profile details")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getUser()));
    }

    @PutMapping
    @Operation(summary = "Update permitted personal details in user profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updated = profileService.updateProfile(principal.getUser(), request);
        return ResponseEntity.ok(updated);
    }
}
