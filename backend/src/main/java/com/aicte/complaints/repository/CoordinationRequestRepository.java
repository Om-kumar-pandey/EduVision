package com.aicte.complaints.repository;

import com.aicte.complaints.entity.CoordinationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoordinationRequestRepository extends JpaRepository<CoordinationRequest, Long> {

    Optional<CoordinationRequest> findByRequestNumber(String requestNumber);

    List<CoordinationRequest> findByPrimaryCaseIdOrLinkedCaseId(Long primaryCaseId, Long linkedCaseId);

    @Query("SELECT c FROM CoordinationRequest c WHERE " +
           "(:bureauId IS NULL OR c.initiatingBureau.id = :bureauId OR c.targetBureau.id = :bureauId) AND " +
           "(:status IS NULL OR :status = '' OR c.status = :status) " +
           "ORDER BY c.createdAt DESC")
    Page<CoordinationRequest> findFiltered(
            @Param("bureauId") Long bureauId,
            @Param("status") String status,
            Pageable pageable);

    long countByStatus(String status);
}
