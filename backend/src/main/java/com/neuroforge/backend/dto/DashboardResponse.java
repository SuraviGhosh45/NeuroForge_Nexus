package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * GET /api/dashboard - ONE endpoint, ONE frontend component. The backend scopes everything by the
 * caller's role (from the JWT) and returns a shape the component can render generically:
 *
 *  stats           role specific counters (keys documented in CHANGES.md)
 *  taskStatusSplit To Do / In Progress / Done for the caller's scope (org / managed projects / own tasks)
 *  projects        ADMIN: all projects with progress %; PROJECT_MANAGER: managed projects; TEAM_MEMBER: omitted
 *  nearestTask     TEAM_MEMBER only: nearest due (or most overdue) unfinished task
 *  myTasks         ALWAYS the caller's own tasks, for every role
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DashboardResponse(
        String role,
        Map<String, Long> stats,
        StatusSplit taskStatusSplit,
        List<ProjectProgress> projects,
        NearestTask nearestTask,
        MyTasks myTasks) {

    public record StatusSplit(long todo, long inProgress, long done) {}

    public record ProjectProgress(
            Long id,
            String name,
            String code,
            String status,
            String priority,
            int totalTasks,
            int completedTasks,
            int progressPercent,
            LocalDate endDate) {}

    public record NearestTask(
            Long id,
            String taskKey,
            String title,
            String projectName,
            String priority,
            String status,
            LocalDate dueDate,
            boolean overdue) {}

    public record MyTaskItem(
            Long id,
            String taskKey,
            String title,
            String projectName,
            String priority,
            String status,
            LocalDate dueDate,
            boolean overdue) {}

    public record MyTasks(long total, long todo, long inProgress, long done, List<MyTaskItem> items) {}
}
