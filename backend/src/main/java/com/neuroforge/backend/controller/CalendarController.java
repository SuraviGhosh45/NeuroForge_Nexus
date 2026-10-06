package com.neuroforge.backend.controller;

import com.neuroforge.backend.dto.CalendarDtos.CreateEventRequest;
import com.neuroforge.backend.dto.CalendarDtos.EventResponse;
import com.neuroforge.backend.dto.CalendarDtos.RescheduleRequest;
import com.neuroforge.backend.dto.CalendarDtos.StatusRequest;
import com.neuroforge.backend.service.CalendarService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents() {
        return ResponseEntity.ok(calendarService.getVisibleEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(calendarService.getEvent(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EventResponse>> getProjectEvents(@PathVariable Long projectId) {
        return ResponseEntity.ok(calendarService.getProjectEvents(projectId));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(calendarService.createEvent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CreateEventRequest request
    ) {
        return ResponseEntity.ok(calendarService.updateEvent(id, request));
    }

    @PatchMapping("/{id}/date")
    public ResponseEntity<EventResponse> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request
    ) {
        return ResponseEntity.ok(calendarService.reschedule(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EventResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest request
    ) {
        return ResponseEntity.ok(calendarService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}