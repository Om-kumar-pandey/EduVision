package com.aicte.complaints.controller;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.security.UserPrincipal;
import com.aicte.complaints.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/register-complainant")
    public ResponseEntity<ApiResponse<AuthResponse>> registerComplainant(
            @Valid @RequestBody RegisterComplainantRequest request, HttpServletRequest httpRequest) {
        AuthResponse response = authService.registerComplainant(request, httpRequest);
        return new ResponseEntity<>(ApiResponse.success("Registration successful. Account created.", response), HttpStatus.CREATED);
    }

    @PostMapping("/request-official-access")
    public ResponseEntity<ApiResponse<String>> requestOfficialAccess(
            @Valid @RequestBody OfficialAccessRequest request, HttpServletRequest httpRequest) {
        authService.requestOfficialAccess(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success(
                "Access request submitted successfully. The AICTE System Administrator will review your credentials and issue authorization.",
                "SUBMITTED"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("User logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        UserDto userDto = authService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
