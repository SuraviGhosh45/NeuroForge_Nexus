package com.neuroforge.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.dto.TaskRequest;
import com.neuroforge.backend.entity.BoardStatus;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.SprintStatus;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.SprintRepository;
import com.neuroforge.backend.repository.TaskDependencyRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.UserRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskKeyService taskKeyService;
    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskDependencyRepository taskDependencyRepository;

    @Transactional
    public Task createTask(TaskRequest request) {
        Task task = new Task();
        applyRequest(task, request);
        if (task.getTaskKey() == null) {
            task.setTaskKey(taskKeyService.nextKey(task.getProject()));
        }
        task.setBoardStatus(BoardStatus.TODO);
        task.setStatus("To Do");
        sprintRepository.findByProjectIdAndStatus(task.getProject().getId(), SprintStatus.ACTIVE)
                .ifPresent(activeSprint -> {
                    int position = taskRepository
                            .findBySprintIdAndBoardStatusOrderByBoardPositionAsc(activeSprint.getId(), BoardStatus.TODO)
                            .size();
                    task.setSprint(activeSprint);
                    task.setBoardPosition(position);
                });
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        applyRequest(task, request);
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        getTaskById(id);
        taskDependencyRepository.deleteByTaskId(id);
        taskDependencyRepository.deleteByDependsOnId(id);
        taskRepository.deleteById(id);
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        BoardStatus boardStatus = toBoardStatus(request.getStatus());
        task.setBoardStatus(boardStatus);
        task.setStatus(boardStatus.getLabel());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        task.setDueDate(request.getDueDate());

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        task.setProject(project);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
    }

    private BoardStatus toBoardStatus(String status) {
        if (status == null || status.isBlank()) {
            return BoardStatus.TODO;
        }

        return switch (status.trim().toUpperCase().replace(' ', '_')) {
            case "TODO", "TO_DO" -> BoardStatus.TODO;
            case "IN_PROGRESS" -> BoardStatus.IN_PROGRESS;
            case "IN_REVIEW" -> BoardStatus.IN_REVIEW;
            case "DONE" -> BoardStatus.DONE;
            default -> throw new IllegalArgumentException("Unsupported task status: " + status);
        };
    }
}