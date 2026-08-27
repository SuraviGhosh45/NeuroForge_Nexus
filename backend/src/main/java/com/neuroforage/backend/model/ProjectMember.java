package com.neuroforage.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(name = "project_members", uniqueConstraints = @UniqueConstraint(
        name = "uk_project_member_project_user",
        columnNames = {"project_id", "user_id"}
))
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectMemberRole role;

    @Column(nullable = false, updatable = false)
    private Instant joinedAt;

    protected ProjectMember() {
    }

    public ProjectMember(Project project, User user, ProjectMemberRole role) {
        this.project = project;
        this.user = user;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Project getProject() { return project; }
    public User getUser() { return user; }
    public ProjectMemberRole getRole() { return role; }
    public Instant getJoinedAt() { return joinedAt; }
    public void setRole(ProjectMemberRole role) { this.role = role; }
}
