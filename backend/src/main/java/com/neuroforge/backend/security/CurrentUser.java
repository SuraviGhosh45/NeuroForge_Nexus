package com.neuroforge.backend.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Access to the caller identity that JwtAuthFilter placed in the security context. */
public final class CurrentUser {

    private CurrentUser() {}

    public static AuthUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthUser user) {
            return user;
        }
        throw new AuthenticationCredentialsNotFoundException("Authentication is required");
    }
}
