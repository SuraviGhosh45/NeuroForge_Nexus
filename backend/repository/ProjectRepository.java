package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerId(Long ownerId);

    long countByStatus(ProjectStatus status);
}
