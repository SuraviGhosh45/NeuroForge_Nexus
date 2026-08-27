package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusRequest(@NotNull(message = "Project status is required") ProjectStatus status) {
}
