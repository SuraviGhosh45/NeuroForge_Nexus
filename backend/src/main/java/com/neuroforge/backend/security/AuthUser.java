package com.neuroforge.backend.security;

import com.neuroforge.backend.entity.Role;

/** The authenticated caller, rebuilt on every request from the signed JWT (never from the client body). */
public record AuthUser(Long userId, String email, Role role) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isProjectManager() {
        return role == Role.PROJECT_MANAGER;
    }

    public boolean isTeamMember() {
        return role == Role.TEAM_MEMBER;
    }
}
