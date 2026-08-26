package com.neuroforage.backend.dto;

import com.neuroforage.backend.model.Role;
import com.neuroforage.backend.model.User;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
