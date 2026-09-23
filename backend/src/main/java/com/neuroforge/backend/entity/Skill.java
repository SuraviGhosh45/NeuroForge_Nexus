package com.neuroforge.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Skill TAG only. It carries no access permission.
 * JSON in/out uses the display label ("Backend Developer"); the DB stores the enum name.
 */
public enum Skill {
    BACKEND_DEVELOPER("Backend Developer"),
    FRONTEND_DEVELOPER("Frontend Developer"),
    FULL_STACK_DEVELOPER("Full Stack Developer"),
    DEVOPS("DevOps"),
    QA_TESTER("QA/Tester"),
    UI_UX_DESIGNER("UI/UX Designer");

    private final String label;

    Skill(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    /** Accepts "Backend Developer", "BACKEND_DEVELOPER", "Full-Stack Developer", "qa/tester", ... */
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Skill fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Skill is required");
        }
        String key = normalize(value);
        for (Skill skill : values()) {
            if (normalize(skill.name()).equals(key) || normalize(skill.label).equals(key)) {
                return skill;
            }
        }
        throw new IllegalArgumentException(
                "Invalid skill '" + value + "'. Allowed: Backend Developer, Frontend Developer, "
                        + "Full Stack Developer, DevOps, QA/Tester, UI/UX Designer");
    }

    private static String normalize(String s) {
        return s.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
    }
}
