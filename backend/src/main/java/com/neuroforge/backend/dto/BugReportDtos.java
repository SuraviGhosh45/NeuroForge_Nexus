package com.neuroforge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class BugReportDtos {

    private BugReportDtos() {
    }

    public record CreateBugRequest(

            @NotBlank(message = "Title is required")
            @Size(max = 255, message = "Title cannot exceed 255 characters")
            String title,

            @NotBlank(message = "Description is required")
            String description,

            @NotNull(message = "Project is required")
            Long projectId,

            @NotBlank(message = "Module is required")
            @Size(max = 255, message = "Module cannot exceed 255 characters")
            String module,

            @NotBlank(message = "Environment is required")
            @Size(max = 50, message = "Environment cannot exceed 50 characters")
            String environment,

            @NotBlank(message = "Severity is required")
            @Size(max = 20, message = "Severity cannot exceed 20 characters")
            String severity,

            @NotBlank(message = "Priority is required")
            @Size(max = 20, message = "Priority cannot exceed 20 characters")
            String priority,

            Long assignedTo,

            String attachments
    ) {
    }

    public record UpdateBugRequest(

            @NotBlank(message = "Title is required")
            @Size(max = 255, message = "Title cannot exceed 255 characters")
            String title,

            @NotBlank(message = "Description is required")
            String description,

            @NotBlank(message = "Module is required")
            @Size(max = 255, message = "Module cannot exceed 255 characters")
            String module,

            @NotBlank(message = "Environment is required")
            @Size(max = 50, message = "Environment cannot exceed 50 characters")
            String environment,

            @NotBlank(message = "Severity is required")
            @Size(max = 20, message = "Severity cannot exceed 20 characters")
            String severity,

            @NotBlank(message = "Priority is required")
            @Size(max = 20, message = "Priority cannot exceed 20 characters")
            String priority,

            Long assignedTo,

            String attachments
    ) {
    }

    public record UpdateStatusRequest(

            @NotBlank(message = "Status is required")
            @Size(max = 30, message = "Status cannot exceed 30 characters")
            String status,

            String retestResult
    ) {
    }

    public record UpdateAssignmentRequest(
            Long assignedTo
    ) {
    }

    public record BugReportResponse(
            Long id,
            String bugKey,
            String title,
            String description,
            Long projectId,
            String module,
            String environment,
            String severity,
            String priority,
            String status,
            Long reportedBy,
            Long assignedTo,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String attachments,
            String retestResult
    ) {
    }
}