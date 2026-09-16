package com.neuroforge.backend.dto.sprint;

import java.time.LocalDate;

import com.neuroforge.backend.entity.SprintStatus;

public record SprintResponse(
	Long id, Long projectId, String projectName,
	String name, String goal,
	LocalDate startDate, LocalDate endDate,
	SprintStatus status, Integer capacityPoints,
	SprintMetrics metrics
) {
}
