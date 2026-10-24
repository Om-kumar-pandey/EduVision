package com.aicte.complaints.repository;

import com.aicte.complaints.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
           "(:entityType IS NULL OR :entityType = '' OR a.entityType = :entityType) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findWithFilters(@Param("action") String action,
                                  @Param("entityType") String entityType,
                                  Pageable pageable);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
