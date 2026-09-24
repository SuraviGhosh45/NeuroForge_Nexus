package com.neuroforge.backend.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.SubtaskDtos.SubtaskResponse;
import com.neuroforge.backend.dto.SubtaskRequest;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.Subtask;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.Team;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.SubtaskRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.TeamRepository;
import com.neuroforge.backend.repository.UserRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubtaskService {
    private static final List<String> STATUSES = List.of("To Do", "In Progress", "Done");
    private static final List<String> PRIORITIES = List.of("Low", "Medium", "High", "Critical");

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final AccessService access;

    @Transactional(readOnly = true)
    public List<SubtaskResponse> listByTask(Long taskId) {
        AuthUser caller = CurrentUser.get();
        Task task = getTask(taskId);
        access.assertCanView(caller, task.getProject());
        return subtaskRepository.findByTaskIdOrderByIdAsc(taskId).stream()
                .filter(s -> canViewSubtask(caller, s))
                .map(SubtaskResponse::from)
                .toList();
    }

    @Transactional
    public SubtaskResponse create(Long taskId, SubtaskRequest request) {
        AuthUser caller = CurrentUser.get();
        Task task = getTask(taskId);
        requireManager(caller, task.getProject());
        validate(request);

        Subtask subtask = new Subtask();
        subtask.setTask(task);
        apply(subtask, request, task.getProject());
        return SubtaskResponse.from(subtaskRepository.save(subtask));
    }

    @Transactional
    public SubtaskResponse update(Long id, SubtaskRequest request) {
        AuthUser caller = CurrentUser.get();
        Subtask subtask = get(id);
        Project project = subtask.getTask().getProject();
        if (!canManage(caller, project, subtask)) {
            throw new AccessDeniedException("You do not have permission to edit this subtask");
        }
        validate(request);
        apply(subtask, request, project);
        return SubtaskResponse.from(subtaskRepository.save(subtask));
    }

    @Transactional
    public void delete(Long id) {
        AuthUser caller = CurrentUser.get();
        Subtask subtask = get(id);
        if (!canDelete(caller, subtask)) {
            throw new AccessDeniedException("You do not have permission to delete this subtask");
        }
        subtaskRepository.delete(subtask);
    }

    @Transactional
    public SubtaskResponse updateStatus(Long id, String status) {
        AuthUser caller = CurrentUser.get();
        Subtask subtask = get(id);
        if (!STATUSES.contains(status)) throw new IllegalArgumentException("Invalid subtask status");
        if (!canChangeStatus(caller, subtask)) {
            throw new AccessDeniedException("You can only update the status of subtasks within your scope");
        }
        subtask.setStatus(status);
        return SubtaskResponse.from(subtaskRepository.save(subtask));
    }

    private boolean canViewSubtask(AuthUser caller, Subtask subtask) {
        Project project = subtask.getTask().getProject();
        if (caller.isAdmin() || caller.isProjectManager() || caller.isProjectLead()) return access.canView(caller, project);
        if (caller.isTeamLead()) return access.canView(caller, project) && (subtask.getAssignee() == null || !caller.userId().equals(subtask.getAssignee().getId()) || access.isMember(project, caller.userId()));
        return subtask.getAssignee() != null && caller.userId().equals(subtask.getAssignee().getId());
    }

    private boolean canManage(AuthUser caller, Project project, Subtask subtask) {
        if (caller.isAdmin() || caller.isProjectManager() || caller.isProjectLead()) return access.canManage(caller, project);
        return caller.isTeamLead() && access.canManageProjectTeam(caller, project);
    }

    private boolean canDelete(AuthUser caller, Subtask subtask) {
        return canManage(caller, subtask.getTask().getProject(), subtask);
    }

    private boolean canChangeStatus(AuthUser caller, Subtask subtask) {
        if (caller.isAdmin() || caller.isProjectManager() || caller.isProjectLead()) return access.canView(caller, subtask.getTask().getProject());
        if (caller.isTeamLead()) return access.canView(caller, subtask.getTask().getProject());
        return subtask.getAssignee() != null && caller.userId().equals(subtask.getAssignee().getId());
    }

    private void requireManager(AuthUser caller, Project project) {
        if (!(caller.isAdmin() || caller.isProjectManager() || caller.isProjectLead() || (caller.isTeamLead() && access.canManageProjectTeam(caller, project)))) {
            throw new AccessDeniedException("You do not have permission to manage subtasks in this project");
        }
    }

    private void apply(Subtask subtask, SubtaskRequest request, Project project) {
        subtask.setTitle(request.getTitle().trim());
        subtask.setDescription(request.getDescription());
        subtask.setPriority(request.getPriority() == null || request.getPriority().isBlank() ? "Medium" : request.getPriority());
        if (!PRIORITIES.contains(subtask.getPriority())) throw new IllegalArgumentException("Invalid subtask priority");
        subtask.setStatus(request.getStatus() == null || request.getStatus().isBlank() ? "To Do" : request.getStatus());
        if (!STATUSES.contains(subtask.getStatus())) throw new IllegalArgumentException("Invalid subtask status");
        subtask.setDueDate(request.getDueDate());

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId()).orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
            if (!assignee.isActive() || !access.isMember(project, assignee.getId())) {
                throw new IllegalArgumentException("Subtask assignee must be an active project member");
            }
        }
        subtask.setAssignee(assignee);

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId()).orElseThrow(() -> new EntityNotFoundException("Team not found"));
            if (team.getProject() == null || !team.getProject().getId().equals(project.getId())) {
                throw new IllegalArgumentException("Subtask team must belong to the same project");
            }
        }
        subtask.setTeam(team);
    }

    private void validate(SubtaskRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Subtask title is required");
        }
    }

    private Task getTask(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Task not found with id " + id));
    }

    private Subtask get(Long id) {
        return subtaskRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Subtask not found with id " + id));
    }
}
