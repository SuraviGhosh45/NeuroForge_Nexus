package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.BugReportDtos.BugReportResponse;
import com.neuroforge.backend.dto.BugReportDtos.ActivityResponse;
import com.neuroforge.backend.dto.BugReportDtos.CommentResponse;
import com.neuroforge.backend.dto.BugReportDtos.CreateCommentRequest;
import com.neuroforge.backend.dto.BugReportDtos.CreateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateAssignmentRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateStatusRequest;
import com.neuroforge.backend.entity.BugReport;
import com.neuroforge.backend.entity.BugReportActivity;
import com.neuroforge.backend.entity.BugReportComment;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.BugReportActivityRepository;
import com.neuroforge.backend.repository.BugReportCommentRepository;
import com.neuroforge.backend.repository.BugReportRepository;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.UserRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class BugReportService {

    /*
     * Status groups used by role rules.
     * Values are normalized (lowercase, letters/digits only),
     * so "In Progress", "in_progress" and "inprogress" all match.
     * Adjust these if your frontend uses different status names.
     */
    private static final Set<String> DEV_STATUSES =
            Set.of("inprogress", "fixed", "resolved", "readyforretest", "readyfortesting");

    private static final Set<String> TESTER_STATUSES =
            Set.of("verified", "reopened", "closed", "retesting", "retest");

    private final BugReportRepository bugReportRepository;
    private final BugReportActivityRepository activityRepository;
    private final BugReportCommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AccessService accessService;

    // ------------------------------------------------------------------
    // READ
    // ------------------------------------------------------------------

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

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long id) {
        getBug(id);
        return commentRepository.findByBugIdOrderByCreatedAtAscIdAsc(id).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivity(Long id) {
        getBug(id);
        return activityRepository.findByBugIdOrderByCreatedAtAscIdAsc(id).stream()
                .map(this::toActivityResponse)
                .toList();
    }

    public CommentResponse addComment(Long id, CreateCommentRequest request) {
        BugReport bug = getBugEntity(id);
        Project project = getProject(bug.getProjectId());
        AuthUser caller = CurrentUser.get();
        accessService.assertCanView(caller, project);

        User author = userRepository.findById(caller.userId())
                .orElseThrow(() -> new EntityNotFoundException("Current user no longer exists"));
        BugReportComment comment = new BugReportComment();
        comment.setBugId(id);
        comment.setAuthorId(author.getId());
        comment.setAuthorName(author.getFullName());
        comment.setText(request.text().trim());
        BugReportComment saved = commentRepository.save(comment);
        logActivity(bug, "comment", "commented on this bug", null);
        return toCommentResponse(saved);
    }

    // ------------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------------

    /**
     * Create a new bug.
     *
     * Anyone who can view the project can report (Unassigned cannot view anything).
     * reportedBy is ALWAYS taken from the authenticated user.
     * Only users allowed to assign can set assignedTo at creation.
     */
    public BugReportResponse createBug(CreateBugRequest request) {

        AuthUser user = CurrentUser.get();

        Project project = getProject(request.projectId());

        accessService.assertCanView(user, project);

        Long assignedTo = canAssign(user, project)
                ? request.assignedTo()
                : null;

        validateAssignment(assignedTo, project);

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

        bug.setAssignedTo(assignedTo);
        bug.setAttachments(request.attachments());

        BugReport saved = bugReportRepository.save(bug);
        logActivity(saved, "created", "reported this bug", null);
        return toResponse(saved);
    }

    // ------------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------------

    /**
     * Update bug information.
     * Allowed: Admin / PM / Lead of the project, or the person who reported the bug.
     * Assignment is changed here only by users who are allowed to assign.
     */
    public BugReportResponse updateBug(
            Long id,
            UpdateBugRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project = getProject(bug.getProjectId());

        assertCanEdit(user, project, bug);

        bug.setTitle(request.title().trim());
        bug.setDescription(request.description().trim());
        bug.setModule(request.module().trim());
        bug.setEnvironment(request.environment().trim());
        bug.setSeverity(request.severity().trim());
        bug.setPriority(request.priority().trim());
        bug.setAttachments(request.attachments());

        // Assignment is untouched unless the user is allowed to assign.
        if (canAssign(user, project)) {
            validateAssignment(request.assignedTo(), project);
            bug.setAssignedTo(request.assignedTo());
        }

        BugReport saved = bugReportRepository.save(bug);
        logActivity(saved, "status", "updated the bug details", null);
        return toResponse(saved);
    }

    /**
     * Update bug status.
     * Managers: any status.
     * Developer/Team Member: fix statuses, only on bugs assigned to them.
     * Tester/QA: verify/close statuses, only inside their project.
     */
    public BugReportResponse updateStatus(
            Long id,
            UpdateStatusRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project = getProject(bug.getProjectId());

        assertCanChangeStatus(user, project, bug, request.status());

        String previousStatus = bug.getStatus();
        bug.setStatus(request.status().trim());

        if (request.retestResult() != null) {
            bug.setRetestResult(request.retestResult().trim());
        }

        BugReport saved = bugReportRepository.save(bug);
        String activityText = "moved this bug from " + previousStatus + " to " + saved.getStatus();
        String type = request.retestResult() == null ? "status" : "retest";
        logActivity(saved, type, activityText, request.retestResult());
        return toResponse(saved);
    }

    /**
     * Assign or reassign a bug.
     * Allowed: Admin / PM / Lead, or the Team Lead of that project.
     */
    public BugReportResponse updateAssignment(
            Long id,
            UpdateAssignmentRequest request
    ) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project = getProject(bug.getProjectId());

        assertCanAssign(user, project);

        validateAssignment(request.assignedTo(), project);

        bug.setAssignedTo(request.assignedTo());
        BugReport saved = bugReportRepository.save(bug);
        String assignee = request.assignedTo() == null
                ? "Unassigned"
                : userRepository.findById(request.assignedTo())
                        .map(User::getFullName)
                        .orElse("a project member");
        logActivity(saved, "status", "assigned this bug to " + assignee, null);
        return toResponse(saved);
    }

    // ------------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------------

    /**
     * Delete a bug. Admin / PM / Lead only.
     */
    public void deleteBug(Long id) {

        AuthUser user = CurrentUser.get();

        BugReport bug = getBugEntity(id);

        Project project = getProject(bug.getProjectId());

        accessService.assertCanManage(user, project);

        bugReportRepository.delete(bug);
    }

    // ------------------------------------------------------------------
    // PERMISSION HELPERS
    // ------------------------------------------------------------------

    private void assertCanEdit(AuthUser user, Project project, BugReport bug) {

        if (accessService.canManage(user, project)) {
            return;
        }

        if (user.role().isExecutionRole()
                && accessService.isMember(project, user.userId())
                && user.userId().equals(bug.getReportedBy())) {
            return;
        }

        throw new AccessDeniedException("You can edit only bugs you reported");
    }

    private boolean canAssign(AuthUser user, Project project) {

        if (accessService.canManage(user, project)) {
            return true;
        }

        return user.role() == Role.TEAM_LEAD
                && accessService.isTeamLead(project, user.userId());
    }

    private void assertCanAssign(AuthUser user, Project project) {

        if (!canAssign(user, project)) {
            throw new AccessDeniedException("You cannot assign bugs in this project");
        }
    }

    private void assertCanChangeStatus(
            AuthUser user,
            Project project,
            BugReport bug,
            String newStatus
    ) {

        if (accessService.canManage(user, project)) {
            return;
        }

        String status = normalize(newStatus);
        Role role = user.role();

        if ((role == Role.DEVELOPER || role == Role.TEAM_MEMBER)
                && user.userId().equals(bug.getAssignedTo())
                && DEV_STATUSES.contains(status)) {
            return;
        }

        if ((role == Role.TESTER || role == Role.QA)
                && accessService.isMember(project, user.userId())
                && TESTER_STATUSES.contains(status)) {
            return;
        }

        throw new AccessDeniedException("Your role cannot set this status");
    }

    private static String normalize(String value) {
        return value == null
                ? ""
                : value.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
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

        if (!accessService.isMember(project, assignedTo)) {
            throw new AccessDeniedException(
                    "The assigned user is not a member of this project"
            );
        }
    }

    // ------------------------------------------------------------------
    // INTERNAL HELPERS
    // ------------------------------------------------------------------

    /**
     * Generate a readable bug key: BUG-1, BUG-2, BUG-3 ...
     */
    private String generateBugKey() {

        long nextId = bugReportRepository.count() + 1;

        String bugKey = "BUG-" + nextId;

        // Protect against gaps/collisions after deletions.
        while (bugReportRepository.existsByBugKey(bugKey)) {
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

    private BugReportResponse toResponse(BugReport bug) {

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

    private void logActivity(BugReport bug, String type, String text, String result) {
        AuthUser caller = CurrentUser.get();
        User actor = userRepository.findById(caller.userId())
                .orElseThrow(() -> new EntityNotFoundException("Current user no longer exists"));
        BugReportActivity activity = new BugReportActivity();
        activity.setBugId(bug.getId());
        activity.setActorId(actor.getId());
        activity.setActorName(actor.getFullName());
        activity.setType(type);
        activity.setText(text);
        activity.setResult(result);
        activityRepository.save(activity);
    }

    private CommentResponse toCommentResponse(BugReportComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getAuthorId(),
                comment.getAuthorName(),
                comment.getText(),
                comment.getCreatedAt());
    }

    private ActivityResponse toActivityResponse(BugReportActivity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getType(),
                activity.getActorName(),
                activity.getText(),
                activity.getResult(),
                activity.getCreatedAt());
    }
}