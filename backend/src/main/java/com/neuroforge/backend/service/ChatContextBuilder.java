package com.neuroforge.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.security.AuthUser;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChatContextBuilder {

    private static final int MAX_PROJECTS_LISTED = 15;
    private static final int MAX_TASKS_LISTED = 15;

    private final AccessService accessService;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public String build(AuthUser user) {

        List<Project> projects = accessService.visibleProjects(user);

        List<Long> projectIds = projects.stream()
                .map(Project::getId)
                .toList();

        List<Task> tasks = projectIds.isEmpty()
                ? List.of()
                : taskRepository.findByProjectIdIn(projectIds);

        List<Task> myTasks = tasks.stream()
                .filter(t -> t.getAssignee() != null
                        && t.getAssignee().getId().equals(user.userId()))
                .toList();

        LocalDate today = LocalDate.now();

        StringBuilder sb = new StringBuilder();

        sb.append("Role: ")
                .append(user.role().getLabel())
                .append("\n");

        sb.append("Visible projects: ")
                .append(projects.size())
                .append("\n");

        projects.stream()
                .limit(MAX_PROJECTS_LISTED)
                .forEach(p -> sb.append(String.format(
                        "- [%s] %s | status=%s | priority=%s | due=%s%n",
                        p.getCode() != null ? p.getCode() : p.getProjectKey(),
                        p.getName(),
                        p.getStatus(),
                        p.getPriority(),
                        p.getEndDate() != null ? p.getEndDate() : "none"
                )));

        sb.append("\nTasks assigned to this user (")
                .append(myTasks.size())
                .append(" total):\n");

        myTasks.stream()
                .limit(MAX_TASKS_LISTED)
                .forEach(t -> {

                    String overdue =
                            (t.getDueDate() != null
                                    && t.getDueDate().isBefore(today)
                                    && !"Done".equalsIgnoreCase(t.getStatus()))
                                    ? " (OVERDUE)"
                                    : "";

                    sb.append(String.format(
                            "- %s | status=%s | priority=%s | due=%s%s%n",
                            t.getTitle(),
                            t.getStatus(),
                            t.getPriority(),
                            t.getDueDate() != null ? t.getDueDate() : "none",
                            overdue
                    ));
                });

        if (projects.size() > MAX_PROJECTS_LISTED
                || myTasks.size() > MAX_TASKS_LISTED) {

            sb.append(
                    "\n(List truncated — mention there is more if the user asks for \"all\" of something.)\n"
            );
        }

        return sb.toString();
    }
}