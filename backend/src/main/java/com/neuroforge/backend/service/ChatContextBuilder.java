package com.neuroforge.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.entity.BugReport;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.Subtask;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.repository.BugReportRepository;
import com.neuroforge.backend.repository.SprintRepository;
import com.neuroforge.backend.repository.SubtaskRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.security.AuthUser;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChatContextBuilder {

    private static final int MAX_PROJECTS_LISTED = 15;
    private static final int MAX_TASKS_LISTED = 20;
    private static final int MAX_SUBTASKS_LISTED = 20;
    private static final int MAX_SPRINTS_LISTED = 10;
    private static final int MAX_BUGS_LISTED = 15;

    private final AccessService accessService;
    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final SprintRepository sprintRepository;
    private final BugReportRepository bugReportRepository;

    @Transactional(readOnly = true)
    public String build(AuthUser user) {
        List<Project> projects = accessService.visibleProjects(user);
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
        List<Task> tasks = projectIds.isEmpty()
                ? List.of()
                : taskRepository.findByProjectIdIn(projectIds);
        List<Long> taskIds = tasks.stream().map(Task::getId).toList();
        List<Subtask> subtasks = taskIds.isEmpty()
                ? List.of()
                : subtaskRepository.findByTask_IdIn(taskIds);
        List<Sprint> sprints = projectIds.isEmpty()
                ? List.of()
                : sprintRepository.findByProject_IdIn(projectIds);
        List<BugReport> bugs = projectIds.isEmpty()
                ? List.of()
                : bugReportRepository.findByProjectIdInOrderByCreatedAtDesc(projectIds);

        List<Task> myTasks = tasks.stream()
                .filter(task -> task.getAssignee() != null
                        && task.getAssignee().getId().equals(user.userId()))
                .toList();
        LocalDate today = LocalDate.now();
        StringBuilder context = new StringBuilder();

        context.append("Role: ").append(user.role().getLabel()).append('\n')
                .append("Visible projects: ").append(projects.size()).append('\n');
        projects.stream().limit(MAX_PROJECTS_LISTED).forEach(project ->
                context.append(String.format(
                        "- [%s] %s | status=%s | priority=%s | due=%s%n",
                        project.getCode() != null ? project.getCode() : project.getProjectKey(),
                        project.getName(),
                        project.getStatus(),
                        project.getPriority(),
                        project.getEndDate() != null ? project.getEndDate() : "none")));

        context.append("\nTasks in visible projects (").append(tasks.size()).append(" total):\n");
        tasks.stream().limit(MAX_TASKS_LISTED).forEach(task -> {
            boolean overdue = task.getDueDate() != null
                    && task.getDueDate().isBefore(today)
                    && !"Done".equalsIgnoreCase(task.getStatus());
            context.append(String.format(
                    "- %s | project=%s | status=%s | priority=%s | assignee=%s | sprint=%s | due=%s%s%n",
                    task.getTaskKey() == null ? task.getTitle() : task.getTaskKey() + " " + task.getTitle(),
                    task.getProject().getName(),
                    task.getStatus(),
                    task.getPriority(),
                    task.getAssignee() == null ? "unassigned" : task.getAssignee().getFullName(),
                    task.getSprint() == null ? "none" : task.getSprint().getName(),
                    task.getDueDate() == null ? "none" : task.getDueDate(),
                    overdue ? " (OVERDUE)" : ""));
        });
        context.append("Tasks assigned to this user: ").append(myTasks.size()).append('\n');

        context.append("\nSubtasks (").append(subtasks.size()).append(" total):\n");
        subtasks.stream().limit(MAX_SUBTASKS_LISTED).forEach(subtask ->
                context.append(String.format(
                        "- %s | parent=%s | status=%s | assignee=%s | due=%s%n",
                        subtask.getTitle(),
                        subtask.getTask().getTitle(),
                        subtask.getStatus(),
                        subtask.getAssignee() == null ? "unassigned" : subtask.getAssignee().getFullName(),
                        subtask.getDueDate() == null ? "none" : subtask.getDueDate())));

        context.append("\nSprints (").append(sprints.size()).append(" total):\n");
        sprints.stream().limit(MAX_SPRINTS_LISTED).forEach(sprint ->
                context.append(String.format(
                        "- %s | project=%s | status=%s | start=%s | end=%s%n",
                        sprint.getName(),
                        sprint.getProject().getName(),
                        sprint.getStatus(),
                        sprint.getStartDate() == null ? "none" : sprint.getStartDate(),
                        sprint.getEndDate() == null ? "none" : sprint.getEndDate())));

        context.append("\nBug reports (").append(bugs.size()).append(" total):\n");
        bugs.stream().limit(MAX_BUGS_LISTED).forEach(bug ->
                context.append(String.format(
                        "- %s %s | projectId=%s | module=%s | severity=%s | priority=%s | status=%s%n",
                        bug.getBugKey(),
                        bug.getTitle(),
                        bug.getProjectId(),
                        bug.getModule(),
                        bug.getSeverity(),
                        bug.getPriority(),
                        bug.getStatus())));

        if (projects.size() > MAX_PROJECTS_LISTED
                || tasks.size() > MAX_TASKS_LISTED
                || subtasks.size() > MAX_SUBTASKS_LISTED
                || sprints.size() > MAX_SPRINTS_LISTED
                || bugs.size() > MAX_BUGS_LISTED) {
            context.append("\n(Context lists are truncated; do not treat listed results as exhaustive.)\n");
        }
        return context.toString();
    }
}
