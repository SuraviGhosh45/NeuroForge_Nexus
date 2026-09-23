package com.neuroforge.backend.dto;

import com.neuroforge.backend.entity.Skill;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** PUT /api/users/{id} (Admin). Every field is optional - only supplied fields are changed. Role is NOT editable here. */
public class UpdateUserRequest {

    @Size(max = 100)
    private String fullName;

    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "must be a valid email address")
    private String email;

    @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$",
            message = "must be 3-30 characters (letters, digits, '.', '_' or '-')")
    private String userCode;

    @Pattern(regexp = "^\\d{10}$", message = "must be exactly 10 digits")
    private String contactNumber;

    private Skill skill;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUserCode() { return userCode; }
    public void setUserCode(String userCode) { this.userCode = userCode; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
}
