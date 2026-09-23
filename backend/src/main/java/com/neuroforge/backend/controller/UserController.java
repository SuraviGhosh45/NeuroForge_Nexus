package com.neuroforge.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.UpdateUserRequest;
import com.neuroforge.backend.dto.UserDtos.ProfileResponse;
import com.neuroforge.backend.dto.UserDtos.RoleUpdateRequest;
import com.neuroforge.backend.dto.UserDtos.StatusUpdateRequest;
import com.neuroforge.backend.dto.UserDtos.UserOption;
import com.neuroforge.backend.dto.UserDtos.UserResponse;
import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** Users page: Name, Email, Skill, Access Role, Status. Optional ?search= (name / email / user id). Admin only. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> list(@RequestParam(required = false) String search) {
        return userService.list(search);
    }

    /**
     * Dropdown data for Admin/PM (project manager picker, member multi-select, team members):
     * id, name and skill only - "Peter (Backend Developer)".
     * Optional ?roles=PROJECT_MANAGER,ADMIN filter (e.g. for the Project Manager dropdown).
     */
    @GetMapping("/options")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public List<UserOption> options(@RequestParam(required = false) List<Role> roles) {
        return userService.options(roles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse get(@PathVariable Long id) {
        return userService.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    /** Role dropdown on the Users page (Team Member -> Project Manager, ...). Admin only. */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse changeRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        return userService.changeRole(id, request.role());
    }

    /** Active / Inactive toggle. Admin only. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse changeStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return userService.setActive(id, request.active());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /** Single call for the profile page. Admin: any user. Everyone else: their own profile only (checked in the service). */
    @GetMapping("/{id}/profile")
    public ProfileResponse profile(@PathVariable Long id) {
        return userService.profile(id);
    }
}
