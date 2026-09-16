package com.neuroforge.backend.dto.sprint;

import java.time.LocalDate;
import java.util.List;

import com.neuroforge.backend.entity.SprintStatus;

public record SprintBoardResponse(
	Long sprintId, Long projectId,
	String name, String goal,
	SprintStatus status,
	LocalDate startDate, LocalDate endDate,
	SprintMetrics metrics,
	List<BoardColumn> columns
) {
}
