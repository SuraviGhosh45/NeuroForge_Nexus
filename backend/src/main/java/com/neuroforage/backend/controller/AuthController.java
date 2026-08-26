package com.neuroforage.backend.controller;

import com.neuroforage.backend.dto.LoginRequest;
import com.neuroforage.backend.dto.LoginResponse;
import com.neuroforage.backend.dto.UserResponse;
import com.neuroforage.backend.service.AuthService;
import com.neuroforage.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        return ResponseEntity.ok(authService.login(request, httpRequest, httpResponse));
    }

    /**
     * Authenticated probe endpoint used to verify security configuration.
     * Requires a valid session (after login) or HTTP Basic credentials.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> currentUser(Authentication authentication) {
        UserResponse user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "user", user
        ));
    }
}
