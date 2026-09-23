package com.neuroforge.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.neuroforge.backend.entity.Role;
import com.neuroforge.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUserCodeIgnoreCase(String userCode);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserCodeIgnoreCase(String userCode);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByUserCodeIgnoreCaseAndIdNot(String userCode, Long id);

    long countByRole(Role role);

    List<User> findAllByOrderByFullNameAsc();

    /** Dropdown source: active users only. */
    List<User> findByActiveTrueOrderByFullNameAsc();

    List<User> findByActiveTrueAndRoleInOrderByFullNameAsc(Collection<Role> roles);

    @Query("select u from User u "
            + "where lower(u.fullName) like lower(concat('%', :q, '%')) "
            + "or lower(u.email) like lower(concat('%', :q, '%')) "
            + "or lower(u.userCode) like lower(concat('%', :q, '%')) "
            + "order by u.fullName")
    List<User> search(@Param("q") String q);
}
