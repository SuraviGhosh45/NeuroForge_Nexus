package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

public record ProjectMemberRequest(
        @NotNull(message = "User ID is required") Long userId,
        @NotNull(message = "Project member role is required") ProjectMemberRole role
) {
}
