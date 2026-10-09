package com.neuroforge.backend.repository;

import com.neuroforge.backend.entity.BugReportComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugReportCommentRepository extends JpaRepository<BugReportComment, Long> {
    List<BugReportComment> findByBugIdOrderByCreatedAtAscIdAsc(Long bugId);
}
