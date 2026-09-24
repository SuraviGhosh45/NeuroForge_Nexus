package com.neuroforge.backend.dto;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.Skill;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {
    @NotBlank @Size(max = 100) private String fullName;
    @NotBlank @Email @Size(max = 150) private String email;
    @Size(min = 8, max = 72) private String password;
    @Pattern(regexp = "^[A-Za-z0-9._-]{3,30}$") private String userCode;
    @Pattern(regexp = "^\\d{10}$") private String contactNumber;
    private Role role = Role.DEVELOPER;
    private Skill skill;
    private String status = "Active";

    public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public String getUserCode(){return userCode;} public void setUserCode(String v){userCode=v;}
    public String getContactNumber(){return contactNumber;} public void setContactNumber(String v){contactNumber=v;}
    public Role getRole(){return role;} public void setRole(Role v){role=v;}
    public Skill getSkill(){return skill;} public void setSkill(Skill v){skill=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
}
