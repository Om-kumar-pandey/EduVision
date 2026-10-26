package com.aicte.complaints.repository;

import com.aicte.complaints.entity.CaseRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRelationshipRepository extends JpaRepository<CaseRelationship, Long> {

    @Query("SELECT r FROM CaseRelationship r WHERE r.sourceCase.id = :caseId OR r.targetCase.id = :caseId")
    List<CaseRelationship> findAllForCase(@Param("caseId") Long caseId);

    @Query("SELECT r FROM CaseRelationship r WHERE " +
           "(r.sourceCase.id = :c1 AND r.targetCase.id = :c2) OR " +
           "(r.sourceCase.id = :c2 AND r.targetCase.id = :c1)")
    List<CaseRelationship> findBetweenCases(@Param("c1") Long c1, @Param("c2") Long c2);

    long countByRelationshipType(String relationshipType);
}
