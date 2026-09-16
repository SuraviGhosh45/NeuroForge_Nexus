package com.neuroforge.backend.dto.sprint;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record SprintRequest(
	@NotBlank String name,
	String goal,
	LocalDate startDate,
	LocalDate endDate,
	@PositiveOrZero Integer capacityPoints
) {
}
