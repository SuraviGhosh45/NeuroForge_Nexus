package com.neuroforge.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.neuroforge.backend.dto.ProjectDtos;
import com.neuroforge.backend.dto.ProjectMemberRequest;
import com.neuroforge.backend.dto.ProjectMemberStatusRequest;
import com.neuroforge.backend.dto.ProjectRequest;
import com.neuroforge.backend.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectDtos.Summary> list() { return projectService.list(); }

    @GetMapping("/priority-suggestion")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
    public ProjectDtos.PrioritySuggestion prioritySuggestion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return projectService.suggestion(startDate, endDate);
    }

    @GetMapping("/{id}")
    public ProjectDtos.Detail get(@PathVariable Long id) { return projectService.get(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ProjectDtos.Detail> create(@RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD')")
    public ProjectDtos.Detail update(@PathVariable Long id, @RequestBody ProjectRequest request) {
        return projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/members")
    public List<ProjectDtos.MemberInfo> members(@PathVariable Long projectId) {
        return projectService.members(projectId);
    }

    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD','TEAM_LEAD')")
    public ResponseEntity<ProjectDtos.MemberInfo> addMember(@PathVariable Long projectId,
                                                              @Valid @RequestBody ProjectMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addMember(projectId, request.userId(), request.projectRole()));
    }

    @PutMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD','TEAM_LEAD')")
    public ProjectDtos.MemberInfo updateMember(@PathVariable Long projectId, @PathVariable Long userId,
                                                @Valid @RequestBody ProjectMemberRequest request) {
        return projectService.updateMember(projectId, userId, request.projectRole());
    }

    @PatchMapping("/{projectId}/members/{userId}/status")
    public ProjectDtos.MemberInfo updateMemberStatus(@PathVariable Long projectId, @PathVariable Long userId,
                                                       @Valid @RequestBody ProjectMemberStatusRequest request) {
        return projectService.updateMemberStatus(projectId, userId, request.status());
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER','PROJECT_LEAD','TEAM_LEAD')")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}
