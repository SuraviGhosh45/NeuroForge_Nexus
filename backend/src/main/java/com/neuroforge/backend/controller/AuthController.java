package com.neuroforge.backend.controller;

import com.neuroforge.backend.dto.LoginRequest;
import com.neuroforge.backend.dto.SignupRequest;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok(toResponse(user, "Account created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.validateLogin(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(toResponse(user, "Login successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> toResponse(User user, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        return response;
    }
}
