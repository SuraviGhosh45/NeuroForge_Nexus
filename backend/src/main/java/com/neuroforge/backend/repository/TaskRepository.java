package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    long countByStatus(String status);

    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByProjectId(Long projectId);
}