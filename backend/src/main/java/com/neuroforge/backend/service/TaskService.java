
package com.neuroforge.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.TaskRequest;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.SprintStatus;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.SprintRepository;
import com.neuroforge.backend.repository.TaskDependencyRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.UserRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskKeyService taskKeyService;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskDependencyRepository taskDependencyRepository;

    /**
     * Create a new task.
     *
     * A task can be:
     * 1. Created directly in the backlog.
     * 2. Created and assigned to a specific sprint.
     *
     * If no sprint is provided, the task will automatically be added
     * to the currently active sprint, if one exists.
     */
    @Transactional
    public Task createTask(TaskRequest request) {

        validateTaskRequest(request);

        Task task = new Task();

        // Set basic task information
        applyBasicTaskInformation(task, request);

        // Set project
        Project project = getProject(request.getProjectId());
        task.setProject(project);

        // Set assignee
        setAssignee(task, request.getAssigneeId());

        // Generate task key
        task.setTaskKey(taskKeyService.nextKey(project));

        // Set story points
        task.setStoryPoints(
                request.getStoryPoints() != null
                        ? request.getStoryPoints()
                        : 0
        );

        /*
         * New tasks always start in TODO.
         * Kanban movement is handled by BoardService.
         */
        task.setBoardStatus(BoardStatus.TODO);
        task.setStatus(BoardStatus.TODO.getLabel());
        task.setBoardPosition(0);

        /*
         * If sprintId is provided, add the task to that sprint.
         *
         * Otherwise, automatically add it to the active sprint.
         */
        Sprint sprint = findSprintForNewTask(request, project);

        if (sprint != null) {

            validateSprintBelongsToProject(sprint, project);

            int position = getNextBoardPosition(
                    sprint.getId(),
                    BoardStatus.TODO
            );

            task.setSprint(sprint);
            task.setBoardPosition(position);
        }

        return taskRepository.save(task);
    }

    /**
     * Get all tasks.
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Get a task by ID.
     */
    public Task getTaskById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Task ID cannot be null");
        }

        return taskRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Task not found with id " + id
                        )
                );
    }

    /**
     * Update an existing task.
     *
     * This updates task information such as:
     * - title
     * - description
     * - project
     * - assignee
     * - priority
     * - due date
     * - story points
     *
     * Sprint and Kanban movement are handled separately.
     */
    @Transactional
    public Task updateTask(Long id, TaskRequest request) {

        validateTaskRequest(request);

        Task task = getTaskById(id);

        /*
         * Store the current sprint before updating.
         * This allows us to correctly handle a sprint change.
         */
        Sprint currentSprint = task.getSprint();

        applyBasicTaskInformation(task, request);

        // Update project
        Project project = getProject(request.getProjectId());

        /*
         * If the project changes, generate a new task key.
         */
        if (task.getProject() == null
                || !task.getProject().getId().equals(project.getId())) {

            task.setProject(project);

            task.setTaskKey(
                    taskKeyService.nextKey(project)
            );
        }

        // Update assignee
        setAssignee(task, request.getAssigneeId());

        // Update story points
        if (request.getStoryPoints() != null) {
            task.setStoryPoints(request.getStoryPoints());
        }

        /*
         * Status can still be received from the existing frontend.
         *
         * However, the actual Kanban movement should preferably
         * be performed through BoardService.
         */
        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            BoardStatus boardStatus =
                    toBoardStatus(request.getStatus());

            task.setBoardStatus(boardStatus);
            task.setStatus(boardStatus.getLabel());
        }

        /*
         * Sprint change.
         *
         * If sprintId is provided:
         * - Find the requested sprint.
         * - Verify it belongs to the same project.
         * - Add the task to that sprint.
         *
         * If sprintId is null:
         * - Keep the existing sprint.
         *
         * This prevents normal task edits from accidentally
         * removing a task from its sprint.
         */
        if (request.getSprintId() != null) {

            Sprint requestedSprint = sprintRepository
                    .findById(request.getSprintId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Sprint not found with id "
                                            + request.getSprintId()
                            )
                    );

            validateSprintBelongsToProject(
                    requestedSprint,
                    project
            );

            /*
             * If the task is being moved to another sprint,
             * put it at the end of the current Kanban column.
             */
            if (currentSprint == null
                    || !currentSprint.getId()
                    .equals(requestedSprint.getId())) {

                task.setSprint(requestedSprint);

                int position = getNextBoardPosition(
                        requestedSprint.getId(),
                        task.getBoardStatus()
                );

                task.setBoardPosition(position);
            }
        }

        return taskRepository.save(task);
    }

    /**
     * Delete a task.
     *
     * Dependencies must be deleted first because the dependency
     * table references the task.
     */
    @Transactional
    public void deleteTask(Long id) {

        Task task = getTaskById(id);

        /*
         * Delete dependencies where this task is the main task.
         */
        taskDependencyRepository.deleteByTaskId(id);

        /*
         * Delete dependencies where this task is a dependency
         * of another task.
         */
        taskDependencyRepository.deleteByDependsOnId(id);

        taskRepository.delete(task);
    }

    /**
     * Get tasks belonging to a project.
     */
    public List<Task> getTasksByProject(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID cannot be null"
            );
        }

        return taskRepository.findByProjectId(projectId);
    }

    /**
     * Get tasks belonging to a sprint.
     */
    public List<Task> getTasksBySprint(Long sprintId) {

        if (sprintId == null) {
            throw new IllegalArgumentException(
                    "Sprint ID cannot be null"
            );
        }

        return taskRepository
                .findBySprintIdOrderByBoardStatusAscBoardPositionAsc(
                        sprintId
                );
    }

    /**
     * Get backlog tasks.
     *
     * Backlog = project tasks that do not belong to any sprint.
     */
    public List<Task> getBacklogTasks(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID cannot be null"
            );
        }

        return taskRepository
                .findByProjectIdAndSprintIsNullOrderByIdDesc(
                        projectId
                );
    }

    /**
     * Apply basic task information.
     *
     * Kanban movement is intentionally not handled here.
     */
    private void applyBasicTaskInformation(
            Task task,
            TaskRequest request) {

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        task.setPriority(
                request.getPriority() != null
                        && !request.getPriority().isBlank()
                        ? request.getPriority()
                        : "Medium"
        );

        task.setDueDate(request.getDueDate());
    }

    /**
     * Find the sprint that should be used for a new task.
     *
     * Priority:
     * 1. Sprint specified in TaskRequest.
     * 2. Current active sprint.
     * 3. No sprint -> backlog.
     */
    private Sprint findSprintForNewTask(
            TaskRequest request,
            Project project) {

        /*
         * User explicitly selected a sprint.
         */
        if (request.getSprintId() != null) {

            return sprintRepository
                    .findById(request.getSprintId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Sprint not found with id "
                                            + request.getSprintId()
                            )
                    );
        }

        /*
         * No sprint selected.
         *
         * Find the project's active sprint.
         */
        return sprintRepository
                .findByProjectIdAndStatus(
                        project.getId(),
                        SprintStatus.ACTIVE
                )
                .orElse(null);
    }

    /**
     * Find the project.
     */
    private Project getProject(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        return projectRepository
                .findById(projectId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Project not found with id "
                                        + projectId
                        )
                );
    }

    /**
     * Set task assignee.
     */
    private void setAssignee(
            Task task,
            Long assigneeId) {

        if (assigneeId == null) {
            task.setAssignee(null);
            return;
        }

        User assignee = userRepository
                .findById(assigneeId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Assignee not found with id "
                                        + assigneeId
                        )
                );

        task.setAssignee(assignee);
    }

    /**
     * Validate that a sprint belongs to the same project
     * as the task.
     */
    private void validateSprintBelongsToProject(
            Sprint sprint,
            Project project) {

        if (sprint.getProject() == null
                || sprint.getProject().getId() == null
                || !sprint.getProject()
                .getId()
                .equals(project.getId())) {

            throw new IllegalArgumentException(
                    "Sprint does not belong to the selected project"
            );
        }

        /*
         * Completed sprints should not receive new tasks.
         */
        if (sprint.getStatus() == SprintStatus.COMPLETED) {

            throw new IllegalArgumentException(
                    "Cannot add a task to a completed sprint"
            );
        }
    }

    /**
     * Calculate the next position inside a Kanban column.
     */
    private int getNextBoardPosition(
            Long sprintId,
            BoardStatus boardStatus) {

        return taskRepository
                .findBySprintIdAndBoardStatusOrderByBoardPositionAsc(
                        sprintId,
                        boardStatus
                )
                .size();
    }

    /**
     * Validate the task request.
     */
    private void validateTaskRequest(TaskRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Task request cannot be null"
            );
        }

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Task title is required"
            );
        }

        if (request.getProjectId() == null) {

            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        if (request.getStoryPoints() != null
                && request.getStoryPoints() < 0) {

            throw new IllegalArgumentException(
                    "Story points cannot be negative"
            );
        }
    }

    /**
     * Convert frontend status values into BoardStatus.
     *
     * Supported values:
     * TODO
     * TO_DO
     * IN_PROGRESS
     * IN_REVIEW
     * DONE
     */
    private BoardStatus toBoardStatus(String status) {

        if (status == null || status.isBlank()) {
            return BoardStatus.TODO;
        }

        return switch (
                status.trim()
                        .toUpperCase()
                        .replace(' ', '_')
        ) {

            case "TODO", "TO_DO" ->
                    BoardStatus.TODO;

            case "IN_PROGRESS" ->
                    BoardStatus.IN_PROGRESS;

            case "IN_REVIEW" ->
                    BoardStatus.IN_REVIEW;

            case "DONE" ->
                    BoardStatus.DONE;

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported task status: " + status
                    );
        };
    }
}
