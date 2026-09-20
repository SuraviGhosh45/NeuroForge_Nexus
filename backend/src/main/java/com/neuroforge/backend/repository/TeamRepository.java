package com.neuroforge.backend.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.neuroforge.backend.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    boolean existsByTeamCodeIgnoreCase(String teamCode);

    boolean existsByTeamCodeIgnoreCaseAndIdNot(String teamCode, Long id);

    List<Team> findByProjectId(Long projectId);

    /** PROJECT_MANAGER scope: teams of the projects they can see. */
    List<Team> findByProjectIdIn(Collection<Long> projectIds);
}
