package com.neuroforge.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.ChatDtos.ChatRequest;
import com.neuroforge.backend.dto.ChatDtos.ChatResponse;
import com.neuroforge.backend.service.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Every authenticated role can use the assistant — data returned is already scoped per user by ChatContextBuilder. */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.reply(request);
    }
}