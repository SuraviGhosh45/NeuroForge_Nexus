package com.neuroforge.backend.controller;

import com.neuroforge.backend.dto.DashboardSummary;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.TeamRepository;
import com.neuroforge.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        long totalProjects = projectRepository.count();
        long totalTeams = teamRepository.count();
        long totalUsers = userRepository.count();
        long inProgress = projectRepository.countByStatus("In Progress");
        long completed = projectRepository.countByStatus("Completed");

        return ResponseEntity.ok(new DashboardSummary(totalProjects, totalTeams, totalUsers, inProgress, completed));
    }
}