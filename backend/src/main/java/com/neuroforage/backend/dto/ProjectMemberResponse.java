package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.ProjectMember;
import com.neuroforage.backend.model.ProjectMemberRole;

import java.time.Instant;

public record ProjectMemberResponse(
        Long userId, String name, String email, ProjectMemberRole role, Instant joinedAt
) {
    public static ProjectMemberResponse from(ProjectMember member) {
        return new ProjectMemberResponse(member.getUser().getId(), member.getUser().getName(),
                member.getUser().getEmail(), member.getRole(), member.getJoinedAt());
    }
}
