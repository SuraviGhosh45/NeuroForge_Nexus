package com.neuroforge.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.sprint.SprintRequest;
import com.neuroforge.backend.dto.sprint.SprintResponse;
import com.neuroforge.backend.service.SprintService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SprintController {

	private final SprintService sprintService;

	@PostMapping("/projects/{projectId}/sprints")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	@ResponseStatus(HttpStatus.CREATED)
	public SprintResponse create(@PathVariable Long projectId, @Valid @RequestBody SprintRequest request) {
		return sprintService.create(projectId, request);
	}

	@GetMapping("/projects/{projectId}/sprints")
	public List<SprintResponse> list(@PathVariable Long projectId) {
		return sprintService.listByProject(projectId);
	}

	@GetMapping("/projects/{projectId}/sprints/active")
	public SprintResponse active(@PathVariable Long projectId) {
		return sprintService.activeSprint(projectId);
	}

	@GetMapping("/sprints/{sprintId}")
	public SprintResponse one(@PathVariable Long sprintId) {
		return sprintService.findOne(sprintId);
	}

	@PutMapping("/sprints/{sprintId}")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public SprintResponse update(@PathVariable Long sprintId, @Valid @RequestBody SprintRequest request) {
		return sprintService.update(sprintId, request);
	}

	@PatchMapping("/sprints/{sprintId}/activate")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public SprintResponse activate(@PathVariable Long sprintId) {
		return sprintService.activate(sprintId);
	}

	@PatchMapping("/sprints/{sprintId}/complete")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public SprintResponse complete(@PathVariable Long sprintId,
								   @RequestParam(required = false) Long moveUnfinishedTo) {
		return sprintService.complete(sprintId, moveUnfinishedTo);
	}

	@DeleteMapping("/sprints/{sprintId}")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public ResponseEntity<Void> delete(@PathVariable Long sprintId) {
		sprintService.delete(sprintId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/sprints/{sprintId}/tasks/{taskId}")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public ResponseEntity<Void> addTask(@PathVariable Long sprintId, @PathVariable Long taskId) {
		sprintService.addTask(sprintId, taskId);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/sprints/{sprintId}/tasks/{taskId}")
	@PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
	public ResponseEntity<Void> removeTask(@PathVariable Long sprintId, @PathVariable Long taskId) {
		sprintService.removeTask(sprintId, taskId);
		return ResponseEntity.noContent().build();
	}
}
