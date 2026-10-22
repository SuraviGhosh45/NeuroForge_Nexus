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

    @Value("${app.bootstrap-admin.password:}")
    private String bootstrapPassword;

    @Value("${ADMIN_RESET_PASSWORD:false}")
    private boolean resetExistingAdminPassword;

    @Override
    public void run(String... args) {
        String email = bootstrapEmail.trim().toLowerCase();

        User existingUser = userRepository.findAll()
                .stream()
                .filter(user -> user.getEmail() != null
                        && user.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);

        long adminCount = userRepository.countByRole(Role.ADMIN);

        // If this email already belongs to an account, handle it safely.
        if (existingUser != null) {
            if (existingUser.getRole() != Role.ADMIN) {
                log.warn(
                    "Bootstrap email '{}' belongs to a non-admin account. "
                    + "No changes were made.", email
                );
                return;
            }

            // Password reset happens only when explicitly enabled.
            if (resetExistingAdminPassword) {
                if (bootstrapPassword == null
                        || bootstrapPassword.isBlank()) {
                    throw new IllegalStateException(
                        "ADMIN_PASSWORD must be set to reset the admin password."
                    );
                }

                existingUser.setPassword(
                    passwordEncoder.encode(bootstrapPassword)
                );
                existingUser.setActive(true);
                userRepository.save(existingUser);

                log.warn(
                    "Password reset for existing admin '{}'. "
                    + "Set ADMIN_RESET_PASSWORD=false after this reset.",
                    email
                );
            } else {
                log.info(
                    "Bootstrap admin '{}' already exists. No changes made.",
                    email
                );
            }

            return;
        }

        // Do not create an additional admin if another admin already exists.
        if (adminCount > 0) {
            log.warn(
                "An admin already exists, but '{}' was not found. "
                + "No additional admin was created.",
                email
            );
            return;
        }

        if (bootstrapPassword == null || bootstrapPassword.isBlank()) {
            throw new IllegalStateException(
                "ADMIN_PASSWORD must be configured to create the first admin."
            );
        }

        // Create the first admin only when no admin exists.
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

        log.info("Bootstrap admin created for email '{}'.", email);
    }
}