package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.User;

import jakarta.validation.constraints.NotBlank;

/** Task response shapes. Nested project/assignee objects are kept so existing frontend paths still work. */
public final class TaskDtos {

    private TaskDtos() {}

    public record ProjectRef(Long id, String name, String code) {}

    public record UserRef(Long id, String fullName, String email, String skill) {
        public static UserRef from(User user) {
            return user == null ? null : new UserRef(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getSkill() == null ? null : user.getSkill().getLabel());
        }
    }

    /** PATCH /api/tasks/{id}/status  -  "To Do" | "In Progress" | "Done" (TODO / IN_PROGRESS / DONE also accepted). */
    public record StatusRequest(@NotBlank String status) {}

    public record TaskResponse(
            Long id,
            String taskKey,
            String title,
            String description,
            ProjectRef project,
            Long projectId,
            String projectName,
            UserRef assignee,
            Long assigneeId,
            String assigneeName,
            String priority,
            String status,
            String boardStatus,
            LocalDate dueDate,
            Integer storyPoints,
            boolean blocked,
            LocalDateTime createdAt) {

        public static TaskResponse from(Task task) {
            var project = task.getProject();
            var assignee = task.getAssignee();
            return new TaskResponse(
                    task.getId(),
                    task.getTaskKey(),
                    task.getTitle(),
                    task.getDescription(),
                    project == null ? null : new ProjectRef(project.getId(), project.getName(), project.getCode()),
                    project == null ? null : project.getId(),
                    project == null ? null : project.getName(),
                    UserRef.from(assignee),
                    assignee == null ? null : assignee.getId(),
                    assignee == null ? null : assignee.getFullName(),
                    task.getPriority(),
                    task.getBoardStatus().getLabel(),
                    task.getBoardStatus().name(),
                    task.getDueDate(),
                    task.getStoryPoints(),
                    task.isBlocked(),
                    task.getCreatedAt());
        }
    }
}
