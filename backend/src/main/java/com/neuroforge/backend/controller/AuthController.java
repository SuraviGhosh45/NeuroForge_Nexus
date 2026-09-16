package com.neuroforge.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.LoginRequest;
import com.neuroforge.backend.dto.SignupRequest;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    public static final String AUTH_USER_ID = "AUTH_USER_ID";

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request, HttpServletRequest httpRequest) {
        try {
            User user = userService.registerUser(request);
            httpRequest.getSession(true).setAttribute(AUTH_USER_ID, user.getId());
            return ResponseEntity.ok(toResponse(user, "Account created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            User user = userService.validateLogin(request.getEmail(), request.getPassword());
            httpRequest.getSession(true).setAttribute(AUTH_USER_ID, user.getId());
            return ResponseEntity.ok(toResponse(user, "Login successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute(AUTH_USER_ID) == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        try {
            User user = userService.getUserById((Long) session.getAttribute(AUTH_USER_ID));
            return ResponseEntity.ok(toResponse(user, "Authenticated"));
        } catch (RuntimeException e) {
            session.invalidate();
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
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
