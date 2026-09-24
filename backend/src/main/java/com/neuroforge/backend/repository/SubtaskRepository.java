package com.neuroforge.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.neuroforge.backend.entity.Subtask;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTaskIdOrderByIdAsc(Long taskId);
    List<Subtask> findByAssigneeIdOrderByDueDateAscIdAsc(Long userId);
    void deleteByTaskId(Long taskId);
}
