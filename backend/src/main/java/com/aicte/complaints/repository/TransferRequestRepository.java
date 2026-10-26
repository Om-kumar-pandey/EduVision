package com.aicte.complaints.repository;

import com.aicte.complaints.entity.TransferRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    List<TransferRequest> findByCaseEntityIdOrderByCreatedAtDesc(Long caseId);
    long countByStatus(String status);
    Page<TransferRequest> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<TransferRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
