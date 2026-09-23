package com.neuroforge.backend.entity;

/** Priority for projects and tasks. Persisted as its label ("Low" / "Medium" / "High"). */
public enum Priority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String label;

    Priority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    /** Case-insensitive; throws IllegalArgumentException for unknown values. */
    public static Priority parse(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Priority is required");
        }
        String v = value.trim();
        for (Priority p : values()) {
            if (p.label.equalsIgnoreCase(v) || p.name().equalsIgnoreCase(v)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Invalid priority '" + value + "'. Allowed: Low, Medium, High");
    }

    public static Priority parseOrDefault(String value, Priority fallback) {
        return value == null || value.isBlank() ? fallback : parse(value);
    }
}
