package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Collection;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByCreatedBy(Long createdBy);

    List<CalendarEvent> findByProjectId(Long projectId);

    List<CalendarEvent> findByProjectIdIn(Collection<Long> projectIds);

    List<CalendarEvent> findByCreatedByAndProjectIdIsNull(Long createdBy);

    List<CalendarEvent> findByAssignedToAndProjectIdIsNull(Long assignedTo);
}