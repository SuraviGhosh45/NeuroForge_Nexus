package com.neuroforge.backend.controller;

import com.neuroforge.backend.dto.AddMemberRequest;
import com.neuroforge.backend.dto.TeamRequest;
import com.neuroforge.backend.dto.UpdateMemberRoleRequest;
import com.neuroforge.backend.entity.Team;
import com.neuroforge.backend.entity.TeamMember;
import com.neuroforge.backend.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin
public class TeamController {

    @Autowired
    private TeamService teamService;

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody TeamRequest request) {
        return ResponseEntity.ok(teamService.createTeam(request));
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @RequestBody TeamRequest request) {
        return ResponseEntity.ok(teamService.updateTeam(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMember> addMember(@PathVariable Long teamId, @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(teamService.addMember(teamId, request.getUserId(), request.getTeamRole()));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getMembers(teamId));
    }

    @PutMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamMember> updateMemberRole(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            @RequestBody UpdateMemberRoleRequest request) {
        return ResponseEntity.ok(teamService.updateMemberRole(teamId, userId, request.getTeamRole()));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }
}