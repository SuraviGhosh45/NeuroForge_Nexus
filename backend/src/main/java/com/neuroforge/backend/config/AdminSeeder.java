package com.neuroforge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;
import com.neuroforge.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Runs once on every startup. If no Admin exists in the system yet, creates one
 * from application.properties values. This solves the bootstrap problem: every
 * normal signup lands as UNASSIGNED, so without this, there would be no way to
 * create the very first Admin without manual SQL.
 *
 * Safe to run every time the app starts - it only acts when zero Admins exist.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.name:System Admin}")
    private String bootstrapName;

    @Value("${app.bootstrap-admin.email:admin@example.com}")
    private String bootstrapEmail;

    @Value("${app.bootstrap-admin.password:Admin@12345}")
    private String bootstrapPassword;

    @Override
    public void run(String... args) {
        long adminCount = userRepository.countByRole(Role.ADMIN);

        if (adminCount > 0) {
            return; // an Admin already exists, nothing to do
        }

        String email = bootstrapEmail.trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.warn("Bootstrap admin email '{}' is already taken by a non-admin account. "
                    + "Promote that account manually, or change app.bootstrap-admin.email.", email);
            return;
        }

        User admin = new User();
        admin.setFullName(bootstrapName);
        admin.setLegacyName(bootstrapName);
        admin.setUserCode("admin");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(bootstrapPassword));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setAvailabilityStatus("Active");

        userRepository.save(admin);

        log.info("Bootstrap Admin created — email: {}, password: {} (change this after first login).",
                email, bootstrapPassword);
    }
}