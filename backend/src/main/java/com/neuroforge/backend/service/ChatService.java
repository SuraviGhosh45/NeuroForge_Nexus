package com.neuroforge.backend.service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.neuroforge.backend.dto.ChatDtos.ChatRequest;
import com.neuroforge.backend.dto.ChatDtos.ChatResponse;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;
import com.neuroforge.backend.exception.BusinessRuleException;

@Service
public class ChatService {

    private static final int MAX_HISTORY_TURNS = 6;
    private static final int MAX_CALLS_PER_MINUTE_PER_USER = 6;

    private static final String SYSTEM_PROMPT_PREFIX = """
            You are the NeuroForge Nexus project assistant, embedded inside a project
            management tool. Answer using ONLY the CONTEXT block below, which reflects
            exactly what the current user is allowed to see.

            If something isn't in the context, say you don't have that information
            rather than guessing.

            Keep answers short and practical — this is a chat widget, not a report.

            Never reveal data about projects or tasks that aren't listed in the context.

            CONTEXT:
            """;

    private final RestClient restClient;
    private final ChatContextBuilder contextBuilder;
    private final String model;

    private final Map<Long, Deque<Long>> callLog =
            new ConcurrentHashMap<>();

    public ChatService(
            ChatContextBuilder contextBuilder,

            @Value("${neuroforge.chat.base-url:https://api.groq.com/openai/v1}")
            String baseUrl,

            @Value("${neuroforge.chat.api-key}")
            String apiKey,

            @Value("${neuroforge.chat.model:llama-3.3-70b-versatile}")
            String model) {

        this.contextBuilder = contextBuilder;
        this.model = model;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public ChatResponse reply(ChatRequest request) {

        AuthUser user = CurrentUser.get();

        enforceRateLimit(user.userId());

        String context = contextBuilder.build(user);

        List<Map<String, String>> messages = new ArrayList<>();

        // System message
        messages.add(
                Map.of(
                        "role",
                        "system",
                        "content",
                        SYSTEM_PROMPT_PREFIX + context
                )
        );

        // Previous conversation history
        if (request.history() != null) {

            request.history()
                    .stream()
                    .filter(t ->
                            t.role() != null &&
                            t.content() != null
                    )
                    .skip(
                            Math.max(
                                    0,
                                    request.history().size()
                                            - MAX_HISTORY_TURNS
                            )
                    )
                    .forEach(t ->
                            messages.add(
                                    Map.of(
                                            "role",
                                            "user".equals(t.role())
                                                    ? "user"
                                                    : "assistant",
                                            "content",
                                            t.content()
                                    )
                            )
                    );
        }

        // Current user message
        messages.add(
                Map.of(
                        "role",
                        "user",
                        "content",
                        request.message()
                )
        );

        // Groq request body
        Map<String, Object> body = Map.of(
                "model",
                model,

                "messages",
                messages,

                "temperature",
                0.3,

                "max_tokens",
                400
        );

        try {

            @SuppressWarnings("unchecked")
            Map<String, Object> response =
                    restClient.post()
                            .uri("/chat/completions")
                            .body(body)
                            .retrieve()
                            .body(Map.class);

            String content = extractContent(response);

            if (content == null || content.isBlank()) {

                return new ChatResponse(
                        "I couldn't come up with an answer for that. Try rephrasing your question."
                );
            }

            return new ChatResponse(content);

        } catch (RestClientException ex) {

            // Keep the actual API error out of the UI.
            // Print it in backend console for debugging.
            System.err.println(
                    "Groq API request failed: "
                            + ex.getMessage()
            );

            return new ChatResponse(
                    "AI Assistant is currently unavailable. "
                            + "Please check the Groq API configuration."
            );
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(
            Map<String, Object> response) {

        if (response == null) {
            return null;
        }

        List<Object> choices =
                (List<Object>) response.get("choices");

        if (choices == null || choices.isEmpty()) {
            return null;
        }

        Map<String, Object> first =
                (Map<String, Object>) choices.get(0);

        Map<String, Object> message =
                (Map<String, Object>) first.get("message");

        if (message == null) {
            return null;
        }

        return (String) message.get("content");
    }

    /**
     * Protects the shared Groq key from one user
     * sending too many requests.
     */
    private void enforceRateLimit(Long userId) {

        long now =
                Instant.now().toEpochMilli();

        Deque<Long> log =
                callLog.computeIfAbsent(
                        userId,
                        k -> new ArrayDeque<>()
                );

        synchronized (log) {

            while (
                    !log.isEmpty()
                            && now - log.peekFirst() > 60_000
            ) {

                log.pollFirst();
            }

            if (
                    log.size()
                            >= MAX_CALLS_PER_MINUTE_PER_USER
            ) {

                throw new BusinessRuleException(
                        "You're sending messages a bit fast — "
                                + "please wait a few seconds and try again."
                );
            }

            log.addLast(now);
        }
    }
}