package com.neuroforge.backend.entity;

/**
 * Project status is NEVER chosen by the client. It is derived from the project's tasks
 * (see ProjectService.recalculateStatus). The label is what is stored in projects.status.
 */
public enum ProjectStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed");

    private final String label;

    ProjectStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
