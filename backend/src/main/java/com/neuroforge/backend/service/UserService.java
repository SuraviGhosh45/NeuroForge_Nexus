package com.neuroforge.backend.service;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.SignupRequest;
import com.neuroforge.backend.dto.CreateUserRequest;
import com.neuroforge.backend.dto.UpdateUserRequest;
import com.neuroforge.backend.dto.UserDtos.ProfileProject;
import com.neuroforge.backend.dto.UserDtos.ProfileResponse;
import com.neuroforge.backend.dto.UserDtos.ProfileTask;
import com.neuroforge.backend.dto.UserDtos.ProfileTeam;
import com.neuroforge.backend.dto.UserDtos.UserOption;
import com.neuroforge.backend.dto.UserDtos.UserResponse;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.Team;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.exception.BusinessRuleException;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.ProjectMemberAssignmentRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.TeamMemberRepository;
import com.neuroforge.backend.repository.UserRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProjectRepository projectRepository;
    private final ProjectMemberAssignmentRepository projectMemberAssignmentRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskRepository taskRepository;

    // ------------------------------------------------------------------ auth

    /**
     * Signup. The role is NEVER read from the client: every new account is UNASSIGNED
     * until an Admin promotes them to a real role.
     */
    @Transactional
    public User register(SignupRequest request) {

        if (request.getConfirmPassword() != null
                && !request.getConfirmPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessRuleException("An account with this email already exists");
        }
        String userCode = request.getUserCode();
        if (userCode == null || userCode.isBlank()) userCode = uniqueUserCodeFromEmail(email);
        else if (userRepository.existsByUserCodeIgnoreCase(userCode)) throw new BusinessRuleException("This User ID is already taken");

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setLegacyName(request.getFullName().trim());
        user.setUserCode(userCode);
        user.setEmail(email);
        user.setContactNumber(request.getContactNumber() == null || request.getContactNumber().isBlank() ? null : request.getContactNumber().trim());
        user.setSkill(request.getSkill());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.UNASSIGNED);   // privileged/execution roles are assigned by Admin only
        user.setActive(true);
        user.setAvailabilityStatus("Active");

        return userRepository.save(user);
    }

    /** Login with Email OR User ID + password. */
    @Transactional(readOnly = true)
    public User authenticate(String identifier, String rawPassword) {

        String id = identifier.trim();

        Optional<User> found = id.contains("@")
                ? userRepository.findByEmailIgnoreCase(id)
                : userRepository.findByUserCodeIgnoreCase(id);

        User user = found.orElseThrow(() -> new BadCredentialsException("Invalid email/User ID or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid email/User ID or password");
        }

        if (!user.isActive()) {
            throw new DisabledException("Your account is inactive. Please contact an administrator.");
        }

        return user;
    }

    private String uniqueUserCodeFromEmail(String email) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^A-Za-z0-9._-]", "");
        if (base.length() < 3) base = "user";
        base = base.substring(0, Math.min(base.length(), 24));
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUserCodeIgnoreCase(candidate)) {
            String tail = String.valueOf(suffix++);
            candidate = base.substring(0, Math.min(base.length(), 30 - tail.length())) + tail;
        }
        return candidate;
    }

    // ------------------------------------------------------------------ Users page (Admin)

    @Transactional
    public UserResponse createByAdmin(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) throw new BusinessRuleException("An account with this email already exists");
        String userCode = request.getUserCode();
        if (userCode == null || userCode.isBlank()) {
            String base = email.substring(0, email.indexOf('@')).replaceAll("[^A-Za-z0-9._-]", "");
            if (base.length() < 3) base = "user";
            base = base.substring(0, Math.min(base.length(), 24));
            userCode = base;
            int suffix = 1;
            while (userRepository.existsByUserCodeIgnoreCase(userCode)) {
                String tail = String.valueOf(suffix++);
                userCode = base.substring(0, Math.min(base.length(), 30 - tail.length())) + tail;
            }
        } else if (userRepository.existsByUserCodeIgnoreCase(userCode)) {
            throw new BusinessRuleException("This User ID is already taken");
        }
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setLegacyName(user.getFullName());
        user.setUserCode(userCode);
        user.setEmail(email);
        user.setContactNumber(request.getContactNumber());
        user.setSkill(request.getSkill());
        user.setRole(request.getRole() == null ? Role.UNASSIGNED : request.getRole());
        user.setPassword(passwordEncoder.encode(request.getPassword() == null || request.getPassword().isBlank() ? "TempPass@123" : request.getPassword()));
        setAvailabilityFields(user, request.getStatus() == null ? "Active" : request.getStatus(), false);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list(String search) {
        List<User> users = search == null || search.isBlank()
                ? userRepository.findAllByOrderByFullNameAsc()
                : userRepository.search(search.trim());
        return users.stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return UserResponse.from(getUserById(id));
    }

    /**
     * Dropdown source for Admin/PM (project manager picker, member multi-select, team members).
     * Active users only, no email/phone. Optional role filter, e.g. roles=PROJECT_MANAGER,ADMIN.
     */
    @Transactional(readOnly = true)
    public List<UserOption> options(Collection<Role> roles) {
        List<User> users = roles == null || roles.isEmpty()
                ? userRepository.findByActiveTrueOrderByFullNameAsc()
                : userRepository.findByActiveTrueAndRoleInOrderByFullNameAsc(roles);
        return users.stream().map(UserOption::from).toList();
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getUserById(id);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
            user.setLegacyName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                throw new BusinessRuleException("An account with this email already exists");
            }
            user.setEmail(email);
        }

        if (request.getUserCode() != null && !request.getUserCode().isBlank()) {
            String userCode = request.getUserCode().trim();
            if (userRepository.existsByUserCodeIgnoreCaseAndIdNot(userCode, id)) {
                throw new BusinessRuleException("This User ID is already taken");
            }
            user.setUserCode(userCode);
        }

        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            user.setContactNumber(request.getContactNumber().trim());
        }

        if (request.getSkill() != null) {
            user.setSkill(request.getSkill());
        }

        return UserResponse.from(userRepository.save(user));
    }

    /** PATCH /api/users/{id}/role (Admin only). */
    @Transactional
    public UserResponse changeRole(Long id, Role newRole) {
        User user = getUserById(id);

        if (user.getRole() == newRole) {
            return UserResponse.from(user);
        }

        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN
                && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new BusinessRuleException("At least one Admin must remain in the system");
        }

        if (newRole == Role.DEVELOPER || newRole == Role.TESTER || newRole == Role.QA) {
            long managed = projectRepository.countByProjectManagerId(id);
            long led = projectRepository.countByProjectLeadId(id);
            long teamLeadAssignments = teamMemberRepository.findByUserId(id).stream()
                    .filter(tm -> "Team Lead".equalsIgnoreCase(tm.getTeamRole())).count();
            if (managed > 0 || led > 0 || teamLeadAssignments > 0) {
                throw new BusinessRuleException(user.getFullName() + " still has management responsibilities. Reassign projects/teams before changing this role.");
            }
        }

        user.setRole(newRole);
        return UserResponse.from(userRepository.save(user));
    }

    /** PATCH /api/users/{id}/status (Admin only): Active / Inactive. */
    @Transactional
    public UserResponse setStatus(Long id, Boolean active, String status) {
        AuthUser caller = CurrentUser.get();
        User user = getUserById(id);
        boolean self = caller.userId().equals(id);
        if (!caller.isAdmin() && !self) throw new AccessDeniedException("You can only update your own status");
        String resolved = (status == null || status.isBlank()) ? ((active != null && active) ? "Active" : "Inactive") : status.trim();
        setAvailabilityFields(user, resolved, self);
        return UserResponse.from(userRepository.save(user));
    }

    private void setAvailabilityFields(User user, String status, boolean self) {
        if (!List.of("Active", "Inactive", "In Meeting").contains(status)) throw new BusinessRuleException("Invalid user status");
        if (self && "Inactive".equals(status)) throw new BusinessRuleException("You cannot deactivate your own account");
        user.setAvailabilityStatus(status);
        user.setActive(!"Inactive".equals(status));
    }

    /** PATCH /api/users/me/password (any authenticated user, on their own account only). */
    @Transactional
    public void changeOwnPassword(String currentPassword, String newPassword) {
        AuthUser caller = CurrentUser.get();
        User user = getUserById(caller.userId());

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessRuleException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * DELETE /api/users/{id} (Admin only).
     * The user is removed from teams and project member lists and their tasks become unassigned.
     * A user who still manages projects cannot be deleted (reassign the projects first).
     */
    @Transactional
    public void delete(Long id) {
        AuthUser caller = CurrentUser.get();

        if (caller.userId().equals(id)) {
            throw new BusinessRuleException("You cannot delete your own account here. Use the account menu to delete your own account.");
        }

        User user = getUserById(id);
        assertNoOutstandingResponsibilities(user);
        purgeAndDelete(user);
    }

    /**
     * DELETE /api/users/me (self-service, any authenticated user).
     * The id always comes from the caller's own token. Blocked if this is the last
     * Admin in the system, or the user still manages/leads a project or team -
     * same guard rails as the Admin-driven delete, just enforced on yourself.
     */
    @Transactional
    public void deleteSelf() {
        AuthUser caller = CurrentUser.get();
        User user = getUserById(caller.userId());

        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new BusinessRuleException("You are the last Admin. Promote another user to Admin before deleting your account.");
        }

        assertNoOutstandingResponsibilities(user);
        purgeAndDelete(user);
    }

    /** Shared guard for both delete paths: can't remove someone still managing/leading live work. */
    private void assertNoOutstandingResponsibilities(User user) {
        Long id = user.getId();
        long managed = projectRepository.countByProjectManagerId(id);
        long led = projectRepository.countByProjectLeadId(id);
        long teamLeadAssignments = teamMemberRepository.findByUserId(id).stream()
                .filter(tm -> "Team Lead".equalsIgnoreCase(tm.getTeamRole())).count();
        if (managed > 0 || led > 0 || teamLeadAssignments > 0) {
            throw new BusinessRuleException("You still have project/team responsibilities. Reassign them before deleting this account.");
        }
    }

    /** Shared cleanup + delete used by both the Admin-driven and self-service delete. */
    private void purgeAndDelete(User user) {
        Long id = user.getId();
        teamMemberRepository.deleteByUserId(id);
        projectMemberAssignmentRepository.deleteByUserId(id);
        projectRepository.removeUserFromAllProjects(id);
        taskRepository.unassignUser(id);
        userRepository.deleteById(id);
    }

    // ------------------------------------------------------------------ profile

    /**
     * GET /api/users/{id}/profile - one call with everything the profile page shows.
     * Allowed for an Admin (any user) and for a user viewing their own profile.
     */
    @Transactional(readOnly = true)
    public ProfileResponse profile(Long id) {
        AuthUser caller = CurrentUser.get();

        if (!caller.isAdmin() && !caller.userId().equals(id)) {
            throw new AccessDeniedException("You can only view your own profile");
        }

        User user = getUserById(id);

        List<ProfileProject> projects = projectRepository.findManagedOrMemberOf(id).stream()
                .map(project -> new ProfileProject(
                        project.getId(),
                        project.getName(),
                        project.getCode(),
                        project.getStatus(),
                        project.getPriority(),
                        project.getStartDate(),
                        project.getEndDate()))
                .toList();

        List<ProfileTeam> teams = teamMemberRepository.findByUserId(id).stream()
                .map(member -> {
                    Team team = member.getTeam();
                    Project project = team.getProject();
                    return new ProfileTeam(
                            team.getId(),
                            team.getName(),
                            team.getTeamCode(),
                            member.getTeamRole(),
                            project == null ? null : project.getId(),
                            project == null ? null : project.getName(),
                            project == null ? null : project.getCode());
                })
                .toList();

        List<ProfileTask> tasks = taskRepository.findByAssigneeId(id).stream()
                .sorted(Comparator.comparing(Task::getId))
                .map(task -> new ProfileTask(
                        task.getId(),
                        task.getTaskKey(),
                        task.getTitle(),
                        task.getBoardStatus().getLabel(),
                        task.getProject().getName(),
                        task.getPriority(),
                        task.getDueDate()))
                .toList();

        return new ProfileResponse(
                user.getId(),
                user.getUserCode(),
                user.getFullName(),
                user.getEmail(),
                user.getContactNumber(),
                user.getSkill() == null ? null : user.getSkill().getLabel(),
                user.getRole().name(),
                user.getRole().getLabel(),
                user.isActive(),
                user.getAvailabilityStatus(),
                user.getCreatedAt(),
                projects,
                teams,
                tasks);
    }

    // ------------------------------------------------------------------ helpers

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + id));
    }
}