package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

public record ProjectMemberRoleUpdateRequest(
        @NotNull(message = "Project member role is required") ProjectMemberRole role
) {
}
