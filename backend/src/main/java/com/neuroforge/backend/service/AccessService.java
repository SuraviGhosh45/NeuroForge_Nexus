package com.neuroforge.backend.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.security.AuthUser;

import lombok.RequiredArgsConstructor;

/**
 * Single source of truth for "who may see / manage what".
 * The role always comes from the JWT (AuthUser) - never from the request.
 *
 *  ADMIN            sees and manages everything
 *  PROJECT_MANAGER  sees projects they manage OR are a member of; manages only the ones they manage
 *  TEAM_MEMBER      sees only projects they are a member of; manages nothing
 *
 * Methods that touch project.getMembers() (lazy) must run inside a transaction, hence the class-level @Transactional.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccessService {

    private final ProjectRepository projectRepository;

    /** Projects the caller is allowed to see - scoped in the DATABASE query, not filtered afterwards. */
    public List<Project> visibleProjects(AuthUser user) {
        List<Project> projects = switch (user.role()) {
            case ADMIN -> projectRepository.findAll();
            case PROJECT_MANAGER -> projectRepository.findManagedOrMemberOf(user.userId());
            case TEAM_MEMBER -> projectRepository.findByMemberId(user.userId());
        };
        return projects.stream().sorted(Comparator.comparing(Project::getId)).toList();
    }

    public boolean isMember(Project project, Long userId) {
        return project.getMembers().stream().anyMatch(member -> member.getId().equals(userId));
    }

    public boolean isManager(Project project, Long userId) {
        return project.getProjectManager() != null && project.getProjectManager().getId().equals(userId);
    }

    public boolean canView(AuthUser user, Project project) {
        return switch (user.role()) {
            case ADMIN -> true;
            case PROJECT_MANAGER -> isManager(project, user.userId()) || isMember(project, user.userId());
            case TEAM_MEMBER -> isMember(project, user.userId());
        };
    }

    /** Manage = edit the project, create/edit/delete its tasks, create/edit its teams. */
    public boolean canManage(AuthUser user, Project project) {
        return switch (user.role()) {
            case ADMIN -> true;
            case PROJECT_MANAGER -> isManager(project, user.userId());
            case TEAM_MEMBER -> false;
        };
    }

    public void assertCanView(AuthUser user, Project project) {
        if (!canView(user, project)) {
            throw new AccessDeniedException("You do not have access to this project");
        }
    }

    public void assertCanManage(AuthUser user, Project project) {
        if (!canManage(user, project)) {
            throw new AccessDeniedException("You do not manage this project");
        }
    }
}
