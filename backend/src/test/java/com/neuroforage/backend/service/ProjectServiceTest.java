package com.neuroforage.backend.service;

import com.neuroforage.backend.dto.ProjectCreateRequest;
import com.neuroforage.backend.dto.ProjectResponse;
import com.neuroforage.backend.dto.ProjectUpdateRequest;
import com.neuroforage.backend.exception.ProjectAccessDeniedException;
import com.neuroforage.backend.model.Project;
import com.neuroforage.backend.model.ProjectMember;
import com.neuroforage.backend.model.ProjectMemberRole;
import com.neuroforage.backend.model.ProjectStatus;
import com.neuroforage.backend.model.Role;
import com.neuroforage.backend.model.User;
import com.neuroforage.backend.repository.ProjectMemberRepository;
import com.neuroforage.backend.repository.ProjectRepository;
import com.neuroforage.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @InjectMocks ProjectService projectService;

    @Test
    void createMakesAuthenticatedUserOwner() {
        User owner = user(1L, "owner@example.com");
        Project project = new Project("Lifecycle", "Description", ProjectStatus.ACTIVE);
        when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.create(
                new ProjectCreateRequest(" Lifecycle ", "Description", ProjectStatus.ACTIVE),
                owner.getEmail());

        assertThat(response.name()).isEqualTo("Lifecycle");
        verify(memberRepository).save(argThat(member -> member.getUser() == owner
                && member.getRole() == ProjectMemberRole.OWNER));
    }

    @Test
    void getProjectRejectsNonMember() {
        User user = user(2L, "user@example.com");
        Project project = new Project("Lifecycle", null, ProjectStatus.PLANNED);
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(memberRepository.findByProjectIdAndUserId(5L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getById(5L, user.getEmail()))
                .isInstanceOf(ProjectAccessDeniedException.class);
    }

    @Test
    void updateChangesProjectFieldsForManager() {
        User manager = user(2L, "manager@example.com");
        Project project = new Project("Old", null, ProjectStatus.PLANNED);
        ProjectMember membership = new ProjectMember(project, manager, ProjectMemberRole.MANAGER);
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(memberRepository.findByProjectIdAndUserId(5L, 2L)).thenReturn(Optional.of(membership));
        when(projectRepository.save(project)).thenReturn(project);

        ProjectResponse response = projectService.update(5L,
                new ProjectUpdateRequest("New", "Updated", ProjectStatus.ACTIVE), manager.getEmail());

        assertThat(response.name()).isEqualTo("New");
        assertThat(response.status()).isEqualTo(ProjectStatus.ACTIVE);
    }

    private User user(Long id, String email) {
        User user = new User("User", email, "encoded-password", Role.USER);
        user.setId(id);
        return user;
    }
}
