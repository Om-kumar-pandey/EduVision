package com.aicte.complaints.repository;

import com.aicte.complaints.entity.CaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, Long> {

    Optional<CaseEntity> findByCaseNumber(String caseNumber);

    boolean existsByCaseNumber(String caseNumber);

    List<CaseEntity> findByInstitutionIdOrderByReceiptDateDesc(Long institutionId);
    List<CaseEntity> findByInstitutionId(Long institutionId);

    List<CaseEntity> findByCreatedBy_IdOrderByReceiptDateDesc(Long createdById);

    List<CaseEntity> findTop10ByOrderByReceiptDateDesc();

    @Query("SELECT c FROM CaseEntity c WHERE c.institution.id = :institutionId AND c.status <> 'DISPOSED'")
    List<CaseEntity> findActiveCasesByInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT c FROM CaseEntity c WHERE c.institution.id = :institutionId AND c.bureau.id <> :bureauId AND c.status <> 'DISPOSED'")
    List<CaseEntity> findActiveCasesForOtherBureaus(@Param("institutionId") Long institutionId, @Param("bureauId") Long bureauId);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE c.status <> 'DISPOSED' AND c.status <> 'RESOLVED' AND c.status <> 'CLOSED' AND c.expectedDisposalDate < :now")
    long countOverdueCases(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE c.assignedTo IS NULL AND c.status <> 'DISPOSED' AND c.status <> 'RESOLVED' AND c.status <> 'CLOSED'")
    long countUnassignedCases();

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE c.duplicateStatus = 'POTENTIAL'")
    long countPotentialDuplicateCases();

    @Query("SELECT c FROM CaseEntity c WHERE c.status <> 'DISPOSED' AND c.expectedDisposalDate < :now ORDER BY c.expectedDisposalDate ASC")
    List<CaseEntity> findOverdueCases(@Param("now") LocalDateTime now, Pageable pageable);

    long countByStatus(String status);

    long countByPriority(String priority);

    long countByPriorityAndStatusNot(String priority, String status);

    long countByBureauId(Long bureauId);

    @Query("SELECT FUNCTION('DATE_FORMAT', c.receiptDate, '%Y-%m') as m, COUNT(c) " +
           "FROM CaseEntity c " +
           "WHERE c.receiptDate >= :startDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', c.receiptDate, '%Y-%m') " +
           "ORDER BY m ASC")
    List<Object[]> countMonthlyInflow(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT FUNCTION('DATE_FORMAT', c.disposedDate, '%Y-%m') as m, COUNT(c) " +
           "FROM CaseEntity c " +
           "WHERE c.disposedDate IS NOT NULL AND c.disposedDate >= :startDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', c.disposedDate, '%Y-%m') " +
           "ORDER BY m ASC")
    List<Object[]> countMonthlyDisposal(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT c FROM CaseEntity c LEFT JOIN c.bureau b LEFT JOIN c.institution i WHERE " +
           "(:bureauId IS NULL OR (b IS NOT NULL AND b.id = :bureauId)) AND " +
           "(:status IS NULL OR :status = '' OR c.status = :status) AND " +
           "(:priority IS NULL OR :priority = '' OR c.priority = :priority) AND " +
           "(:category IS NULL OR :category = '' OR c.category = :category) AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(c.caseNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (c.sourceCaseId IS NOT NULL AND LOWER(c.sourceCaseId) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           " LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (i IS NOT NULL AND LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           " (i IS NOT NULL AND LOWER(i.permanentId) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<CaseEntity> searchCases(@Param("bureauId") Long bureauId,
                                 @Param("status") String status,
                                 @Param("priority") String priority,
                                 @Param("category") String category,
                                 @Param("query") String query,
                                 Pageable pageable);

    @Query("SELECT c FROM CaseEntity c LEFT JOIN c.institution i WHERE " +
           "(:region IS NULL OR :region = '' OR (i IS NOT NULL AND LOWER(i.region) = LOWER(:region))) AND " +
           "(:status IS NULL OR :status = '' OR c.status = :status) AND " +
           "(:priority IS NULL OR :priority = '' OR c.priority = :priority) AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(c.caseNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (i IS NOT NULL AND LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           " (i IS NOT NULL AND LOWER(i.permanentId) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<CaseEntity> searchRegionalCases(@Param("region") String region,
                                         @Param("status") String status,
                                         @Param("priority") String priority,
                                         @Param("query") String query,
                                         Pageable pageable);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE LOWER(c.institution.region) = LOWER(:region)")
    long countByInstitutionRegion(@Param("region") String region);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE LOWER(c.institution.region) = LOWER(:region) AND c.status <> 'DISPOSED'")
    long countActiveByInstitutionRegion(@Param("region") String region);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE LOWER(c.institution.region) = LOWER(:region) AND c.status = 'DISPOSED'")
    long countDisposedByInstitutionRegion(@Param("region") String region);

    @Query("SELECT COUNT(c) FROM CaseEntity c WHERE LOWER(c.institution.region) = LOWER(:region) AND c.status <> 'DISPOSED' AND c.expectedDisposalDate < :now")
    long countOverdueByInstitutionRegion(@Param("region") String region, @Param("now") LocalDateTime now);
}
