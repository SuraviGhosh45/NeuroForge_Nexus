package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * POST / PUT /api/projects.
 * There is NO status field: status is calculated by the backend from the project's tasks.
 * priority is optional; when omitted on create the backend derives it from the date range.
 */
public class ProjectRequest {

    private String name;
    private String description;
    /** The user-facing Project ID (e.g. WRD001). */
    private String code;
    private Long projectManagerId;
    /** User ids of the project members. null on update = leave members unchanged. */
    private List<Long> memberIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private String priority;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Long getProjectManagerId() { return projectManagerId; }
    public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }

    public List<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
