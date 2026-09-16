package com.neuroforge.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    long countByStatus(String status);

    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByProjectId(Long projectId);

    List<Task> findBySprintIdOrderByBoardStatusAscBoardPositionAsc(Long sprintId);

    List<Task> findBySprintIdAndBoardStatusOrderByBoardPositionAsc(Long sprintId, BoardStatus status);

    List<Task> findByProjectIdAndSprintIsNullOrderByIdDesc(Long projectId);

    Optional<Task> findByTaskKey(String taskKey);

    @Query("select coalesce(sum(t.storyPoints), 0) from Task t " +
            "where t.sprint.id = :sprintId and t.boardStatus = :status")
    int sumPointsBySprintAndStatus(@Param("sprintId") Long sprintId,
                                   @Param("status") BoardStatus status);
}