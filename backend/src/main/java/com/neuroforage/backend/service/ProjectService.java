package com.neuroforage.backend.service;

import com.neuroforage.backend.dto.ProjectCreateRequest;
import com.neuroforage.backend.dto.ProjectResponse;
import com.neuroforage.backend.dto.ProjectStatusRequest;
import com.neuroforage.backend.dto.ProjectUpdateRequest;
import com.neuroforage.backend.exception.ProjectAccessDeniedException;
import com.neuroforage.backend.exception.ProjectNotFoundException;
import com.neuroforage.backend.model.Project;
import com.neuroforage.backend.model.ProjectMember;
import com.neuroforage.backend.model.ProjectMemberRole;
import com.neuroforage.backend.model.ProjectStatus;
import com.neuroforage.backend.model.User;
import com.neuroforage.backend.repository.ProjectMemberRepository;
import com.neuroforage.backend.repository.ProjectRepository;
import com.neuroforage.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectResponse create(ProjectCreateRequest request, String email) {
        User owner = currentUser(email);
        Project project = new Project(request.name().trim(), request.description(),
                request.status() == null ? ProjectStatus.PLANNED : request.status());
        Project saved = projectRepository.save(project);
        memberRepository.save(new ProjectMember(saved, owner, ProjectMemberRole.OWNER));
        return ProjectResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAll(String email) {
        User user = currentUser(email);
        return projectRepository.findDistinctByMembersUserId(user.getId()).stream()
                .map(ProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long id, String email) {
        Project project = accessibleProject(id, email, false);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectUpdateRequest request, String email) {
        Project project = accessibleProject(id, email, true);
        project.setName(request.name().trim());
        project.setDescription(request.description());
        if (request.status() != null) project.setStatus(request.status());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateStatus(Long id, ProjectStatusRequest request, String email) {
        Project project = accessibleProject(id, email, true);
        project.setStatus(request.status());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteOrArchive(Long id, String email) {
        Project project = accessibleProject(id, email, true);
        project.setStatus(ProjectStatus.ARCHIVED);
        projectRepository.save(project);
    }

    private Project accessibleProject(Long id, String email, boolean managementRequired) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found"));
        ProjectMember member = memberRepository.findByProjectIdAndUserId(id, currentUser(email).getId())
                .orElseThrow(() -> new ProjectAccessDeniedException("You are not a member of this project"));
        if (managementRequired && member.getRole() != ProjectMemberRole.OWNER
                && member.getRole() != ProjectMemberRole.MANAGER) {
            throw new ProjectAccessDeniedException("You do not have project-management access");
        }
        return project;
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ProjectAccessDeniedException("Authenticated user was not found"));
    }
}
