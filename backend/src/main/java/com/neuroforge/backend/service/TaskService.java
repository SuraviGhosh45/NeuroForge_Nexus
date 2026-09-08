package com.neuroforge.backend.service;

import com.neuroforge.backend.dto.TaskRequest;
import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.entity.Task;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.ProjectRepository;
import com.neuroforge.backend.repository.TaskRepository;
import com.neuroforge.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public Task createTask(TaskRequest request) {
        Task task = new Task();
        applyRequest(task, request);
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

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "To Do");
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
}