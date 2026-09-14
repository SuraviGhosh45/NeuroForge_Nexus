package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    long countByStatus(String status);
}