package com.neuroforge.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.sprint.BoardCard;
import com.neuroforge.backend.dto.sprint.BoardColumn;
import com.neuroforge.backend.dto.sprint.MoveTaskRequest;
import com.neuroforge.backend.dto.sprint.SprintBoardResponse;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.SprintStatus;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.TaskDependency;
import com.neuroforge.backend.exception.BusinessRuleException;
import com.neuroforge.backend.repository.TaskDependencyRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;
import org.springframework.security.access.AccessDeniedException;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

private final TaskRepository taskRepository;
private final TaskDependencyRepository dependencyRepository;
private final SprintService sprintService;
private final AccessService access;
private final ProjectRepository projectRepository;

/**
 * Get the complete Kanban board for a sprint.
 */
@Transactional(readOnly = true)
public SprintBoardResponse board(Long sprintId) {

    Sprint sprint = sprintService.get(sprintId);
    access.assertCanView(CurrentUser.get(), sprint.getProject());

    List<Task> tasks = taskRepository
            .findBySprintIdOrderByBoardStatusAscBoardPositionAsc(sprintId);

    Map<Long, List<String>> dependencyKeys = dependencyKeys(tasks);

    List<BoardColumn> columns = new ArrayList<>();

    /*
     * Always create all four Kanban columns.
     */
    for (BoardStatus status : BoardStatus.values()) {

        List<BoardCard> cards = tasks.stream()
                .filter(task -> task.getBoardStatus() == status)
                .sorted(
                        Comparator.comparing(
                                Task::getBoardPosition,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .map(
                        task -> toCard(
                                task,
                                dependencyKeys.getOrDefault(
                                        task.getId(),
                                        List.of()
                                )
                        )
                )
                .toList();

        columns.add(
                new BoardColumn(
                        status,
                        status.getLabel(),
                        cards.size(),
                        cards
                )
        );
    }

    return new SprintBoardResponse(
            sprint.getId(),
            sprint.getProject().getId(),
            sprint.getName(),
            sprint.getGoal(),
            sprint.getStatus(),
            sprint.getStartDate(),
            sprint.getEndDate(),
            sprintService.metrics(sprint),
            columns
    );
}

/**
 * Get all tasks that are currently in the project backlog.
 *
 * Backlog means the task does not belong to any sprint.
 */
@Transactional(readOnly = true)
public List<BoardCard> backlog(Long projectId) {

    List<Task> tasks = taskRepository
            .findByProjectIdAndSprintIsNullOrderByIdDesc(projectId);

    Map<Long, List<String>> dependencyKeys =
            dependencyKeys(tasks);

    return tasks.stream()
            .map(
                    task -> toCard(
                            task,
                            dependencyKeys.getOrDefault(
                                    task.getId(),
                                    List.of()
                            )
                    )
            )
            .toList();
}

/**
 * Move a task from one Kanban column to another.
 *
 * Example:
 *
 * TODO -> IN_PROGRESS
 * IN_PROGRESS -> IN_REVIEW
 * IN_REVIEW -> DONE
 */
public BoardCard move(
        Long taskId,
        MoveTaskRequest request) {

    Task task = taskRepository
            .findById(taskId)
            .orElseThrow(
                    () -> new EntityNotFoundException(
                            "Task " + taskId + " not found"
                    )
            );
    assertCanMutate(CurrentUser.get(), task);

    /*
     * A backlog task cannot be moved on a sprint board.
     */
    if (task.getSprint() == null) {

        throw new BusinessRuleException(
                task.getTaskKey()
                        + " is in the backlog. "
                        + "Add it to a sprint first."
        );
    }

    if (request == null) {

        throw new BusinessRuleException(
                "Board movement request cannot be empty"
        );
    }

    BoardStatus targetStatus = request.boardStatus();

    if (targetStatus == null) {

        throw new BusinessRuleException(
                "Board status is required"
        );
    }

    /*
     * A task cannot be moved to DONE if one of its
     * dependencies is still incomplete.
     */
    if (targetStatus == BoardStatus.DONE) {

        List<String> openDependencies =
                openDependencyKeys(taskId);

        if (!openDependencies.isEmpty()) {

            throw new BusinessRuleException(
                    task.getTaskKey()
                            + " cannot be completed. "
                            + "Waiting on "
                            + String.join(
                                    ", ",
                                    openDependencies
                            )
            );
        }
    }

    Sprint sprint = task.getSprint();

    /*
     * Completed sprints are read-only.
     */
    if (sprint.getStatus() == SprintStatus.COMPLETED) {

        throw new BusinessRuleException(
                "Tasks cannot be moved in a completed sprint"
        );
    }

    BoardStatus sourceStatus =
            task.getBoardStatus();

    Long sprintId = sprint.getId();

    /*
     * Get all tasks in the destination column.
     */
    List<Task> destinationTasks =
            new ArrayList<>(
                    taskRepository
                            .findBySprintIdAndBoardStatusOrderByBoardPositionAsc(
                                    sprintId,
                                    targetStatus
                            )
            );

    /*
     * Remove the moving task if it already exists
     * in the destination column.
     */
    destinationTasks.removeIf(
            candidate ->
                    candidate.getId().equals(taskId)
    );

    /*
     * Set the new status.
     */
    task.setBoardStatus(targetStatus);
    task.setStatus(targetStatus.getLabel());

    /*
     * Calculate the requested position.
     *
     * If frontend does not provide a position,
     * put the task at the end.
     */
    int position =
            request.position() == null
                    ? destinationTasks.size()
                    : request.position();

    /*
     * Prevent invalid positions.
     */
    position = Math.max(
            0,
            Math.min(
                    position,
                    destinationTasks.size()
            )
    );

    /*
     * Insert task at requested position.
     */
    destinationTasks.add(
            position,
            task
    );

    /*
     * Recalculate positions:
     *
     * 0
     * 1
     * 2
     * 3
     * ...
     */
    reindex(destinationTasks);

    /*
     * If the task came from another column,
     * rebuild the old column as well.
     */
    if (sourceStatus != targetStatus) {

        List<Task> sourceTasks =
                taskRepository
                        .findBySprintIdAndBoardStatusOrderByBoardPositionAsc(
                                sprintId,
                                sourceStatus
                        )
                        .stream()
                        .filter(
                                candidate ->
                                        !candidate
                                                .getId()
                                                .equals(taskId)
                        )
                        .toList();

        reindex(sourceTasks);
    }

    taskRepository.save(task);

    /*
     * Update blocked state of this task.
     */
    recalculateBlocked(task);

    /*
     * If other tasks depend on this task,
     * their blocked status may have changed.
     */
    dependencyRepository
            .findByDependsOnId(taskId)
            .forEach(
                    dependency ->
                            recalculateBlocked(
                                    dependency.getTask()
                            )
            );

    return toCard(
            task,
            dependencyKeysOf(taskId)
    );
}

/**
 * Manually block a task.
 */
public BoardCard setBlocked(
        Long taskId,
        boolean blocked,
        String reason) {

    Task task = taskRepository
            .findById(taskId)
            .orElseThrow(
                    () -> new EntityNotFoundException(
                            "Task " + taskId + " not found"
                    )
            );
    assertCanMutate(CurrentUser.get(), task);

    if (task.getSprint() != null
            && task.getSprint().getStatus()
            == SprintStatus.COMPLETED) {

        throw new BusinessRuleException(
                "Tasks in a completed sprint cannot be changed"
        );
    }

    task.setBlocked(blocked);

    task.setBlockedReason(
            blocked
                    ? (
                            reason == null
                                    || reason.isBlank()
                                    ? "Blocked"
                                    : reason
                    )
                    : null
    );

    taskRepository.save(task);

    return toCard(
            task,
            dependencyKeysOf(taskId)
    );
}

/**
 * Automatically calculate whether a task is blocked
 * because of incomplete dependencies.
 */
public void recalculateBlocked(Task task) {

    List<String> openDependencies =
            openDependencyKeys(task.getId());

    task.setBlocked(
            !openDependencies.isEmpty()
    );

    task.setBlockedReason(
            openDependencies.isEmpty()
                    ? null
                    : "Waiting on "
                            + String.join(
                                    ", ",
                                    openDependencies
                            )
    );

    taskRepository.save(task);
}

/**
 * Get dependencies that are not completed.
 */
private List<String> openDependencyKeys(
        Long taskId) {

    return dependencyRepository
            .findByTaskId(taskId)
            .stream()
            .map(TaskDependency::getDependsOn)
            .filter(
                    task ->
                            task.getBoardStatus()
                                    != BoardStatus.DONE
            )
            .map(Task::getTaskKey)
            .toList();
}

/**
 * Recalculate board positions.
 */
private void reindex(List<Task> tasks) {

    for (int i = 0; i < tasks.size(); i++) {

        tasks.get(i).setBoardPosition(i);
    }

    if (!tasks.isEmpty()) {

        taskRepository.saveAll(tasks);
    }
}

/**
 * Get dependency keys for multiple tasks.
 */
private Map<Long, List<String>> dependencyKeys(
        List<Task> tasks) {

    if (tasks.isEmpty()) {
        return Map.of();
    }

    List<Long> taskIds =
            tasks.stream()
                    .map(Task::getId)
                    .toList();

    return dependencyRepository
            .findByTaskIdIn(taskIds)
            .stream()
            .collect(
                    Collectors.groupingBy(
                            dependency ->
                                    dependency
                                            .getTask()
                                            .getId(),
                            Collectors.mapping(
                                    dependency ->
                                            dependency
                                                    .getDependsOn()
                                                    .getTaskKey(),
                                    Collectors.toList()
                            )
                    )
            );
}

/**
 * Get dependency keys for one task.
 */
private List<String> dependencyKeysOf(
        Long taskId) {

    return dependencyRepository
            .findByTaskId(taskId)
            .stream()
            .map(
                    dependency ->
                            dependency
                                    .getDependsOn()
                                    .getTaskKey()
            )
            .toList();
}

/**
 * Keep the old status field synchronized with
 * the Kanban status.
 */
private void syncLegacyStatus(
        Task task,
        BoardStatus status) {

    task.setStatus(status.getLabel());
}

/**
 * Convert Task entity into a Kanban card.
 */
public BoardCard toCard(
        Task task,
        List<String> dependsOn) {

    int position =
            task.getBoardPosition() == null
                    ? 0
                    : task.getBoardPosition();

    return new BoardCard(
            task.getId(),
            task.getTaskKey(),
            task.getTitle(),
            task.getDescription(),
            task.getPriority(),
            task.getBoardStatus(),
            position,
            task.getStoryPoints(),
            task.getAssignee() == null
                    ? null
                    : task.getAssignee().getId(),
            task.getAssignee() == null
                    ? null
                    : task.getAssignee().getFullName(),
            task.isBlocked(),
            task.getBlockedReason(),
            dependsOn,
            task.getSprint() == null
                    ? null
                    : task.getSprint().getName(),
            task.getDueDate()
    );
}

private void assertCanMutate(AuthUser caller, Task task) {
    if (caller.isAdmin() || caller.isProjectManager() || caller.isProjectLead()) {
        access.assertCanManage(caller, task.getProject());
        return;
    }
    if (caller.isTeamLead()) {
        access.assertCanView(caller, task.getProject());
        return;
    }
    if (task.getAssignee() == null || !task.getAssignee().getId().equals(caller.userId())) {
        throw new AccessDeniedException("You can only move or block tasks assigned to you");
    }
    access.assertCanView(caller, task.getProject());
}

}
