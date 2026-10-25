package com.eduvision.repository;

import com.eduvision.entity.Complaint;
import com.eduvision.entity.ComplaintInternalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintInternalNoteRepository extends JpaRepository<ComplaintInternalNote, Long> {
    List<ComplaintInternalNote> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
}
