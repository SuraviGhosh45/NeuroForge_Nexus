package com.neuroforge.backend.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.DashboardResponse;
import com.neuroforge.backend.dto.DashboardResponse.MyTaskItem;
import com.neuroforge.backend.dto.DashboardResponse.MyTasks;
import com.neuroforge.backend.dto.DashboardResponse.NearestTask;
import com.neuroforge.backend.dto.DashboardResponse.ProjectProgress;
import com.neuroforge.backend.dto.DashboardResponse.StatusSplit;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.ProjectStatus;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.UserRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import lombok.RequiredArgsConstructor;

/**
 * One endpoint with role-specific scopes.
 *
 * ADMIN:
 *      Organization-wide dashboard.
 *
 * PROJECT_MANAGER:
 *      Dashboard for projects managed by the PM.
 *
 * TEAM_MEMBER:
 *      Team Leads see team/project work; Developers, Testers and QA see their own tasks inside projects where they are members.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int MY_TASKS_LIMIT = 10;

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AccessService access;

    @Transactional(readOnly = true)
    public DashboardResponse get() {

        AuthUser user = CurrentUser.get();
        LocalDate today = LocalDate.now();

        /*
         * For TEAM_MEMBER:
         * only include tasks assigned to the user AND belonging
         * to projects where the user is currently a member.
         *
         * For ADMIN / PROJECT_MANAGER, their own-task list can
         * remain based on their assigned tasks.
         */
        List<Task> ownTasks;

        if (user.isTeamMember()) {

            List<Long> visibleProjectIds = access.visibleProjects(user)
                    .stream()
                    .map(Project::getId)
                    .toList();

            if (visibleProjectIds.isEmpty()) {
                ownTasks = List.of();
            } else {
                ownTasks = taskRepository
                        .findByProjectIdIn(visibleProjectIds)
                        .stream()
                        .filter(task ->
                                task.getAssignee() != null
                                        && task.getAssignee()
                                                .getId()
                                                .equals(user.userId()))
                        .toList();
            }

        } else {
            ownTasks = taskRepository.findByAssigneeId(user.userId());
        }

        MyTasks myTasks = myTasks(ownTasks, today);

        return switch (user.role()) {

            case ADMIN ->
                    admin(myTasks);

            case PROJECT_MANAGER, PROJECT_LEAD ->
                    projectManager(user, today, myTasks);

            case TEAM_LEAD, DEVELOPER, TESTER, QA, TEAM_MEMBER ->
                    teamMember(ownTasks, today, myTasks);
        };
    }

    // ------------------------------------------------------------------ ADMIN

    private DashboardResponse admin(MyTasks myTasks) {

        List<Project> projects =
                projectRepository.findAll();

        List<Task> tasks =
                taskRepository.findAll();

        Map<Long, List<Task>> byProject =
                groupByProject(tasks);

        Map<String, Long> stats =
                new LinkedHashMap<>();

        stats.put(
                "totalProjects",
                (long) projects.size()
        );

        stats.put(
                "totalTasks",
                (long) tasks.size()
        );

        stats.put(
                "totalUsers",
                userRepository.count()
        );

        stats.put(
                "projectsNotStarted",
                countProjects(
                        projects,
                        ProjectStatus.NOT_STARTED
                )
        );

        stats.put(
                "projectsInProgress",
                countProjects(
                        projects,
                        ProjectStatus.IN_PROGRESS
                )
        );

        stats.put(
                "projectsCompleted",
                countProjects(
                        projects,
                        ProjectStatus.COMPLETED
                )
        );

        stats.put(
                "tasksInProgress",
                countStatus(
                        tasks,
                        BoardStatus.IN_PROGRESS
                )
        );

        stats.put(
                "tasksCompleted",
                countStatus(
                        tasks,
                        BoardStatus.DONE
                )
        );

        return new DashboardResponse(
                "ADMIN",
                stats,
                split(tasks),
                progressList(
                        projects,
                        byProject
                ),
                null,
                myTasks
        );
    }

    // ------------------------------------------------------------------ PROJECT MANAGER

    private DashboardResponse projectManager(
            AuthUser user,
            LocalDate today,
            MyTasks myTasks
    ) {

        List<Project> projects = access.visibleProjects(user);

        List<Long> projectIds =
                projects.stream()
                        .map(Project::getId)
                        .toList();

        List<Task> tasks =
                projectIds.isEmpty()
                        ? List.of()
                        : taskRepository.findByProjectIdIn(
                                projectIds
                        );

        Set<Long> teamMembers =
                new HashSet<>();

        for (Project project : projects) {

            for (User member : project.getMembers()) {
                teamMembers.add(member.getId());
            }
        }

        long overdue =
                tasks.stream()
                        .filter(task ->
                                isOverdue(task, today)
                        )
                        .count();

        Map<String, Long> stats =
                new LinkedHashMap<>();

        stats.put(
                "projectCount",
                (long) projects.size()
        );

        stats.put(
                "teamSize",
                (long) teamMembers.size()
        );

        stats.put(
                "totalTasks",
                (long) tasks.size()
        );

        stats.put(
                "overdueTasks",
                overdue
        );

        return new DashboardResponse(
                user.role().name(),
                stats,
                split(tasks),
                progressList(
                        projects,
                        groupByProject(tasks)
                ),
                null,
                myTasks
        );
    }

    // ------------------------------------------------------------------ TEAM MEMBER

    private DashboardResponse teamMember(
            List<Task> ownTasks,
            LocalDate today,
            MyTasks myTasks
    ) {

        Map<String, Long> stats =
                new LinkedHashMap<>();

        stats.put(
                "assignedTasks",
                (long) ownTasks.size()
        );

        stats.put(
                "todoTasks",
                countStatus(
                        ownTasks,
                        BoardStatus.TODO
                )
        );

        stats.put(
                "inProgressTasks",
                countStatus(
                        ownTasks,
                        BoardStatus.IN_PROGRESS
                )
        );

        stats.put(
                "completedTasks",
                countStatus(
                        ownTasks,
                        BoardStatus.DONE
                )
        );

        /*
         * Nearest unfinished task from the TEAM_MEMBER's
         * currently visible/allowed tasks only.
         */
        NearestTask nearest =
                ownTasks.stream()
                        .filter(task ->
                                task.getBoardStatus()
                                        != BoardStatus.DONE
                                        && task.getDueDate() != null
                        )
                        .min(
                                Comparator
                                        .comparing(Task::getDueDate)
                                        .thenComparing(Task::getId)
                        )
                        .map(task ->
                                new NearestTask(
                                        task.getId(),
                                        task.getTaskKey(),
                                        task.getTitle(),
                                        task.getProject().getName(),
                                        task.getPriority(),
                                        task.getBoardStatus().getLabel(),
                                        task.getDueDate(),
                                        task.getDueDate().isBefore(today)
                                )
                        )
                        .orElse(null);

        return new DashboardResponse(
                "TEAM_MEMBER",
                stats,
                split(ownTasks),
                null,
                nearest,
                myTasks
        );
    }

    // ------------------------------------------------------------------ MY TASKS

    private MyTasks myTasks(
            List<Task> ownTasks,
            LocalDate today
    ) {

        List<MyTaskItem> items =
                ownTasks.stream()

                        /*
                         * Unfinished tasks first.
                         */
                        .sorted(
                                Comparator
                                        .comparing(
                                                (Task task) ->
                                                        task.getBoardStatus()
                                                                == BoardStatus.DONE
                                        )

                                        /*
                                         * Then nearest due date.
                                         */
                                        .thenComparing(
                                                Task::getDueDate,
                                                Comparator.nullsLast(
                                                        Comparator.naturalOrder()
                                                )
                                        )

                                        /*
                                         * Then task ID.
                                         */
                                        .thenComparing(Task::getId)
                        )

                        .limit(MY_TASKS_LIMIT)

                        .map(task ->
                                new MyTaskItem(
                                        task.getId(),
                                        task.getTaskKey(),
                                        task.getTitle(),
                                        task.getProject().getName(),
                                        task.getPriority(),
                                        task.getBoardStatus().getLabel(),
                                        task.getDueDate(),
                                        isOverdue(
                                                task,
                                                today
                                        )
                                )
                        )

                        .toList();

        return new MyTasks(
                ownTasks.size(),
                countStatus(
                        ownTasks,
                        BoardStatus.TODO
                ),
                countStatus(
                        ownTasks,
                        BoardStatus.IN_PROGRESS
                ),
                countStatus(
                        ownTasks,
                        BoardStatus.DONE
                ),
                items
        );
    }

    // ------------------------------------------------------------------ HELPERS

    private boolean isOverdue(
            Task task,
            LocalDate today
    ) {

        return task.getBoardStatus()
                        != BoardStatus.DONE

                && task.getDueDate() != null

                && task.getDueDate()
                        .isBefore(today);
    }

    /**
     * In Review counts as In Progress so the dashboard
     * matches the three Kanban columns.
     */
    private long countStatus(
            List<Task> tasks,
            BoardStatus status
    ) {

        return tasks.stream()
                .filter(task ->
                        status == BoardStatus.IN_PROGRESS
                                ? task.getBoardStatus()
                                        == BoardStatus.IN_PROGRESS
                                        || task.getBoardStatus()
                                                == BoardStatus.IN_REVIEW
                                : task.getBoardStatus()
                                        == status
                )
                .count();
    }

    private StatusSplit split(
            List<Task> tasks
    ) {

        return new StatusSplit(
                countStatus(
                        tasks,
                        BoardStatus.TODO
                ),
                countStatus(
                        tasks,
                        BoardStatus.IN_PROGRESS
                ),
                countStatus(
                        tasks,
                        BoardStatus.DONE
                )
        );
    }

    private long countProjects(
            List<Project> projects,
            ProjectStatus status
    ) {

        return projects.stream()
                .filter(project ->
                        status.getLabel()
                                .equals(project.getStatus())
                )
                .count();
    }

    private Map<Long, List<Task>> groupByProject(
            List<Task> tasks
    ) {

        return tasks.stream()
                .collect(
                        Collectors.groupingBy(
                                task ->
                                        task.getProject().getId()
                        )
                );
    }

    private List<ProjectProgress> progressList(
            List<Project> projects,
            Map<Long, List<Task>> byProject
    ) {

        return projects.stream()
                .sorted(
                        Comparator.comparing(
                                Project::getId
                        )
                )
                .map(project -> {

                    List<Task> tasks =
                            byProject.getOrDefault(
                                    project.getId(),
                                    List.of()
                            );

                    int total =
                            tasks.size();

                    int completed =
                            (int) tasks.stream()
                                    .filter(task ->
                                            task.getBoardStatus()
                                                    == BoardStatus.DONE
                                    )
                                    .count();

                    int percent =
                            total == 0
                                    ? 0
                                    : Math.round(
                                            completed * 100f
                                                    / total
                                    );

                    return new ProjectProgress(
                            project.getId(),
                            project.getName(),
                            project.getCode(),
                            project.getStatus(),
                            project.getPriority(),
                            total,
                            completed,
                            percent,
                            project.getEndDate()
                    );
                })
                .toList();
    }
}