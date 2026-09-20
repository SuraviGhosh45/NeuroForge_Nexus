package com.neuroforge.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.neuroforge.backend.dto.AuthResponse;
import com.neuroforge.backend.dto.LoginRequest;
import com.neuroforge.backend.dto.SignupRequest;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.security.AuthUser;
import com.neuroforge.backend.security.CurrentUser;
import com.neuroforge.backend.security.JwtService;
import com.neuroforge.backend.service.UserService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    /** POST /api/auth/signup - always creates a TEAM_MEMBER; returns the JWT so the user is logged in. */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                AuthResponse.of("Account created successfully",
                        jwtService.generateToken(user), jwtService.getExpirationSeconds(), user));
    }

    /** POST /api/auth/login - Email or User ID + password. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getIdentifier(), request.getPassword());
        return ResponseEntity.ok(
                AuthResponse.of("Login successful",
                        jwtService.generateToken(user), jwtService.getExpirationSeconds(), user));
    }

    /** GET /api/auth/me - who the current token belongs to (role shown = role enforced = role in the JWT). */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        AuthUser caller = CurrentUser.get();
        try {
            User user = userService.getUserById(caller.userId());
            if (!user.isActive()) {
                throw new DisabledException("Your account is inactive. Please contact an administrator.");
            }
            return ResponseEntity.ok(AuthResponse.me(user, caller.role()));
        } catch (EntityNotFoundException e) {
            throw new BadCredentialsException("Account no longer exists");
        }
    }

    /** Stateless JWT: nothing to invalidate server side. The frontend just discards the token. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
