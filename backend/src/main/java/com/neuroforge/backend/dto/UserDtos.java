package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;

import jakarta.validation.constraints.NotNull;

/** Request/response shapes for the Users module. Entities are never returned directly. */
public final class UserDtos {

    private UserDtos() {}

    static String skillLabel(User user) {
        return user.getSkill() == null ? null : user.getSkill().getLabel();
    }

    /** One row of the Users table (Admin only). */
    public record UserResponse(
            Long id,
            String userCode,
            String fullName,
            String email,
            String contactNumber,
            String skill,
            String role,
            String roleLabel,
            boolean active,
            String status,
            LocalDateTime createdAt) {

        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getUserCode(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getContactNumber(),
                    skillLabel(user),
                    user.getRole().name(),
                    user.getRole().getLabel(),
                    user.isActive(),
                    user.isActive() ? "Active" : "Inactive",
                    user.getCreatedAt());
        }
    }

    /**
     * Lightweight entry for dropdowns (Admin/PM): no email, no phone.
     * displayName is ready to show, e.g. "Peter (Backend Developer)".
     */
    public record UserOption(
            Long id,
            String userCode,
            String fullName,
            String skill,
            String role,
            String displayName) {

        public static UserOption from(User user) {
            String skill = skillLabel(user);
            return new UserOption(
                    user.getId(),
                    user.getUserCode(),
                    user.getFullName(),
                    skill,
                    user.getRole().name(),
                    skill == null ? user.getFullName() : user.getFullName() + " (" + skill + ")");
        }
    }

    /** PATCH /api/users/{id}/role */
    public record RoleUpdateRequest(@NotNull Role role) {}

    /** PATCH /api/users/{id}/status */
    public record StatusUpdateRequest(@NotNull Boolean active) {}

    // ------------------------------------------------------------------ profile

    public record ProfileProject(Long id, String name, String code, String status, String priority,
                                 LocalDate startDate, LocalDate endDate) {}

    public record ProfileTeam(Long id, String name, String teamCode, String teamRole,
                              Long projectId, String projectName, String projectCode) {}

    public record ProfileTask(Long id, String taskKey, String title, String status, String projectName,
                              String priority, LocalDate dueDate) {}

    /** GET /api/users/{id}/profile - everything the profile page needs in a single call. */
    public record ProfileResponse(
            Long id,
            String userCode,
            String fullName,
            String email,
            String contactNumber,
            String skill,
            String role,
            String roleLabel,
            boolean active,
            String status,
            LocalDateTime createdAt,
            List<ProfileProject> projects,
            List<ProfileTeam> teams,
            List<ProfileTask> assignedTasks) {}
}
