package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.Project;
import com.neuroforage.backend.model.ProjectStatus;

import java.time.Instant;

public record ProjectResponse(
        Long id, String name, String description, ProjectStatus status, Instant createdAt, Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(project.getId(), project.getName(), project.getDescription(),
                project.getStatus(), project.getCreatedAt(), project.getUpdatedAt());
    }
}
