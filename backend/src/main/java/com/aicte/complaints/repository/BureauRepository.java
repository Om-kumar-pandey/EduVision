package com.aicte.complaints.repository;

import com.aicte.complaints.entity.Bureau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BureauRepository extends JpaRepository<Bureau, Long> {
    Optional<Bureau> findByCode(String code);
    Optional<Bureau> findByCodeIgnoreCase(String code);
    List<Bureau> findByIsActiveTrue();
}
