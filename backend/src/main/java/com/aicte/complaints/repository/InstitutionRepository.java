package com.aicte.complaints.repository;

import com.aicte.complaints.entity.Institution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    Optional<Institution> findByPermanentId(String permanentId);

    boolean existsByPermanentId(String permanentId);

    long countByRegion(String region);

    long countByApprovalStatus(String approvalStatus);

    long countByIsVerified(boolean isVerified);

    @Query("SELECT i FROM Institution i WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(i.permanentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.state) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:region IS NULL OR :region = '' OR LOWER(i.region) = LOWER(:region))")
    Page<Institution> searchInstitutions(@Param("query") String query,
                                         @Param("region") String region,
                                         Pageable pageable);
}
