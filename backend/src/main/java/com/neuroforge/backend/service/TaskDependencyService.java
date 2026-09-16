package com.neuroforge.backend.service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.sprint.DependencyRequest;
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
public class TaskDependencyService {

	private final TaskDependencyRepository dependencyRepository;
	private final TaskRepository taskRepository;
	private final BoardService boardService;

	public List<String> add(Long taskId, DependencyRequest req) {
		Task task = task(taskId);
		Task blocker = resolve(req);
		if (task.getId().equals(blocker.getId())) {
			throw new BusinessRuleException("A task cannot depend on itself");
		}
		if (!task.getProject().getId().equals(blocker.getProject().getId())) {
			throw new BusinessRuleException("Dependencies must stay inside the same project");
		}
		if (dependencyRepository.existsByTaskIdAndDependsOnId(task.getId(), blocker.getId())) {
			throw new BusinessRuleException(task.getTaskKey() + " already depends on " + blocker.getTaskKey());
		}
		if (createsCycle(task.getId(), blocker.getId())) {
			throw new BusinessRuleException("That link would create a circular dependency with " + blocker.getTaskKey());
		}
		dependencyRepository.save(new TaskDependency(task, blocker));
		boardService.recalculateBlocked(task);
		return keys(task.getId());
	}

	public List<String> remove(Long taskId, Long dependsOnTaskId) {
		TaskDependency dependency = dependencyRepository.findByTaskIdAndDependsOnId(taskId, dependsOnTaskId)
				.orElseThrow(() -> new EntityNotFoundException("Dependency not found"));
		dependencyRepository.delete(dependency);
		boardService.recalculateBlocked(task(taskId));
		return keys(taskId);
	}

	@Transactional(readOnly = true)
	public List<String> keys(Long taskId) {
		return dependencyRepository.findByTaskId(taskId).stream()
				.map(dependency -> dependency.getDependsOn().getTaskKey()).toList();
	}

	private boolean createsCycle(Long taskId, Long blockerId) {
		Deque<Long> stack = new ArrayDeque<>();
		Set<Long> visited = new HashSet<>();
		stack.push(blockerId);
		while (!stack.isEmpty()) {
			Long current = stack.pop();
			if (current.equals(taskId)) return true;
			if (!visited.add(current)) continue;
			dependencyRepository.findByTaskId(current)
					.forEach(dependency -> stack.push(dependency.getDependsOn().getId()));
		}
		return false;
	}

	private Task resolve(DependencyRequest req) {
		if (req.dependsOnTaskId() != null) return task(req.dependsOnTaskId());
		if (req.dependsOnTaskKey() != null) {
			return taskRepository.findByTaskKey(req.dependsOnTaskKey())
					.orElseThrow(() -> new EntityNotFoundException("Task " + req.dependsOnTaskKey() + " not found"));
		}
		throw new IllegalArgumentException("Provide dependsOnTaskId or dependsOnTaskKey");
	}

	private Task task(Long id) {
		return taskRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Task " + id + " not found"));
	}
}
