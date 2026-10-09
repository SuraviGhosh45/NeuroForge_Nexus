package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.CalendarDtos.CreateEventRequest;
import com.neuroforge.backend.dto.CalendarDtos.EventResponse;
import com.neuroforge.backend.dto.CalendarDtos.RescheduleRequest;
import com.neuroforge.backend.dto.CalendarDtos.StatusRequest;
import com.neuroforge.backend.entity.CalendarEvent;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.Subtask;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.repository.CalendarEventRepository;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.SprintRepository;
import com.neuroforge.backend.repository.SubtaskRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.UserRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final CalendarEventRepository eventRepository;
    private final ProjectRepository projectRepository;
    private final AccessService accessService;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final SubtaskRepository subtaskRepository;
    private final UserRepository userRepository;

    /**
    * Personal events are private; project events and derived deadlines are scoped by AccessService.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getVisibleEvents() {

        AuthUser user = CurrentUser.get();

        List<EventResponse> result = new java.util.ArrayList<>();
        Set<Long> visibleProjectIds = visibleProjectIds(user);

        eventRepository.findByCreatedByAndProjectIdIsNull(user.userId())
            .forEach(event -> result.add(toResponse(event)));
        eventRepository.findByAssignedToAndProjectIdIsNull(user.userId())
            .forEach(event -> result.add(toResponse(event)));

        if (!visibleProjectIds.isEmpty()) {
            eventRepository.findByProjectIdIn(visibleProjectIds)
                .forEach(event -> result.add(toResponse(event)));
            addSystemEvents(result, visibleProjectIds);
        }

        return result.stream()
            .distinct()
            .sorted(Comparator.comparing(EventResponse::eventDate,
                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

        @Transactional(readOnly = true)
        public EventResponse getEvent(Long id) {
        AuthUser user = CurrentUser.get();
        CalendarEvent event = findEvent(id);
        assertCanView(user, event);
        return toResponse(event);
        }

    @Transactional(readOnly = true)
    public List<Project> getVisibleProjects() {
        return accessService.visibleProjects(CurrentUser.get());
    }

        @Transactional(readOnly = true)
        public List<EventResponse> getProjectEvents(Long projectId) {
        AuthUser user = CurrentUser.get();
        if (!visibleProjectIds(user).contains(projectId)) {
            throw new AccessDeniedException("You cannot view this project's calendar");
        }
        List<EventResponse> result = new java.util.ArrayList<>();
        eventRepository.findByProjectId(projectId).forEach(event -> result.add(toResponse(event)));
        addSystemEvents(result, Set.of(projectId));
        return result.stream()
            .sorted(Comparator.comparing(EventResponse::eventDate,
                Comparator.nullsLast(Comparator.naturalOrder())))
            .toList();
        }

    /**
     * Personal event (no project): any logged-in user.
     * Project event: only Admin / PM / Lead who manage that project.
     * createdBy always comes from the logged-in user.
     */
    public EventResponse createEvent(CreateEventRequest request) {

        AuthUser user = CurrentUser.get();

        return createEvent(request, "MANUAL");
    }

    public EventResponse createAiEvent(CreateEventRequest request) {
        return createEvent(request, "AI");
    }

    private EventResponse createEvent(CreateEventRequest request, String source) {
        AuthUser user = CurrentUser.get();
        Long projectId = validateLinks(request.projectId(), request.taskId(), request.sprintId(), request.subtaskId(), request.assignedTo());
        if (projectId != null) accessService.assertCanManage(user, getProject(projectId));

        CalendarEvent event = new CalendarEvent();
        applyRequest(event, request, projectId);
        event.setCreatedBy(user.userId());
        event.setSource(source);
        event.setStatus("PENDING");
        return toResponse(eventRepository.save(event));
    }

    public EventResponse updateEvent(Long id, CreateEventRequest request) {
        AuthUser user = CurrentUser.get();
        CalendarEvent event = findEvent(id);
        assertCanModify(user, event);
        Long projectId = validateLinks(request.projectId(), request.taskId(), request.sprintId(), request.subtaskId(), request.assignedTo());
        if (projectId != null) accessService.assertCanManage(user, getProject(projectId));
        applyRequest(event, request, projectId);
        return toResponse(eventRepository.save(event));
    }

    public EventResponse reschedule(Long id, RescheduleRequest request) {

        AuthUser user = CurrentUser.get();

        CalendarEvent event = findEvent(id);

        assertCanModify(user, event);

        event.setEventDate(request.eventDate());

        return toResponse(eventRepository.save(event));
    }

    public EventResponse updateStatus(Long id, StatusRequest request) {
        AuthUser user = CurrentUser.get();
        CalendarEvent event = findEvent(id);
        assertCanModify(user, event);
        String status = normalize(request.status());
        if (!Set.of("PENDING", "COMPLETED", "CANCELLED").contains(status)) {
            throw new IllegalArgumentException("Status must be PENDING, COMPLETED, or CANCELLED");
        }
        event.setStatus(status);
        return toResponse(eventRepository.save(event));
    }

    public void deleteEvent(Long id) {

        AuthUser user = CurrentUser.get();

        CalendarEvent event = findEvent(id);

        assertCanModify(user, event);

        eventRepository.delete(event);
    }

    /** The event creator, or a manager who still has access to the linked project. */
    private void assertCanModify(AuthUser user, CalendarEvent event) {
        assertCanView(user, event);
        if (user.userId().equals(event.getCreatedBy())) return;
        if (event.getProjectId() != null && accessService.canManage(user, getProject(event.getProjectId()))) return;
        throw new AccessDeniedException("You cannot change this calendar event");
    }

    private void assertCanView(AuthUser user, CalendarEvent event) {
        if (event.getProjectId() == null) {
            if (user.userId().equals(event.getCreatedBy()) || user.userId().equals(event.getAssignedTo())) return;
        } else if (visibleProjectIds(user).contains(event.getProjectId())) {
            return;
        }
        throw new AccessDeniedException("You cannot view this calendar event");
    }

    private Set<Long> visibleProjectIds(AuthUser user) {
        return accessService.visibleProjects(user).stream()
                .map(Project::getId)
                .collect(java.util.stream.Collectors.toCollection(HashSet::new));
    }

    private void applyRequest(CalendarEvent event, CreateEventRequest request, Long projectId) {
        String type = normalize(request.type());
        if (!Set.of("DEADLINE", "MILESTONE", "MEETING", "REMINDER", "RELEASE", "OTHER").contains(type)) {
            throw new IllegalArgumentException("Unsupported calendar event type");
        }
        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setEventDate(request.eventDate());
        event.setType(type);
        event.setProjectId(projectId);
        event.setTaskId(request.taskId());
        event.setSprintId(request.sprintId());
        event.setSubtaskId(request.subtaskId());
        event.setAssignedTo(request.assignedTo());
        event.setPriority(request.priority() == null || request.priority().isBlank() ? "Medium" : request.priority().trim());
    }

    private Long validateLinks(Long requestedProjectId, Long taskId, Long sprintId, Long subtaskId, Long assignedTo) {
        Long projectId = requestedProjectId;
        if (taskId != null) projectId = mergeProject(projectId, taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId)).getProject().getId());
        if (sprintId != null) projectId = mergeProject(projectId, sprintRepository.findById(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found: " + sprintId)).getProject().getId());
        if (subtaskId != null) projectId = mergeProject(projectId, subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new EntityNotFoundException("Subtask not found: " + subtaskId)).getTask().getProject().getId());
        if (assignedTo != null && !userRepository.existsById(assignedTo)) {
            throw new EntityNotFoundException("Assigned user not found: " + assignedTo);
        }
        if (assignedTo != null) {
            if (projectId == null && !assignedTo.equals(CurrentUser.get().userId())) {
                throw new AccessDeniedException("Personal events can only be assigned to yourself");
            }
            if (projectId != null && !accessService.isMember(getProject(projectId), assignedTo)) {
                throw new AccessDeniedException("The assigned user is not a member of this project");
            }
        }
        return projectId;
    }

    private Long mergeProject(Long requestedProjectId, Long linkedProjectId) {
        if (requestedProjectId != null && !requestedProjectId.equals(linkedProjectId)) {
            throw new IllegalArgumentException("Linked item does not belong to the selected project");
        }
        return linkedProjectId;
    }

    private void addSystemEvents(List<EventResponse> result, Set<Long> projectIds) {
        for (Task task : taskRepository.findByProjectIdIn(projectIds)) {
            if (task.getDueDate() != null) {
                result.add(systemEvent("Task deadline: " + task.getTitle(), task.getDueDate(), "DEADLINE",
                        task.getPriority(), task.getStatus(), task.getProject().getId(), task.getId(),
                        task.getSprint() == null ? null : task.getSprint().getId(), null,
                        task.getAssignee() == null ? null : task.getAssignee().getId()));
            }
        }
        for (Subtask subtask : subtaskRepository.findAll()) {
            Task task = subtask.getTask();
            if (subtask.getDueDate() != null && projectIds.contains(task.getProject().getId())) {
                result.add(systemEvent("Subtask deadline: " + subtask.getTitle(), subtask.getDueDate(), "DEADLINE",
                        subtask.getPriority(), subtask.getStatus(), task.getProject().getId(), task.getId(),
                        task.getSprint() == null ? null : task.getSprint().getId(), subtask.getId(),
                        subtask.getAssignee() == null ? null : subtask.getAssignee().getId()));
            }
        }
        for (Sprint sprint : sprintRepository.findAll()) {
            if (!projectIds.contains(sprint.getProject().getId())) continue;
            if (sprint.getStartDate() != null) {
                result.add(systemEvent("Sprint start: " + sprint.getName(), sprint.getStartDate(), "MILESTONE",
                        "Medium", "PENDING", sprint.getProject().getId(), null, sprint.getId(), null, null));
            }
            if (sprint.getEndDate() != null) {
                result.add(systemEvent("Sprint end: " + sprint.getName(), sprint.getEndDate(), "DEADLINE",
                        "Medium", sprint.getStatus().name().equals("COMPLETED") ? "COMPLETED" : "PENDING",
                        sprint.getProject().getId(), null, sprint.getId(), null, null));
            }
        }
    }

    private EventResponse systemEvent(String title, LocalDate date, String type, String priority, String rawStatus,
            Long projectId, Long taskId, Long sprintId, Long subtaskId, Long assignedTo) {
        String status = rawStatus != null && Set.of("DONE", "COMPLETED").contains(normalize(rawStatus))
                ? "COMPLETED" : "PENDING";
        LocalDateTime eventDate = date.atStartOfDay();
        return new EventResponse(null, title, null, eventDate, type, projectId, taskId, sprintId, subtaskId,
            assignedTo, priority, calculatedStatus(status, eventDate), "SYSTEM", null, null, null, false);
    }

    private String calculatedStatus(String status, LocalDateTime eventDate) {
        boolean pastDue = eventDate.toLocalTime().equals(java.time.LocalTime.MIDNIGHT)
            ? eventDate.toLocalDate().isBefore(LocalDate.now())
            : eventDate.isBefore(LocalDateTime.now());
        return "PENDING".equals(status) && pastDue ? "OVERDUE" : status;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(java.util.Locale.ROOT);
    }

    private Project getProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found: " + projectId));
    }

    private CalendarEvent findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Calendar event not found: " + id));
    }

    private EventResponse toResponse(CalendarEvent e) {
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getEventDate(),
                e.getType(),
                e.getProjectId(),
                e.getTaskId(),
                e.getSprintId(),
                e.getSubtaskId(),
                e.getAssignedTo(),
                e.getPriority(),
                calculatedStatus(e.getStatus(), e.getEventDate()),
                e.getSource(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                canModify(CurrentUser.get(), e)
        );
    }

    private boolean canModify(AuthUser user, CalendarEvent event) {
        if (event.getProjectId() == null) {
            return user.userId().equals(event.getCreatedBy());
        }
        return user.userId().equals(event.getCreatedBy())
                || accessService.canManage(user, getProject(event.getProjectId()));
    }
}