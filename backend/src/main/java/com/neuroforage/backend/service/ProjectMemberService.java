package com.neuroforage.backend.service;

import com.neuroforage.backend.dto.ProjectMemberRequest;
import com.neuroforage.backend.dto.ProjectMemberResponse;
import com.neuroforage.backend.dto.ProjectMemberRoleUpdateRequest;
import com.neuroforage.backend.exception.DuplicateProjectMemberException;
import com.neuroforage.backend.exception.ProjectAccessDeniedException;
import com.neuroforage.backend.exception.ProjectNotFoundException;
import com.neuroforage.backend.exception.ResourceNotFoundException;
import com.neuroforage.backend.model.Project;
import com.neuroforage.backend.model.ProjectMember;
import com.neuroforage.backend.model.ProjectMemberRole;
import com.neuroforage.backend.model.User;
import com.neuroforage.backend.repository.ProjectMemberRepository;
import com.neuroforage.backend.repository.ProjectRepository;
import com.neuroforage.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectMemberService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ProjectMemberService(ProjectRepository projectRepository, ProjectMemberRepository memberRepository,
                                UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectMemberResponse add(Long projectId, ProjectMemberRequest request, String email) {
        Project project = project(projectId);
        requireManager(projectId, email);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (memberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new DuplicateProjectMemberException("User is already a member of this project");
        }
        if (request.role() == ProjectMemberRole.OWNER) {
            throw new ProjectAccessDeniedException("A project can only have its original owner");
        }
        return ProjectMemberResponse.from(memberRepository.save(
                new ProjectMember(project, user, request.role())));
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> list(Long projectId, String email) {
        project(projectId);
        requireMember(projectId, email);
        return memberRepository.findByProjectId(projectId).stream().map(ProjectMemberResponse::from).toList();
    }

    @Transactional
    public ProjectMemberResponse updateRole(Long projectId, Long userId, ProjectMemberRoleUpdateRequest request, String email) {
        project(projectId);
        requireManager(projectId, email);
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));
        if (member.getRole() == ProjectMemberRole.OWNER || request.role() == ProjectMemberRole.OWNER) {
            throw new ProjectAccessDeniedException("The project owner role cannot be changed");
        }
        member.setRole(request.role());
        return ProjectMemberResponse.from(memberRepository.save(member));
    }

    @Transactional
    public void remove(Long projectId, Long userId, String email) {
        project(projectId);
        requireManager(projectId, email);
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));
        if (member.getRole() == ProjectMemberRole.OWNER) {
            throw new ProjectAccessDeniedException("The project owner cannot be removed");
        }
        memberRepository.delete(member);
    }

    private Project project(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found"));
    }

    private void requireManager(Long projectId, String email) {
        ProjectMember member = requireMember(projectId, email);
        if (member.getRole() != ProjectMemberRole.OWNER && member.getRole() != ProjectMemberRole.MANAGER) {
            throw new ProjectAccessDeniedException("You do not have project-management access");
        }
    }

    private ProjectMember requireMember(Long projectId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ProjectAccessDeniedException("Authenticated user was not found"));
        return memberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new ProjectAccessDeniedException("You are not a member of this project"));
    }
}
