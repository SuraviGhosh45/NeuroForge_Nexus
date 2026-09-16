package com.neuroforge.backend.dto.sprint;

public record DependencyRequest(Long dependsOnTaskId, String dependsOnTaskKey) {
}
