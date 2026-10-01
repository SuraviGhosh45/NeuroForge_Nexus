package com.neuroforge.backend.controller;

import com.neuroforge.backend.dto.BugReportDtos.BugReportResponse;
import com.neuroforge.backend.dto.BugReportDtos.CreateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateAssignmentRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateBugRequest;
import com.neuroforge.backend.dto.BugReportDtos.UpdateStatusRequest;
import com.neuroforge.backend.service.BugReportService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
@RequiredArgsConstructor
public class BugReportController {

    private final BugReportService bugReportService;

    /**
     * Get all bugs visible to the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<BugReportResponse>> getBugs() {

        return ResponseEntity.ok(
                bugReportService.getVisibleBugs()
        );
    }

    /**
     * Get all bugs for one project.
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<BugReportResponse>> getProjectBugs(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                bugReportService.getProjectBugs(projectId)
        );
    }

    /**
     * Get one bug.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BugReportResponse> getBug(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bugReportService.getBug(id)
        );
    }

    /**
     * Create a bug.
     */
    @PostMapping
    public ResponseEntity<BugReportResponse> createBug(
            @Valid @RequestBody CreateBugRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        bugReportService.createBug(request)
                );
    }

    /**
     * Update bug information.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BugReportResponse> updateBug(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBugRequest request
    ) {

        return ResponseEntity.ok(
                bugReportService.updateBug(
                        id,
                        request
                )
        );
    }

    /**
     * Update bug status.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<BugReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {

        return ResponseEntity.ok(
                bugReportService.updateStatus(
                        id,
                        request
                )
        );
    }

    /**
     * Assign or reassign a bug.
     */
    @PatchMapping("/{id}/assignment")
    public ResponseEntity<BugReportResponse> updateAssignment(
            @PathVariable Long id,
            @RequestBody UpdateAssignmentRequest request
    ) {

        return ResponseEntity.ok(
                bugReportService.updateAssignment(
                        id,
                        request
                )
        );
    }

    /**
     * Delete a bug.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBug(
            @PathVariable Long id
    ) {

        bugReportService.deleteBug(id);

        return ResponseEntity.noContent().build();
    }
}