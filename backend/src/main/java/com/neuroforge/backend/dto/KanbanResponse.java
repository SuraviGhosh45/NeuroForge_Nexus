package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.util.List;

/** GET /api/kanban?projectId={id} - stat cards + the 3 columns for ONE project. */
public record KanbanResponse(
        Long projectId,
        String projectName,
        String projectCode,
        Stats stats,
        List<Column> columns) {

    public record Stats(int total, int todo, int inProgress, int done) {}

    public record Column(String status, String title, int count, List<Card> cards) {}

    /** canMove tells the frontend whether THIS caller may drag this card (Team Member: own tasks only). */
    public record Card(
            Long id,
            String taskKey,
            String title,
            String description,
            String priority,
            String status,
            String boardStatus,
            Long assigneeId,
            String assigneeName,
            LocalDate dueDate,
            boolean blocked,
            String blockedReason,
            Integer storyPoints,
            boolean canMove) {}
}
