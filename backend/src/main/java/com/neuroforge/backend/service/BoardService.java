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
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.TaskDependency;
import com.neuroforge.backend.exception.BusinessRuleException;
import com.neuroforge.backend.repository.TaskDependencyRepository;
import com.neuroforge.backend.repository.TaskRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

	private final TaskRepository taskRepository;
	private final TaskDependencyRepository dependencyRepository;
	private final SprintService sprintService;

	@Transactional(readOnly = true)
	public SprintBoardResponse board(Long sprintId) {
		Sprint sprint = sprintService.get(sprintId);
		List<Task> tasks = taskRepository.findBySprintIdOrderByBoardStatusAscBoardPositionAsc(sprintId);
		Map<Long, List<String>> depKeys = dependencyKeys(tasks);
		List<BoardColumn> columns = new ArrayList<>();

		for (BoardStatus status : BoardStatus.values()) {
			List<BoardCard> cards = tasks.stream()
					.filter(task -> task.getBoardStatus() == status)
					.sorted(Comparator.comparing(Task::getBoardPosition,
							Comparator.nullsLast(Comparator.naturalOrder())))
					.map(task -> toCard(task, depKeys.getOrDefault(task.getId(), List.of())))
					.toList();
			columns.add(new BoardColumn(status, status.getLabel(), cards.size(), cards));
		}

		return new SprintBoardResponse(
				sprint.getId(), sprint.getProject().getId(), sprint.getName(), sprint.getGoal(),
				sprint.getStatus(), sprint.getStartDate(), sprint.getEndDate(),
				sprintService.metrics(sprint), columns);
	}

	@Transactional(readOnly = true)
	public List<BoardCard> backlog(Long projectId) {
		List<Task> tasks = taskRepository.findByProjectIdAndSprintIsNullOrderByIdDesc(projectId);
		Map<Long, List<String>> depKeys = dependencyKeys(tasks);
		return tasks.stream().map(task -> toCard(task, depKeys.getOrDefault(task.getId(), List.of()))).toList();
	}

	public BoardCard move(Long taskId, MoveTaskRequest req) {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task " + taskId + " not found"));
		if (task.getSprint() == null) {
			throw new BusinessRuleException(task.getTaskKey() + " is in the backlog. Add it to a sprint first.");
		}
		BoardStatus target = req.boardStatus();
		if (target == BoardStatus.DONE) {
			List<String> open = openDependencyKeys(taskId);
			if (!open.isEmpty()) {
				throw new BusinessRuleException(task.getTaskKey() +
						" cannot be completed. Waiting on " + String.join(", ", open));
			}
		}

		BoardStatus source = task.getBoardStatus();
		Long sprintId = task.getSprint().getId();
		task.setBoardStatus(target);
		syncLegacyStatus(task, target);
		List<Task> destination = new ArrayList<>(
				taskRepository.findBySprintIdAndBoardStatusOrderByBoardPositionAsc(sprintId, target));
		destination.removeIf(candidate -> candidate.getId().equals(taskId));
		int index = req.position() == null ? destination.size()
				: Math.max(0, Math.min(req.position(), destination.size()));
		destination.add(index, task);
		reindex(destination);

		if (source != target) {
			reindex(taskRepository.findBySprintIdAndBoardStatusOrderByBoardPositionAsc(sprintId, source)
					.stream().filter(candidate -> !candidate.getId().equals(taskId)).toList());
		}
		taskRepository.save(task);
		recalculateBlocked(task);
		dependencyRepository.findByDependsOnId(taskId)
				.forEach(dependency -> recalculateBlocked(dependency.getTask()));
		return toCard(task, dependencyKeysOf(taskId));
	}

	public BoardCard setBlocked(Long taskId, boolean blocked, String reason) {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task " + taskId + " not found"));
		task.setBlocked(blocked);
		task.setBlockedReason(blocked ? reason : null);
		taskRepository.save(task);
		return toCard(task, dependencyKeysOf(taskId));
	}

	public void recalculateBlocked(Task task) {
		List<String> open = openDependencyKeys(task.getId());
		task.setBlocked(!open.isEmpty());
		task.setBlockedReason(open.isEmpty() ? null : "Waiting on " + String.join(", ", open));
		taskRepository.save(task);
	}

	private List<String> openDependencyKeys(Long taskId) {
		return dependencyRepository.findByTaskId(taskId).stream()
				.map(TaskDependency::getDependsOn)
				.filter(task -> task.getBoardStatus() != BoardStatus.DONE)
				.map(Task::getTaskKey)
				.toList();
	}

	private void reindex(List<Task> column) {
		for (int i = 0; i < column.size(); i++) column.get(i).setBoardPosition(i);
		taskRepository.saveAll(column);
	}

	private Map<Long, List<String>> dependencyKeys(List<Task> tasks) {
		if (tasks.isEmpty()) return Map.of();
		List<Long> ids = tasks.stream().map(Task::getId).toList();
		return dependencyRepository.findByTaskIdIn(ids).stream()
				.collect(Collectors.groupingBy(dependency -> dependency.getTask().getId(),
						Collectors.mapping(dependency -> dependency.getDependsOn().getTaskKey(), Collectors.toList())));
	}

	private List<String> dependencyKeysOf(Long taskId) {
		return dependencyRepository.findByTaskId(taskId).stream()
				.map(dependency -> dependency.getDependsOn().getTaskKey()).toList();
	}

	private void syncLegacyStatus(Task task, BoardStatus status) {
		task.setStatus(status.getLabel());
	}

	public BoardCard toCard(Task task, List<String> dependsOn) {
		int position = task.getBoardPosition() == null ? 0 : task.getBoardPosition().intValue();
		return new BoardCard(
				task.getId(), task.getTaskKey(), task.getTitle(), task.getDescription(), task.getPriority(),
				task.getBoardStatus(), position,
				task.getStoryPoints(), task.getAssignee() == null ? null : task.getAssignee().getId(),
				task.getAssignee() == null ? null : task.getAssignee().getFullName(), task.isBlocked(),
				task.getBlockedReason(), dependsOn,
				task.getSprint() == null ? null : task.getSprint().getName(), task.getDueDate());
	}
}
