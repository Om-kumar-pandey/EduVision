package com.aicte.complaints.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ActivateAccountRequest {

    @NotBlank(message = "Activation token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 50, message = "Password must be at least 6 characters long")
    private String password;

    public ActivateAccountRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
