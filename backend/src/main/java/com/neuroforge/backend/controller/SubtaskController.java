package com.neuroforge.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.neuroforge.backend.dto.SubtaskDtos.StatusRequest;
import com.neuroforge.backend.dto.SubtaskDtos.SubtaskResponse;
import com.neuroforge.backend.dto.SubtaskRequest;
import com.neuroforge.backend.service.SubtaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SubtaskController {
    private final SubtaskService subtaskService;

    @GetMapping("/api/tasks/{taskId}/subtasks")
    public List<SubtaskResponse> list(@PathVariable Long taskId) {
        return subtaskService.listByTask(taskId);
    }

    @PostMapping("/api/tasks/{taskId}/subtasks")
    public ResponseEntity<SubtaskResponse> create(@PathVariable Long taskId, @Valid @RequestBody SubtaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subtaskService.create(taskId, request));
    }

    @PutMapping("/api/subtasks/{id}")
    public SubtaskResponse update(@PathVariable Long id, @Valid @RequestBody SubtaskRequest request) {
        return subtaskService.update(id, request);
    }

    @DeleteMapping("/api/subtasks/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        subtaskService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Subtask deleted successfully"));
    }

    @PatchMapping("/api/subtasks/{id}/status")
    public SubtaskResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return subtaskService.updateStatus(id, request.status());
    }
}
