package com.neuroforge.backend.dto.sprint;

import java.time.LocalDate;
import java.util.List;

import com.neuroforge.backend.entity.BoardStatus;

public record BoardCard(
	Long id,
	String taskKey,
	String title,
	String description,
	String priority,
	BoardStatus boardStatus,
	int position,
	Integer storyPoints,
	Long assigneeId,
	String assigneeName,
	boolean blocked,
	String blockedReason,
	List<String> dependsOn,
	String sprintName,
	LocalDate dueDate
) {
}
