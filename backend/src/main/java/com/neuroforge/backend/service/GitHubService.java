package com.neuroforge.backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GitHubService {

    private final RestClient restClient;

    public GitHubService(
            @Value("${github.api-url}") String apiUrl,
            @Value("${github.token:}") String token) {

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json");

        if (token != null && !token.isBlank()) {
            builder.defaultHeader(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + token
            );
        }

        this.restClient = builder.build();
    }

    public Map<String, Object> getRepository(
            String owner,
            String repository) {

        return restClient.get()
                .uri("/repos/{owner}/{repository}", owner, repository)
                .retrieve()
                .body(Map.class);
    }
}