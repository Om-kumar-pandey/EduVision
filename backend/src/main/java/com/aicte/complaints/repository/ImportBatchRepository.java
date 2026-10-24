package com.aicte.complaints.repository;

import com.aicte.complaints.entity.ImportBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImportBatchRepository extends JpaRepository<ImportBatch, Long> {
    Optional<ImportBatch> findByBatchId(String batchId);
    Page<ImportBatch> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
