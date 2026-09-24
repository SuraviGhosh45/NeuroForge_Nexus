package com.neuroforge.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectMemberStatusRequest(@NotBlank String status) {}
