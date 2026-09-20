package com.neuroforge.backend.dto;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;

/**
 * Returned by signup/login/me. The user fields stay flat (id, fullName, email ...) so existing
 * frontend code that reads response.data directly keeps working; the JWT is in "token".
 */
public record AuthResponse(
        String message,
        String token,
        String tokenType,
        long expiresInSeconds,
        Long id,
        String userCode,
        String fullName,
        String email,
        String role,
        String roleLabel,
        String skill) {

    /** Signup / login: includes the freshly issued JWT. */
    public static AuthResponse of(String message, String token, long expiresInSeconds, User user) {
        return build(message, token, "Bearer", expiresInSeconds, user, user.getRole());
    }

    /**
     * GET /api/auth/me: no new token. effectiveRole is the role inside the caller's JWT - i.e. the role
     * the backend is actually enforcing for this session.
     */
    public static AuthResponse me(User user, Role effectiveRole) {
        return build("Authenticated", null, null, 0, user, effectiveRole);
    }

    private static AuthResponse build(String message, String token, String tokenType, long expiresInSeconds,
                                      User user, Role role) {
        return new AuthResponse(
                message,
                token,
                tokenType,
                expiresInSeconds,
                user.getId(),
                user.getUserCode(),
                user.getFullName(),
                user.getEmail(),
                role.name(),
                role.getLabel(),
                user.getSkill() == null ? null : user.getSkill().getLabel());
    }
}
