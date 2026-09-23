package com.neuroforge.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.DashboardResponse;
import com.neuroforge.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** ONE endpoint for every role - the JWT role decides the scope (see DashboardService). */
    @GetMapping
    public DashboardResponse dashboard() {
        return dashboardService.get();
    }
}
