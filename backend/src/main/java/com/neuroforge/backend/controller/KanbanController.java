package com.neuroforge.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.KanbanResponse;
import com.neuroforge.backend.service.KanbanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kanban")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;

    /** projectId is mandatory (there is no "all projects" board). Status changes: PATCH /api/tasks/{id}/status. */
    @GetMapping
    public KanbanResponse board(@RequestParam Long projectId) {
        return kanbanService.board(projectId);
    }
}
