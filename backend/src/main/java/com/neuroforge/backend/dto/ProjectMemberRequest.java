package com.neuroforge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectMemberRequest(
        @NotNull Long userId,
        @NotBlank String projectRole) {}
