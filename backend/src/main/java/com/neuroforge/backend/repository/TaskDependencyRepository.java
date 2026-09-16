package com.neuroforge.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.neuroforge.backend.entity.TaskDependency;

public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {

	List<TaskDependency> findByTaskId(Long taskId);

	List<TaskDependency> findByTaskIdIn(Collection<Long> taskIds);

	List<TaskDependency> findByDependsOnId(Long dependsOnId);

	void deleteByDependsOnId(Long dependsOnId);

	boolean existsByTaskIdAndDependsOnId(Long taskId, Long dependsOnId);

	Optional<TaskDependency> findByTaskIdAndDependsOnId(Long taskId, Long dependsOnId);

	void deleteByTaskId(Long taskId);
}
