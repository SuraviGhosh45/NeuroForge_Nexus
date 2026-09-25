package com.neuroforge.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    // Kept for compatibility with the existing users table schema.
    @JsonIgnore
    @Column(name = "name", nullable = false)
    private String legacyName;

    /** The "User ID" typed by the user at signup (unique). Can be used to log in instead of the email. */
    @Column(name = "user_code", nullable = false, unique = true, length = 50)
    private String userCode;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    /** Skill tag only - grants no permission. Nullable only for rows created before this column existed. */
    @Enumerated(EnumType.STRING)
    @Column(name = "skill", length = 30)
    private Skill skill;

    /** Access role. Always UNASSIGNED at signup; changed only by an Admin. */
    @Enumerated(EnumType.STRING)
    @Column(name = "access_role", nullable = false, length = 30)
    private Role role = Role.UNASSIGNED;

    /** Login/authorization switch. */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    /** Team presence status shown in the UI. In Meeting does not disable login. */
    @Column(name = "availability_status", nullable = false, length = 20)
    private String availabilityStatus = "Active";

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    // ---- getters & setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getLegacyName() { return legacyName; }
    public void setLegacyName(String legacyName) { this.legacyName = legacyName; }

    public String getUserCode() { return userCode; }
    public void setUserCode(String userCode) { this.userCode = userCode; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}