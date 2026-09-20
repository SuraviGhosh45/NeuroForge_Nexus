package com.neuroforge.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.neuroforge.backend.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    long countByStatus(String status);

    boolean existsByProjectKeyIgnoreCase(String projectKey);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    long countByProjectManagerId(Long userId);

    List<Project> findByProjectManagerId(Long userId);

    /** PROJECT_MANAGER scope: projects they manage OR are a member of. */
    @Query("select distinct p from Project p left join p.members m "
            + "where p.projectManager.id = :userId or m.id = :userId order by p.id")
    List<Project> findManagedOrMemberOf(@Param("userId") Long userId);

    /** TEAM_MEMBER scope: only projects they are a member of. */
    @Query("select distinct p from Project p join p.members m where m.id = :userId order by p.id")
    List<Project> findByMemberId(@Param("userId") Long userId);

    /** Used when a user is deleted: remove them from every project's member list. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "DELETE FROM project_members WHERE user_id = :userId", nativeQuery = true)
    int removeUserFromAllProjects(@Param("userId") Long userId);
}
