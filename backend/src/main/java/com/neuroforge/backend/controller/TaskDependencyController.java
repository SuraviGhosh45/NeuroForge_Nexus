package com.neuroforge.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.sprint.DependencyRequest;
import com.neuroforge.backend.service.TaskDependencyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks/{taskId}/dependencies")
@RequiredArgsConstructor
public class TaskDependencyController {

	private final TaskDependencyService dependencyService;

	@GetMapping
	public List<String> list(@PathVariable Long taskId) {
		return dependencyService.keys(taskId);
	}

	@PostMapping
	public List<String> add(@PathVariable Long taskId, @RequestBody DependencyRequest request) {
		return dependencyService.add(taskId, request);
	}

	@DeleteMapping("/{dependsOnTaskId}")
	public List<String> remove(@PathVariable Long taskId, @PathVariable Long dependsOnTaskId) {
		return dependencyService.remove(taskId, dependsOnTaskId);
	}
}
