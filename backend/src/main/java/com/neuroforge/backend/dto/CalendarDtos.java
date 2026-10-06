package com.neuroforge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class CalendarDtos {

    private CalendarDtos() {
    }

    public record CreateEventRequest(

            @NotBlank(message = "Title is required")
            @Size(max = 255, message = "Title cannot exceed 255 characters")
            String title,

            @Size(max = 2000, message = "Description cannot exceed 2000 characters")
            String description,

            @NotNull(message = "Date is required")
            LocalDateTime eventDate,

            @NotBlank(message = "Event type is required")
            String type,

            Long projectId,

            Long taskId,

            Long sprintId,

            Long subtaskId,

            Long assignedTo,

            @Size(max = 20, message = "Priority cannot exceed 20 characters")
            String priority
    ) {
    }

    public record RescheduleRequest(

            @NotNull(message = "Event date is required")
            LocalDateTime eventDate
    ) {
    }

    public record StatusRequest(

            @NotBlank(message = "Status is required")
            String status
    ) {
    }

    public record EventResponse(
            Long id,
            String title,
            String description,
                        LocalDateTime eventDate,
                        String type,
            Long projectId,
                        Long taskId,
                        Long sprintId,
                        Long subtaskId,
                        Long assignedTo,
            String priority,
                        String status,
                        String source,
            Long createdBy,
                        LocalDateTime createdAt,
                            LocalDateTime updatedAt,
                            boolean editable
    ) {
    }
}