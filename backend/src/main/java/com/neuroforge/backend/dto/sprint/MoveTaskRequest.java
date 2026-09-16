package com.neuroforge.backend.dto.sprint;

import com.neuroforge.backend.entity.BoardStatus;

import jakarta.validation.constraints.NotNull;

public record MoveTaskRequest(@NotNull BoardStatus boardStatus, Integer position) {
}
