package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.ProjectRequest;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Team;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.TeamRepository;
import com.neuroforge.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    public Project createProject(ProjectRequest request) {
        Project project = new Project();
        applyRequest(project, request);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));
    }

    public Project updateProject(Long id, ProjectRequest request) {
        Project project = getProjectById(id);
        applyRequest(project, request);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    private void applyRequest(Project project, ProjectRequest request) {
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCode(request.getCode());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "Not Started");
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        if (request.getProjectLeadId() != null) {
            User lead = userRepository.findById(request.getProjectLeadId())
                    .orElseThrow(() -> new RuntimeException("Project Lead not found"));
            project.setProjectLead(lead);
        } else {
            project.setProjectLead(null);
        }

        if (request.getProjectManagerId() != null) {
            User manager = userRepository.findById(request.getProjectManagerId())
                    .orElseThrow(() -> new RuntimeException("Project Manager not found"));
            project.setProjectManager(manager);
        } else {
            project.setProjectManager(null);
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            project.setTeam(team);
        } else {
            project.setTeam(null);
        }
    }
}