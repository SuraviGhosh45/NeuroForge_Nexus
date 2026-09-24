package com.neuroforge.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.neuroforge.backend.entity.Skill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SignupRequest {
    @NotBlank @Size(max = 100) private String fullName;
    @JsonAlias("userId") @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$", message = "must be 3-30 characters") private String userCode;
    @NotBlank @Size(max = 150) @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "must be a valid email address") private String email;
    @Pattern(regexp = "^$|^\\d{10}$", message = "must be exactly 10 digits when supplied") private String contactNumber;
    @NotBlank @Size(min = 6, max = 72, message = "must be between 6 and 72 characters") private String password;
    private String confirmPassword;
    private Skill skill;

    public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
    public String getUserCode(){return userCode;} public void setUserCode(String v){userCode=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getContactNumber(){return contactNumber;} public void setContactNumber(String v){contactNumber=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public String getConfirmPassword(){return confirmPassword;} public void setConfirmPassword(String v){confirmPassword=v;}
    public Skill getSkill(){return skill;} public void setSkill(Skill v){skill=v;}
}
