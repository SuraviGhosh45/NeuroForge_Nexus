package com.neuroforge.backend.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Creates and validates the JWT. The token carries: userId, role, email.
 * The token authenticates the user id; the current role is reloaded from the database on each request.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes) {

        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationSeconds = expirationMinutes * 60;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key)
                .compact();
    }

    /** Throws io.jsonwebtoken.JwtException / IllegalArgumentException when the token is invalid or expired. */
    public AuthUser parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Number userId = claims.get("userId", Number.class);
        String roleName = claims.get("role", String.class);
        String email = claims.get("email", String.class);

        if (userId == null || roleName == null) {
            throw new IllegalArgumentException("Token is missing required claims");
        }
        return new AuthUser(userId.longValue(), email, Role.valueOf(roleName));
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}
