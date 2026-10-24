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

    @Query("SELECT o FROM OverlapAlert o WHERE " +
           "(:status IS NULL OR :status = '' OR o.status = :status) " +
           "ORDER BY o.createdAt DESC")
    Page<OverlapAlert> findAllWithFilter(@Param("status") String status, Pageable pageable);
}
