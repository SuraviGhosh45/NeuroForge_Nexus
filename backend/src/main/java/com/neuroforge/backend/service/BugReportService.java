package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.BugReportDtos.BugReportResponse;
import com.neuroforge.backend.dto.BugReportDtos.CreateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateAssignmentRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateStatusRequest;
import com.neuroforge.backend.entity.BugReport;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.repository.BugReportRepository;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BugReportService {

    private final BugReportRepository bugReportRepository;
    private final ProjectRepository projectRepository;
    private final AccessService accessService;

    /**
     * Get all bugs visible to the current authenticated user.
     */
    @Transactional(readOnly = true)
    public List<BugReportResponse> getVisibleBugs() {

        AuthUser user = CurrentUser.get();

        List<Project> visibleProjects =
                accessService.visibleProjects(user);

        if (visibleProjects.isEmpty()) {
            return List.of();
        }

        return visibleProjects.stream()
                .flatMap(project ->
                        bugReportRepository
                                .findByProjectIdOrderByCreatedAtDesc(
                                        project.getId()
                                )
                                .stream()
                )
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get all bugs belonging to one project.
     */
    @Transactional(readOnly = true)
    public List<BugReportResponse> getProjectBugs(Long projectId) {

        AuthUser user = CurrentUser.get();

        Project project = getProject(projectId);

        accessService.assertCanView(user, project);

        return bugReportRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get one bug.
     */
    @Transactional(readOnly = true)
    public BugReportResponse getBug(Long id) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project = getProject(bug.getProjectId());

        accessService.assertCanView(user, project);

        return toResponse(bug);
    }

    /**
     * Create a new bug.
     *
     * reportedBy is ALWAYS taken from the authenticated user.
     * The frontend cannot choose this value.
     */
    public BugReportResponse createBug(CreateBugRequest request) {

        AuthUser user = CurrentUser.get();

        Project project = getProject(request.projectId());

        accessService.assertCanView(user, project);

        validateAssignment(
                request.assignedTo(),
                project
        );

        BugReport bug = new BugReport();

        bug.setBugKey(generateBugKey());
        bug.setTitle(request.title().trim());
        bug.setDescription(request.description().trim());
        bug.setProjectId(project.getId());
        bug.setModule(request.module().trim());
        bug.setEnvironment(request.environment().trim());
        bug.setSeverity(request.severity().trim());
        bug.setPriority(request.priority().trim());
        bug.setStatus("New");

        /*
         * IMPORTANT:
         * Never take reportedBy from the frontend.
         */
        bug.setReportedBy(user.userId());

        bug.setAssignedTo(request.assignedTo());
        bug.setAttachments(request.attachments());

        BugReport saved =
                bugReportRepository.save(bug);

        return toResponse(saved);
    }

    /**
     * Update bug information.
     */
    public BugReportResponse updateBug(
            Long id,
            UpdateBugRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project =
                getProject(bug.getProjectId());

        /*
         * Updating the bug itself is a project-management operation.
         */
        accessService.assertCanManage(
                user,
                project
        );

        validateAssignment(
                request.assignedTo(),
                project
        );

        bug.setTitle(request.title().trim());
        bug.setDescription(request.description().trim());
        bug.setModule(request.module().trim());
        bug.setEnvironment(request.environment().trim());
        bug.setSeverity(request.severity().trim());
        bug.setPriority(request.priority().trim());
        bug.setAssignedTo(request.assignedTo());
        bug.setAttachments(request.attachments());

        return toResponse(
                bugReportRepository.save(bug)
        );
    }

    /**
     * Update bug status.
     */
    public BugReportResponse updateStatus(
            Long id,
            UpdateStatusRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project =
                getProject(bug.getProjectId());

        accessService.assertCanManage(
                user,
                project
        );

        bug.setStatus(request.status().trim());

        if (request.retestResult() != null) {
            bug.setRetestResult(
                    request.retestResult().trim()
            );
        }

        return toResponse(
                bugReportRepository.save(bug)
        );
    }

    /**
     * Assign or reassign a bug.
     */
    public BugReportResponse updateAssignment(
            Long id,
            UpdateAssignmentRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project =
                getProject(bug.getProjectId());

        accessService.assertCanManage(
                user,
                project
        );

        validateAssignment(
                request.assignedTo(),
                project
        );

        bug.setAssignedTo(
                request.assignedTo()
        );

        return toResponse(
                bugReportRepository.save(bug)
        );
    }

    /**
     * Delete a bug.
     */
    public void deleteBug(Long id) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project =
                getProject(bug.getProjectId());

        accessService.assertCanManage(
                user,
                project
        );

        bugReportRepository.delete(bug);
    }

    /**
     * Make sure the assigned user belongs to the project.
     */
    private void validateAssignment(
            Long assignedTo,
            Project project
    ) {

        if (assignedTo == null) {
            return;
        }

        if (!accessService.isMember(
                project,
                assignedTo
        )) {
            throw new AccessDeniedException(
                    "The assigned user is not a member of this project"
            );
        }
    }

    /**
     * Generate a readable bug key.
     *
     * Example:
     * BUG-1
     * BUG-2
     * BUG-3
     */
    private String generateBugKey() {

        long nextId =
                bugReportRepository.count() + 1;

        String bugKey =
                "BUG-" + nextId;

        /*
         * Protect against gaps/collisions after deletions.
         */
        while (
                bugReportRepository
                        .existsByBugKey(bugKey)
        ) {
            nextId++;
            bugKey = "BUG-" + nextId;
        }

        return bugKey;
    }

    private Project getProject(Long projectId) {

        return projectRepository
                .findById(projectId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Project not found: " + projectId
                        )
                );
    }

    private BugReport getBugEntity(Long id) {

        return bugReportRepository
                .findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Bug report not found: " + id
                        )
                );
    }

    private BugReportResponse toResponse(
            BugReport bug
    ) {

        return new BugReportResponse(
                bug.getId(),
                bug.getBugKey(),
                bug.getTitle(),
                bug.getDescription(),
                bug.getProjectId(),
                bug.getModule(),
                bug.getEnvironment(),
                bug.getSeverity(),
                bug.getPriority(),
                bug.getStatus(),
                bug.getReportedBy(),
                bug.getAssignedTo(),
                bug.getCreatedAt(),
                bug.getUpdatedAt(),
                bug.getAttachments(),
                bug.getRetestResult()
        );
    }
}