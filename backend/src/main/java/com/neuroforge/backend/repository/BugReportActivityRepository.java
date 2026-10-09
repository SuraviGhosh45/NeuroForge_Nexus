package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.BugReportActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugReportActivityRepository extends JpaRepository<BugReportActivity, Long> {
    List<BugReportActivity> findByBugIdOrderByCreatedAtAscIdAsc(Long bugId);
}
