package com.neuroforge.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

import com.neuroforge.backend.entity.Sprint;
import com.neuroforge.backend.entity.SprintStatus;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

	List<Sprint> findByProjectIdOrderByStartDateDesc(Long projectId);
	List<Sprint> findByProject_IdIn(Collection<Long> projectIds);

	Optional<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

	List<Sprint> findTop3ByProjectIdAndStatusOrderByEndDateDesc(Long projectId, SprintStatus status);

	boolean existsByProjectIdAndNameIgnoreCase(Long projectId, String name);
}
