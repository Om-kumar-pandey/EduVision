package com.aicte.complaints.repository;

import com.aicte.complaints.entity.ImportError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportErrorRepository extends JpaRepository<ImportError, Long> {
    List<ImportError> findByImportBatchIdOrderByCsvRowNumberAsc(Long importBatchId);
}
