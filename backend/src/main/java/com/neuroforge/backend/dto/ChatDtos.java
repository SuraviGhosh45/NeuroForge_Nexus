package com.neuroforge.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record ChatTurn(
            String role,
            String content
    ) {
    }

    public record ChatRequest(
            @NotBlank
            @Size(max = 1000)
            String message,

            List<ChatTurn> history
    ) {
    }

    public record ChatResponse(
            String reply
    ) {
    }
}