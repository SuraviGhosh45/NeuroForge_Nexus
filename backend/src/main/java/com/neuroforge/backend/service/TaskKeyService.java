package com.neuroforge.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.neuroforge.backend.entity.Project;
import com.neuroforge.backend.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskKeyService {

	private final ProjectRepository projectRepository;

	@Transactional(propagation = Propagation.REQUIRED)
	public synchronized String nextKey(Project project) {
		if (project.getProjectKey() == null || project.getProjectKey().isBlank()) {
			project.setProjectKey(derivePrefix(project.getName()));
		}
		int next = (project.getTaskCounter() == null ? 0 : project.getTaskCounter()) + 1;
		project.setTaskCounter(next);
		projectRepository.save(project);
		return project.getProjectKey() + "-" + next;
	}

	private String derivePrefix(String name) {
		String letters = name == null ? "" : name.replaceAll("[^A-Za-z]", "");
		String prefix = letters.length() >= 3 ? letters.substring(0, 3) : (letters + "TSK");
		return prefix.substring(0, 3).toUpperCase();
	}
}
