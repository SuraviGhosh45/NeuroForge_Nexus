package com.neuroforage.backend.repository;

import com.neuroforage.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findDistinctByMembersUserId(Long userId);
}
