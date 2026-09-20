package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.User;

public final class ProjectDtos {

    private ProjectDtos() {}

    /** One row of GET /api/projects: Name, Project ID, Start, End, Status, Priority. */
    public record Summary(
            Long id,
            String name,
            String code,
            String projectKey,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String priority) {

        public static Summary from(Project project) {
            return new Summary(
                    project.getId(),
                    project.getName(),
                    project.getCode(),
                    project.getProjectKey(),
                    project.getStartDate(),
                    project.getEndDate(),
                    project.getStatus(),
                    project.getPriority());
        }
    }

    public record PersonInfo(Long id, String userCode, String fullName, String email, String skill, String role) {
        public static PersonInfo from(User user) {
            return user == null ? null : new PersonInfo(
                    user.getId(),
                    user.getUserCode(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getSkill() == null ? null : user.getSkill().getLabel(),
                    user.getRole().name());
        }
    }

    /** GET /api/projects/{id}: full info, manager, members and all tasks. */
    public record Detail(
            Long id,
            String name,
            String code,
            String projectKey,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String priority,
            PersonInfo projectManager,
            List<PersonInfo> members,
            int totalTasks,
            int completedTasks,
            int progressPercent,
            List<TaskDtos.TaskResponse> tasks,
            LocalDateTime createdAt) {}

    /** GET /api/projects/priority-suggestion - lets the create form auto-fill the priority dropdown. */
    public record PrioritySuggestion(String priority, long durationDays) {}
}
