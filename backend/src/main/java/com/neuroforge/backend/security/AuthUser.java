package com.neuroforge.backend.security;

import com.neuroforge.backend.entity.Role;

/** The authenticated caller, rebuilt from the signed JWT on every request. */
public record AuthUser(Long userId, String email, Role role) {

    public boolean isAdmin() { return role == Role.ADMIN; }
    public boolean isProjectManager() { return role == Role.PROJECT_MANAGER; }
    public boolean isProjectLead() { return role == Role.PROJECT_LEAD; }
    public boolean isTeamLead() { return role == Role.TEAM_LEAD; }
    public boolean isExecutionRole() { return role.isExecutionRole(); }
    public boolean isTeamMember() { return role.isExecutionRole(); }
}
