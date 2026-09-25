package com.neuroforge.backend.entity;

/**
 * Project status represents the delivery lifecycle state.
 * The label is what is stored in projects.status.
 */
public enum ProjectStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    ON_HOLD("On Hold"),
    COMPLETED("Completed");

    private final String label;

    ProjectStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ProjectStatus from(String raw) {
        if (raw == null || raw.isBlank()) return NOT_STARTED;
        String val = raw.trim();
        for (ProjectStatus s : values()) {
            if (s.name().equalsIgnoreCase(val) || s.label.equalsIgnoreCase(val)) {
                return s;
            }
        }
        String lower = val.toLowerCase().replace("_", " ");
        if (lower.contains("progress") || lower.contains("active")) return IN_PROGRESS;
        if (lower.contains("complete") || lower.contains("done")) return COMPLETED;
        if (lower.contains("hold") || lower.contains("paused")) return ON_HOLD;
        if (lower.contains("not") || lower.contains("plan") || lower.contains("todo")) return NOT_STARTED;
        return NOT_STARTED;
    }
}
