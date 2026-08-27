package com.neuroforage.backend.exception;

public class DuplicateProjectMemberException extends RuntimeException {
    public DuplicateProjectMemberException(String message) {
        super(message);
    }
}
