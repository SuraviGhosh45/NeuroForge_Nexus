package com.neuroforge.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.neuroforge.backend.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    long countByStatus(String status);

    boolean existsByProjectKeyIgnoreCase(String projectKey);
}