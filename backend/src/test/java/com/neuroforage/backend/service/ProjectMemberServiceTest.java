package com.neuroforage.backend.service;

import com.neuroforage.backend.dto.ProjectMemberRequest;
import com.neuroforage.backend.exception.DuplicateProjectMemberException;
import com.neuroforage.backend.model.Project;
import com.neuroforage.backend.model.ProjectMemberRole;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectMemberServiceTest {
    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @InjectMocks ProjectMemberService memberService;

    @Test
    void duplicateMembershipIsRejected() {
        User owner = user(1L, "owner@example.com");
        User member = user(2L, "member@example.com");
        Project project = new Project("Lifecycle", null, null);
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(memberRepository.findByProjectIdAndUserId(5L, 1L))
                .thenReturn(Optional.of(new com.neuroforage.backend.model.ProjectMember(
                        project, owner, ProjectMemberRole.OWNER)));
        when(userRepository.findById(member.getId())).thenReturn(Optional.of(member));
        when(memberRepository.existsByProjectIdAndUserId(5L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> memberService.add(5L,
                new ProjectMemberRequest(2L, ProjectMemberRole.DEVELOPER), owner.getEmail()))
                .isInstanceOf(DuplicateProjectMemberException.class);
        verify(memberRepository, never()).save(any());
    }

    @Test
    void managerCanRemoveMember() {
        User manager = user(1L, "manager@example.com");
        User member = user(2L, "member@example.com");
        Project project = new Project("Lifecycle", null, null);
        com.neuroforage.backend.model.ProjectMember managerMembership =
                new com.neuroforage.backend.model.ProjectMember(project, manager, ProjectMemberRole.MANAGER);
        com.neuroforage.backend.model.ProjectMember memberMembership =
                new com.neuroforage.backend.model.ProjectMember(project, member, ProjectMemberRole.DEVELOPER);
        when(projectRepository.findById(5L)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(memberRepository.findByProjectIdAndUserId(5L, 1L)).thenReturn(Optional.of(managerMembership));
        when(memberRepository.findByProjectIdAndUserId(5L, 2L)).thenReturn(Optional.of(memberMembership));

        memberService.remove(5L, 2L, manager.getEmail());

        verify(memberRepository).delete(memberMembership);
    }

    private User user(Long id, String email) {
        User user = new User("User", email, "encoded-password", Role.USER);
        user.setId(id);
        return user;
    }
}
