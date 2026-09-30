package com.neuroforge.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.service.GitHubService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubService gitHubService;

    @GetMapping("/repository")
    public Map<String, Object> getRepository(
            @RequestParam String owner,
            @RequestParam String repository) {

        return gitHubService.getRepository(owner, repository);
    }
}
