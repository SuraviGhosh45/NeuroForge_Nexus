package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.CalendarDtos.CreateEventRequest;
import com.neuroforge.backend.dto.CalendarDtos.EventResponse;
import com.neuroforge.backend.dto.CalendarDtos.RescheduleRequest;
import com.neuroforge.backend.entity.CalendarEvent;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.repository.CalendarEventRepository;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final CalendarEventRepository eventRepository;
    private final ProjectRepository projectRepository;
    private final AccessService accessService;

    /**
     * Admin: all events.
     * Others: own events + events of projects they can view.
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getVisibleEvents() {

        AuthUser user = CurrentUser.get();

        Map<Long, CalendarEvent> result = new LinkedHashMap<>();

        if (user.role() == Role.ADMIN) {
            eventRepository.findAll().forEach(e -> result.put(e.getId(), e));
        } else {
            eventRepository.findByCreatedBy(user.userId())
                    .forEach(e -> result.put(e.getId(), e));

            for (Project project : accessService.visibleProjects(user)) {
                eventRepository.findByProjectId(project.getId())
                        .forEach(e -> result.put(e.getId(), e));
            }
        }

        return result.values().stream()
                .sorted(Comparator.comparing(CalendarEvent::getEventDate))
                .map(this::toResponse)
                .toList();
    }

    /**
     * Personal event (no project): any logged-in user.
     * Project event: only Admin / PM / Lead who manage that project.
     * createdBy always comes from the logged-in user.
     */
    public EventResponse createEvent(CreateEventRequest request) {

        AuthUser user = CurrentUser.get();

        if (request.projectId() != null) {
            Project project = getProject(request.projectId());
            accessService.assertCanManage(user, project);
        }

        CalendarEvent event = new CalendarEvent();
        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setEventDate(request.dueDate());
        event.setProjectId(request.projectId());
        event.setPriority(request.priority() == null ? "Medium" : request.priority().trim());
        event.setCreatedBy(user.userId());

        return toResponse(eventRepository.save(event));
    }

    public EventResponse reschedule(Long id, RescheduleRequest request) {

        AuthUser user = CurrentUser.get();

        CalendarEvent event = getEvent(id);

        assertCanModify(user, event);

        event.setEventDate(request.dueDate());

        return toResponse(eventRepository.save(event));
    }

    public void deleteEvent(Long id) {

        AuthUser user = CurrentUser.get();

        CalendarEvent event = getEvent(id);

        assertCanModify(user, event);

        eventRepository.delete(event);
    }

    /** Creator, Admin, or a manager of the event's project. */
    private void assertCanModify(AuthUser user, CalendarEvent event) {

        if (user.role() == Role.ADMIN) {
            return;
        }

        if (user.userId().equals(event.getCreatedBy())) {
            return;
        }

        if (event.getProjectId() != null) {
            Project project = getProject(event.getProjectId());
            if (accessService.canManage(user, project)) {
                return;
            }
        }

        throw new AccessDeniedException("You cannot change this calendar event");
    }

    private Project getProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found: " + projectId));
    }

    private CalendarEvent getEvent(Long id) {
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
                e.getProjectId(),
                e.getPriority(),
                e.getCreatedBy(),
                e.getCreatedAt()
        );
    }
}