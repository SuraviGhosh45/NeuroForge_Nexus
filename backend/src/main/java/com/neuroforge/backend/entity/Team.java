package com.neuroforge.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** The user-facing "Team ID" (e.g. TEAM-01). Unique. */
    @Column(name = "team_code", unique = true, length = 30)
    private String teamCode;

    /**
     * The project this team belongs to. Required by the API; the column is nullable only so that
     * teams created before this change still load.
     */
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Team() {}

    // ---- getters & setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTeamCode() { return teamCode; }
    public void setTeamCode(String teamCode) { this.teamCode = teamCode; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
