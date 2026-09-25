package com.neuroforge.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.neuroforge.backend.entity.Subtask;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTaskIdOrderByIdAsc(Long taskId);
    List<Subtask> findByAssigneeIdOrderByDueDateAscIdAsc(Long userId);
    void deleteByTaskId(Long taskId);

    @Modifying
    @Query("UPDATE Subtask s SET s.assignee = null WHERE s.assignee.id = :userId")
    void unassignUser(@Param("userId") Long userId);
}
