package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Collection;
import java.util.Optional;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {

    Optional<BugReport> findByBugKey(String bugKey);

    boolean existsByBugKey(String bugKey);

    List<BugReport> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<BugReport> findByProjectIdInOrderByCreatedAtDesc(Collection<Long> projectIds);

    List<BugReport> findByReportedByOrderByCreatedAtDesc(Long reportedBy);

    List<BugReport> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);

    List<BugReport> findByStatusOrderByCreatedAtDesc(String status);

    List<BugReport> findByPriorityOrderByCreatedAtDesc(String priority);

    List<BugReport> findBySeverityOrderByCreatedAtDesc(String severity);
}