package com.neuroforge.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.KanbanResponse;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Kanban board for ONE project (a projectId is mandatory - there is no "all projects" board).
 * Anyone who can view the project sees its board; each card says whether the caller may move it.
 */
@Service
@RequiredArgsConstructor
public class KanbanService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AccessService access;

    @Transactional(readOnly = true)
    public KanbanResponse board(Long projectId) {
        AuthUser user = CurrentUser.get();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id " + projectId));

        access.assertCanView(user, project);

        boolean managesProject = access.canManage(user, project);

        List<KanbanResponse.Card> todo = new ArrayList<>();
        List<KanbanResponse.Card> inProgress = new ArrayList<>();
        List<KanbanResponse.Card> done = new ArrayList<>();

        for (Task task : taskRepository.findByProjectIdOrderByBoardPositionAscIdAsc(projectId)) {
            boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(user.userId());
            KanbanResponse.Card card = toCard(task, managesProject || isAssignee);

            switch (task.getBoardStatus()) {
                case TODO -> todo.add(card);
                case DONE -> done.add(card);
                // "In Review" (legacy value) is shown in the In Progress column.
                case IN_PROGRESS, IN_REVIEW -> inProgress.add(card);
            }
        }

        int total = todo.size() + inProgress.size() + done.size();

        return new KanbanResponse(
                project.getId(),
                project.getName(),
                project.getCode(),
                new KanbanResponse.Stats(total, todo.size(), inProgress.size(), done.size()),
                List.of(
                        new KanbanResponse.Column(BoardStatus.TODO.name(), "To Do", todo.size(), todo),
                        new KanbanResponse.Column(BoardStatus.IN_PROGRESS.name(), "In Progress", inProgress.size(), inProgress),
                        new KanbanResponse.Column(BoardStatus.DONE.name(), "Done", done.size(), done)));
    }

    private KanbanResponse.Card toCard(Task task, boolean canMove) {
        return new KanbanResponse.Card(
                task.getId(),
                task.getTaskKey(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getBoardStatus().getLabel(),
                task.getBoardStatus().name(),
                task.getAssignee() == null ? null : task.getAssignee().getId(),
                task.getAssignee() == null ? null : task.getAssignee().getFullName(),
                task.getDueDate(),
                task.isBlocked(),
                task.getBlockedReason(),
                task.getStoryPoints(),
                canMove);
    }
}
