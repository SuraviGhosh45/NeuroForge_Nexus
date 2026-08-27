package com.neuroforage.backend.controller;

import com.neuroforage.backend.dto.ProjectCreateRequest;
import com.neuroforage.backend.dto.ProjectMemberRequest;
import com.neuroforage.backend.dto.ProjectMemberResponse;
import com.neuroforage.backend.dto.ProjectMemberRoleUpdateRequest;
import com.neuroforage.backend.dto.ProjectResponse;
import com.neuroforage.backend.dto.ProjectStatusRequest;
import com.neuroforage.backend.dto.ProjectUpdateRequest;
import com.neuroforage.backend.service.ProjectMemberService;
import com.neuroforage.backend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectMemberService memberService;

    public ProjectController(ProjectService projectService, ProjectMemberService memberService) {
        this.projectService = projectService;
        this.memberService = memberService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request, auth.getName()));
    }

    @GetMapping
    public List<ProjectResponse> getAll(Authentication auth) { return projectService.getAll(auth.getName()); }

    @GetMapping("/{id}")
    public ProjectResponse getById(@PathVariable Long id, Authentication auth) {
        return projectService.getById(id, auth.getName());
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable Long id, @Valid @RequestBody ProjectUpdateRequest request, Authentication auth) {
        return projectService.update(id, request, auth.getName());
    }

    @PatchMapping("/{id}/status")
    public ProjectResponse updateStatus(@PathVariable Long id, @Valid @RequestBody ProjectStatusRequest request, Authentication auth) {
        return projectService.updateStatus(id, request, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) { projectService.deleteOrArchive(id, auth.getName()); }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberResponse> addMember(@PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.add(projectId, request, auth.getName()));
    }

    @GetMapping("/{projectId}/members")
    public List<ProjectMemberResponse> listMembers(@PathVariable Long projectId, Authentication auth) {
        return memberService.list(projectId, auth.getName());
    }

    @PatchMapping("/{projectId}/members/{userId}")
    public ProjectMemberResponse updateMember(@PathVariable Long projectId, @PathVariable Long userId,
            @Valid @RequestBody ProjectMemberRoleUpdateRequest request, Authentication auth) {
        return memberService.updateRole(projectId, userId, request, auth.getName());
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable Long projectId, @PathVariable Long userId, Authentication auth) {
        memberService.remove(projectId, userId, auth.getName());
    }
}
