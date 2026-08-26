package com.software.lifecycle.management.backend;

import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    SecurityFilterChain healthEndpointOnly(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/health").permitAll()
                        .anyRequest().denyAll());
        return http.build();
    }

    @RestController
    static class HealthController {

        @GetMapping("/api/health")
        Map<String, String> health() {
            return Map.of(
                    "status", "UP",
                    "message", "Backend is running"
            );
        }
    }
}
