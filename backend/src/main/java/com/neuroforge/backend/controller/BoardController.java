package com.neuroforge.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.sprint.BoardCard;
import com.neuroforge.backend.dto.sprint.MoveTaskRequest;
import com.neuroforge.backend.dto.sprint.SprintBoardResponse;
import com.neuroforge.backend.service.BoardService;
import com.neuroforge.backend.service.ProjectService;
import com.neuroforge.backend.service.SprintService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

	private final BoardService boardService;
	private final SprintService sprintService;
	private final ProjectService projectService;

	@GetMapping("/sprints/{sprintId}/board")
	public SprintBoardResponse board(@PathVariable Long sprintId) {
		return boardService.board(sprintId);
	}

	@GetMapping("/projects/{projectId}/board")
	public SprintBoardResponse activeBoard(@PathVariable Long projectId) {
		return boardService.board(sprintService.activeSprint(projectId).id());
	}

	@GetMapping("/projects/{projectId}/backlog")
	public List<BoardCard> backlog(@PathVariable Long projectId) {
		return boardService.backlog(projectId);
	}

	@PatchMapping("/tasks/{taskId}/board")
	public BoardCard move(@PathVariable Long taskId, @Valid @RequestBody MoveTaskRequest request) {
		BoardCard card = boardService.move(taskId, request);
		// Project status is derived from task statuses, so refresh it after a move.
		projectService.recalculateStatusByTaskId(taskId);
		return card;
	}

	@PatchMapping("/tasks/{taskId}/block")
	public BoardCard block(@PathVariable Long taskId, @RequestBody Map<String, String> body) {
		return boardService.setBlocked(taskId, true, body.getOrDefault("reason", "Blocked"));
	}

	@PatchMapping("/tasks/{taskId}/unblock")
	public BoardCard unblock(@PathVariable Long taskId) {
		return boardService.setBlocked(taskId, false, null);
	}
}
