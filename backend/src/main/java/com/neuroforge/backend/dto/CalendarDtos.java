package com.neuroforge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
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
            LocalDate dueDate,

            Long projectId,

            @Size(max = 20, message = "Priority cannot exceed 20 characters")
            String priority
    ) {
    }

    public record RescheduleRequest(

            @NotNull(message = "Date is required")
            LocalDate dueDate
    ) {
    }

    public record EventResponse(
            Long id,
            String title,
            String description,
            LocalDate dueDate,
            Long projectId,
            String priority,
            Long createdBy,
            LocalDateTime createdAt
    ) {
    }
}