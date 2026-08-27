package com.neuroforage.backend.exception;

public class ProjectNotFoundException extends ResourceNotFoundException {
    public ProjectNotFoundException(String message) {
        super(message);
    }
}
