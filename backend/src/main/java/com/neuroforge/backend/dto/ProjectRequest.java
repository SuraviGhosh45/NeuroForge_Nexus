package com.neuroforge.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjectRequest {
    private String name;
    private String description;
    private String code;
    private Long projectManagerId;
    private Long projectLeadId;
    private Long teamId;
    private List<Long> memberIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private String priority;
    private String status;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Long getProjectManagerId() { return projectManagerId; }
    public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }
    public Long getProjectLeadId() { return projectLeadId; }
    public void setProjectLeadId(Long projectLeadId) { this.projectLeadId = projectLeadId; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public List<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
