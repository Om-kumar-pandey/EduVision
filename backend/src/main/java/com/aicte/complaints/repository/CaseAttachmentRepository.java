package com.aicte.complaints.repository;

import com.aicte.complaints.entity.CaseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseAttachmentRepository extends JpaRepository<CaseAttachment, Long> {
    List<CaseAttachment> findByCaseEntityIdOrderByCreatedAtDesc(Long caseId);
}
