package com.neuroforge.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * System roles used by the frontend RBAC model.
 * TEAM_MEMBER is retained only as a legacy database value; new accounts use DEVELOPER.
 */
public enum Role {
    ADMIN("Admin"),
    PROJECT_MANAGER("Project Manager"),
    PROJECT_LEAD("Project Lead"),
    TEAM_LEAD("Team Lead"),
    DEVELOPER("Developer"),
    TESTER("Tester"),
    QA("QA"),
    TEAM_MEMBER("Team Member");

    private final String label;

    Role(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public String authority() {
        return "ROLE_" + name();
    }

    public boolean isExecutionRole() {
        return this == DEVELOPER || this == TESTER || this == QA || this == TEAM_MEMBER;
    }

    public boolean isProjectLeadRole() {
        return this == PROJECT_LEAD;
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        String key = normalize(value);

        return switch (key) {
            case "admin" -> ADMIN;
            case "projectmanager", "manager", "pm" -> PROJECT_MANAGER;
            case "projectlead", "lead", "pl" -> PROJECT_LEAD;
            case "teamlead", "tl" -> TEAM_LEAD;
            case "developer", "dev", "teammember", "member" -> DEVELOPER;
            case "tester", "test" -> TESTER;
            case "qa", "qaspecialist", "qualityassurance" -> QA;
            default -> {
                for (Role role : values()) {
                    if (normalize(role.name()).equals(key) || normalize(role.label).equals(key)) {
                        yield role;
                    }
                }
                throw new IllegalArgumentException("Invalid role '" + value + "'");
            }
        };
    }

    private static String normalize(String value) {
        return value.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
    }
}
