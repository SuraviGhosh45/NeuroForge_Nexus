package com.neuroforge.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Access roles. Stored on the user and embedded in the JWT.
 * New signups are ALWAYS TEAM_MEMBER; only an Admin can change it.
 */
public enum Role {
    ADMIN("Admin"),
    PROJECT_MANAGER("Project Manager"),
    TEAM_MEMBER("Team Member");

    private final String label;

    Role(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** Spring Security authority string, e.g. ROLE_ADMIN (used by hasRole('ADMIN')). */
    public String authority() {
        return "ROLE_" + name();
    }

    /** Accepts ADMIN, PROJECT_MANAGER, "Project Manager", "team member", ... */
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        String key = normalize(value);
        for (Role role : values()) {
            if (normalize(role.name()).equals(key) || normalize(role.label).equals(key)) {
                return role;
            }
        }
        throw new IllegalArgumentException(
                "Invalid role '" + value + "'. Allowed: ADMIN, PROJECT_MANAGER, TEAM_MEMBER");
    }

    private static String normalize(String s) {
        return s.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
    }
}
