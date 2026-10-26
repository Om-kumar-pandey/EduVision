package com.aicte.complaints.repository;

import com.aicte.complaints.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    Page<User> findByOrderByCreatedAtDesc(Pageable pageable);

    List<User> findByBureauId(Long bureauId);
    List<User> findByRole(String role);
    List<User> findByInstitutionId(Long institutionId);

    @Query("SELECT u FROM User u LEFT JOIN u.bureau b WHERE " +
           "(:role IS NULL OR :role = '' OR u.role = :role) AND " +
           "(:bureauId IS NULL OR (b IS NOT NULL AND b.id = :bureauId)) AND " +
           "(:region IS NULL OR :region = '' OR (u.region IS NOT NULL AND LOWER(u.region) = LOWER(:region))) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive) AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (u.designation IS NOT NULL AND LOWER(u.designation) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<User> searchUsers(@Param("role") String role,
                           @Param("bureauId") Long bureauId,
                           @Param("region") String region,
                           @Param("isActive") Boolean isActive,
                           @Param("query") String query,
                           Pageable pageable);
}
