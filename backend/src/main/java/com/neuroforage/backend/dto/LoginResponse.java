package com.neuroforage.backend.dto;

public record LoginResponse(
        String message,
        UserResponse user
) {
}
