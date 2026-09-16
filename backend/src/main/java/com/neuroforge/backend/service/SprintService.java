package com.neuroforge.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.sprint.SprintMetrics;
import com.neuroforge.backend.dto.sprint.SprintRequest;
import com.neuroforge.backend.dto.sprint.SprintResponse;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.SprintStatus;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.exception.BusinessRuleException;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.SprintRepository;
import com.neuroforge.backend.repository.TaskRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SprintService {

	private final SprintRepository sprintRepository;
	private final ProjectRepository projectRepository;
	private final TaskRepository taskRepository;

	public SprintResponse create(Long projectId, SprintRequest req) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project " + projectId + " not found"));
		if (sprintRepository.existsByProjectIdAndNameIgnoreCase(projectId, req.name())) {
			throw new BusinessRuleException("A sprint named '" + req.name() + "' already exists in this project");
		}
		validateDates(req);

		Sprint sprint = Sprint.builder()
				.project(project)
				.name(req.name().trim())
				.goal(req.goal())
				.startDate(req.startDate())
				.endDate(req.endDate())
				.status(SprintStatus.PLANNED)
				.capacityPoints(req.capacityPoints() == null ? 0 : req.capacityPoints().intValue())
				.build();
		return toResponse(sprintRepository.save(sprint));
	}

	public SprintResponse update(Long sprintId, SprintRequest req) {
		Sprint sprint = get(sprintId);
		validateDates(req);
		sprint.setName(req.name().trim());
		sprint.setGoal(req.goal());
		sprint.setStartDate(req.startDate());
		sprint.setEndDate(req.endDate());
		if (req.capacityPoints() != null) {
			sprint.setCapacityPoints(req.capacityPoints());
		}
		return toResponse(sprint);
	}

	@Transactional(readOnly = true)
	public List<SprintResponse> listByProject(Long projectId) {
		return sprintRepository.findByProjectIdOrderByStartDateDesc(projectId)
				.stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public SprintResponse findOne(Long sprintId) {
		return toResponse(get(sprintId));
	}

	@Transactional(readOnly = true)
	public SprintResponse activeSprint(Long projectId) {
		return sprintRepository.findByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)
				.map(this::toResponse)
				.orElseThrow(() -> new EntityNotFoundException("No active sprint for project " + projectId));
	}

	public void delete(Long sprintId) {
		Sprint sprint = get(sprintId);
		taskRepository.findBySprintIdOrderByBoardStatusAscBoardPositionAsc(sprintId)
				.forEach(task -> task.setSprint(null));
		sprintRepository.delete(sprint);
	}

	public SprintResponse activate(Long sprintId) {
		Sprint sprint = get(sprintId);
		if (sprint.getStatus() == SprintStatus.COMPLETED) {
			throw new BusinessRuleException("A completed sprint cannot be reactivated");
		}
		sprintRepository.findByProjectIdAndStatus(sprint.getProject().getId(), SprintStatus.ACTIVE)
				.filter(active -> !active.getId().equals(sprintId))
				.ifPresent(active -> {
					throw new BusinessRuleException(active.getName() + " is already active. Complete it first.");
				});
		sprint.setStatus(SprintStatus.ACTIVE);
		return toResponse(sprint);
	}

	public SprintResponse complete(Long sprintId, Long moveUnfinishedToSprintId) {
		Sprint sprint = get(sprintId);
		Sprint target = moveUnfinishedToSprintId == null ? null : get(moveUnfinishedToSprintId);
		if (target != null && !target.getProject().getId().equals(sprint.getProject().getId())) {
			throw new BusinessRuleException("The target sprint belongs to a different project");
		}

		int carried = 0;
		for (Task task : taskRepository.findBySprintIdOrderByBoardStatusAscBoardPositionAsc(sprintId)) {
			if (task.getBoardStatus() != BoardStatus.DONE) {
				task.setSprint(target);
				task.setBoardPosition(carried++);
			}
		}
		sprint.setStatus(SprintStatus.COMPLETED);
		return toResponse(sprint);
	}

	public void addTask(Long sprintId, Long taskId) {
		Sprint sprint = get(sprintId);
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task " + taskId + " not found"));
		if (!task.getProject().getId().equals(sprint.getProject().getId())) {
			throw new BusinessRuleException("Task " + task.getTaskKey() + " belongs to another project");
		}
		int size = taskRepository.findBySprintIdAndBoardStatusOrderByBoardPositionAsc(
				sprintId, task.getBoardStatus()).size();
		task.setSprint(sprint);
		task.setBoardPosition(size);
	}

	public void removeTask(Long sprintId, Long taskId) {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new EntityNotFoundException("Task " + taskId + " not found"));
		if (task.getSprint() == null || !task.getSprint().getId().equals(sprintId)) {
			throw new BusinessRuleException("Task is not part of this sprint");
		}
		task.setSprint(null);
		task.setBoardPosition(0);
	}

	@Transactional(readOnly = true)
	public SprintMetrics metrics(Sprint sprint) {
		List<Task> tasks = taskRepository.findBySprintIdOrderByBoardStatusAscBoardPositionAsc(sprint.getId());
		int totalTasks = tasks.size();
		int storyPoints = tasks.stream().mapToInt(SprintService::points).sum();
		List<Task> done = tasks.stream().filter(task -> task.getBoardStatus() == BoardStatus.DONE).toList();
		int completedTasks = done.size();
		int completedPoints = done.stream().mapToInt(SprintService::points).sum();
		int capacity = sprint.getCapacityPoints() == null || sprint.getCapacityPoints() == 0
				? storyPoints : sprint.getCapacityPoints().intValue();
		int percent = storyPoints == 0 ? 0 : Math.round(completedPoints * 100f / storyPoints);
		return new SprintMetrics(totalTasks, storyPoints, completedTasks, completedPoints,
				velocity(sprint.getProject().getId()), capacity, completedPoints,
				storyPoints - completedPoints, percent);
	}

	private int velocity(Long projectId) {
		List<Sprint> past = sprintRepository
				.findTop3ByProjectIdAndStatusOrderByEndDateDesc(projectId, SprintStatus.COMPLETED);
		if (past.isEmpty()) return 0;
		int sum = past.stream()
				.mapToInt(sprint -> taskRepository.sumPointsBySprintAndStatus(sprint.getId(), BoardStatus.DONE))
				.sum();
		return Math.round((float) sum / past.size());
	}

	private static int points(Task task) {
		return task.getStoryPoints() == null ? 0 : task.getStoryPoints().intValue();
	}

	public Sprint get(Long sprintId) {
		return sprintRepository.findById(sprintId)
				.orElseThrow(() -> new EntityNotFoundException("Sprint " + sprintId + " not found"));
	}

	private void validateDates(SprintRequest req) {
		if (req.startDate() != null && req.endDate() != null && req.endDate().isBefore(req.startDate())) {
			throw new IllegalArgumentException("End date cannot be before start date");
		}
	}

	public SprintResponse toResponse(Sprint sprint) {
		return new SprintResponse(
				sprint.getId(), sprint.getProject().getId(), sprint.getProject().getName(),
				sprint.getName(), sprint.getGoal(), sprint.getStartDate(), sprint.getEndDate(),
				sprint.getStatus(), sprint.getCapacityPoints(), metrics(sprint));
	}
}
