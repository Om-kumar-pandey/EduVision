package com.aicte.complaints.repository;

import com.aicte.complaints.entity.CaseAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseActionRepository extends JpaRepository<CaseAction, Long> {
    List<CaseAction> findByCaseEntityIdOrderByCreatedAtAsc(Long caseId);
    List<CaseAction> findByCaseEntityIdOrderByCreatedAtDesc(Long caseId);
}
