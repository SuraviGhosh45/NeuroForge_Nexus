package com.neuroforge.backend.controller;

import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.TaskDtos.StatusRequest;
import com.neuroforge.backend.dto.TaskDtos.TaskResponse;
import com.neuroforge.backend.dto.TaskRequest;
import com.neuroforge.backend.service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** Admin: all. PM: tasks of their projects. Team Member: only tasks assigned to them. */
    @GetMapping
    public List<TaskResponse> list() {
        return taskService.list();
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable Long id) {
        return taskService.get(id);
    }

    /** Admin / PM (a PM only for projects they manage - checked in the service). */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<TaskResponse> create(@RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public TaskResponse update(@PathVariable Long id, @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }

    /**
     * Kanban drag & drop. Open to every role at the URL level because a Team Member may move THEIR OWN tasks;
     * the service enforces: Team Member -> only tasks assigned to them, PM -> only projects they manage.
     */
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return taskService.updateStatus(id, request.status());
    }
}
