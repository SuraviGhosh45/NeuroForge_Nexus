package com.neuroforge.backend.dto.sprint;

public record SprintMetrics(
	int totalTasks,
	int storyPoints,
	int completedTasks,
	int completedPoints,
	int velocity,
	int capacityPoints,
	int burnedPoints,
	int remainingPoints,
	int completionPercent
) {
}
