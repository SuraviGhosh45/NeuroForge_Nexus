package com.neuroforge.backend.dto;

import java.util.List;

/**
 * POST / PUT /api/teams.
 * Create: projectId, name and teamCode are required; memberIds is the multi-select of user ids.
 * Update: only name / teamCode / description are applied (members have their own endpoints).
 */
public class TeamRequest {

    private Long projectId;
    private String name;
    /** The user-facing Team ID, e.g. "TEAM-01". */
    private String teamCode;
    private String description;
    private List<Long> memberIds;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTeamCode() { return teamCode; }
    public void setTeamCode(String teamCode) { this.teamCode = teamCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
}
