package com.eduvision.repository;

import com.eduvision.entity.Complaint;
import com.eduvision.entity.ComplaintStatus;
import com.eduvision.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByTrackingId(String trackingId);
    
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    Page<Complaint> findByUser(User user, Pageable pageable);

    List<Complaint> findTop5ByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findTop5ByOrderByCreatedAtDesc();

    long countByUser(User user);
    long countByUserAndStatus(User user, ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:query IS NULL OR LOWER(c.trackingId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.institutionName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.category = :category)")
    Page<Complaint> searchComplaints(String query, ComplaintStatus status, String category, Pageable pageable);
}
