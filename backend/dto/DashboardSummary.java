package com.neuroforge.backend.dto;

public class DashboardSummary {

    private long totalProjects;
    private long totalTeams;
    private long totalUsers;
    private long projectsInProgress;
    private long projectsCompleted;

    public DashboardSummary(long totalProjects, long totalTeams, long totalUsers,
                             long projectsInProgress, long projectsCompleted) {
        this.totalProjects = totalProjects;
        this.totalTeams = totalTeams;
        this.totalUsers = totalUsers;
        this.projectsInProgress = projectsInProgress;
        this.projectsCompleted = projectsCompleted;
    }

    public long getTotalProjects() { return totalProjects; }
    public long getTotalTeams() { return totalTeams; }
    public long getTotalUsers() { return totalUsers; }
    public long getProjectsInProgress() { return projectsInProgress; }
    public long getProjectsCompleted() { return projectsCompleted; }
}
