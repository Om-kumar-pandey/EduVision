package com.aicte.complaints.repository;

import com.aicte.complaints.entity.OverlapAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OverlapAlertRepository extends JpaRepository<OverlapAlert, Long> {

    @Query("SELECT o FROM OverlapAlert o WHERE " +
           "(o.case1.id = :c1 AND o.case2.id = :c2) OR " +
           "(o.case1.id = :c2 AND o.case2.id = :c1)")
    Optional<OverlapAlert> findExistingPair(@Param("c1") Long c1, @Param("c2") Long c2);

    List<OverlapAlert> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);

    long countByStatus(String status);
    long countByReviewBand(String reviewBand);
    long countByDecisionStatus(String decisionStatus);

    @Query("SELECT COUNT(o) FROM OverlapAlert o WHERE o.decisionStatus = 'AWAITING_REVIEW' AND o.reviewBand IN ('HIGH', 'MEDIUM')")
    long countPendingReviewOverlaps();

    @Query("SELECT o FROM OverlapAlert o WHERE " +
           "(:status IS NULL OR :status = '' OR o.status = :status) AND " +
           "(:decisionStatus IS NULL OR :decisionStatus = '' OR o.decisionStatus = :decisionStatus) AND " +
           "(:reviewBand IS NULL OR :reviewBand = '' OR o.reviewBand = :reviewBand) AND " +
           "(:bureauId IS NULL OR o.case1.bureau.id = :bureauId OR o.case2.bureau.id = :bureauId) AND " +
           "(:institutionId IS NULL OR o.institution.id = :institutionId) AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(o.case1.caseNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(o.case2.caseNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(o.institution.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(o.institution.permanentId) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY o.similarityScore DESC, o.createdAt DESC")
    Page<OverlapAlert> findFilteredOverlaps(
            @Param("status") String status,
            @Param("decisionStatus") String decisionStatus,
            @Param("reviewBand") String reviewBand,
            @Param("bureauId") Long bureauId,
            @Param("institutionId") Long institutionId,
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT o FROM OverlapAlert o WHERE " +
           "(:status IS NULL OR :status = '' OR o.status = :status) " +
           "ORDER BY o.similarityScore DESC, o.createdAt DESC")
    Page<OverlapAlert> findAllWithFilter(@Param("status") String status, Pageable pageable);
}
