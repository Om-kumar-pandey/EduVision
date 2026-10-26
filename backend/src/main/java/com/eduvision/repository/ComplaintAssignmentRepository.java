package com.eduvision.repository;

import com.eduvision.entity.Complaint;
import com.eduvision.entity.ComplaintAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintOrderByAssignedAtDesc(Complaint complaint);
}
