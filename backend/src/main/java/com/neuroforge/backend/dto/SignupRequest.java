package com.neuroforge.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.neuroforge.backend.entity.Skill;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * POST /api/auth/signup.
 * There is intentionally NO role field: any "role" sent by the client is ignored and the
 * backend force-sets TEAM_MEMBER.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignupRequest {

    @NotBlank
    @Size(max = 100)
    private String fullName;

    /** The unique "User ID" chosen at signup. Accepted as "userCode" or "userId". */
    @NotBlank
    @JsonAlias("userId")
    @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$",
            message = "must be 3-30 characters (letters, digits, '.', '_' or '-')")
    private String userCode;

    @NotBlank
    @Size(max = 150)
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "must be a valid email address")
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\d{10}$", message = "must be exactly 10 digits")
    private String contactNumber;

    @NotBlank
    @Size(min = 8, max = 72, message = "must be between 8 and 72 characters")
    private String password;

    /** Optional. When present it must match password. */
    private String confirmPassword;

    @NotNull
    private Skill skill;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUserCode() { return userCode; }
    public void setUserCode(String userCode) { this.userCode = userCode; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
}
