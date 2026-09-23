package com.neuroforge.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /api/auth/login.
 * "identifier" is an Email OR a User ID. The old field name "email" is still accepted.
 */
public class LoginRequest {

    @NotBlank
    @JsonAlias({"email", "userCode", "userId", "emailOrUserId"})
    private String identifier;

    @NotBlank
    private String password;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
