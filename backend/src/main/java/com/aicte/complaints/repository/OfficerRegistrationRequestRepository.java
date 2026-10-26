package com.aicte.complaints.repository;

import com.aicte.complaints.entity.OfficerRegistrationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerRegistrationRequestRepository extends JpaRepository<OfficerRegistrationRequest, Long> {

    Optional<OfficerRegistrationRequest> findByRequestId(String requestId);

    Optional<OfficerRegistrationRequest> findByActivationToken(String activationToken);

    boolean existsByEmailAndStatus(String email, String status);

    long countByStatus(String status);

    @Query("SELECT r FROM OfficerRegistrationRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:bureauCode IS NULL OR r.requestedBureauCode = :bureauCode) AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(r.requestId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.employeeId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.designation) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<OfficerRegistrationRequest> searchRequests(
            @Param("status") String status,
            @Param("bureauCode") String bureauCode,
            @Param("query") String query,
            Pageable pageable
    );
}
