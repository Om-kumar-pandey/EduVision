package com.aicte.complaints.service;

import com.aicte.complaints.dto.CaseDto;
import com.aicte.complaints.dto.InstitutionDto;
import com.aicte.complaints.dto.OverlapAlertDto;
import com.aicte.complaints.dto.PagedResponse;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.Institution;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.CaseRepository;
import com.aicte.complaints.repository.InstitutionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final CaseRepository caseRepository;
    private final CaseService caseService;
    private final OverlapService overlapService;

    public InstitutionService(InstitutionRepository institutionRepository,
                              CaseRepository caseRepository,
                              CaseService caseService,
                              OverlapService overlapService) {
        this.institutionRepository = institutionRepository;
        this.caseRepository = caseRepository;
        this.caseService = caseService;
        this.overlapService = overlapService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<InstitutionDto> searchInstitutions(String query, String region, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Institution> instPage = institutionRepository.searchInstitutions(query, region, pageable);

        List<InstitutionDto> dtos = instPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                instPage.getNumber(),
                instPage.getSize(),
                instPage.getTotalElements(),
                instPage.getTotalPages(),
                instPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public InstitutionDto getInstitutionById(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));
        return mapToDto(inst);
    }

    @Transactional(readOnly = true)
    public InstitutionDto getInstitutionByPermanentId(String permanentId) {
        Institution inst = institutionRepository.findByPermanentId(permanentId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with AICTE Permanent ID: " + permanentId));
        return mapToDto(inst);
    }

    @Transactional(readOnly = true)
    public List<CaseDto> getInstitutionCaseHistory(Long institutionId) {
        if (!institutionRepository.existsById(institutionId)) {
            throw new ResourceNotFoundException("Institution not found with ID: " + institutionId);
        }

        List<CaseEntity> cases = caseRepository.findByInstitutionIdOrderByReceiptDateDesc(institutionId);
        return cases.stream().map(caseService::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OverlapAlertDto> getInstitutionOverlaps(Long institutionId) {
        if (!institutionRepository.existsById(institutionId)) {
            throw new ResourceNotFoundException("Institution not found with ID: " + institutionId);
        }
        return overlapService.getOverlapsForInstitution(institutionId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInstitutionStats(Long institutionId) {
        List<CaseEntity> cases = caseRepository.findByInstitutionIdOrderByReceiptDateDesc(institutionId);
        Map<String, Long> bureauCounts = new HashMap<>();
        long active = 0;
        long disposed = 0;

        for (CaseEntity c : cases) {
            String bCode = c.getBureau().getCode();
            bureauCounts.put(bCode, bureauCounts.getOrDefault(bCode, 0L) + 1);

            if ("DISPOSED".equalsIgnoreCase(c.getStatus())) {
                disposed++;
            } else {
                active++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCases", cases.size());
        stats.put("activeCases", active);
        stats.put("disposedCases", disposed);
        stats.put("bureauDistribution", bureauCounts);
        return stats;
    }

    public InstitutionDto mapToDto(Institution inst) {
        InstitutionDto dto = new InstitutionDto();
        dto.setId(inst.getId());
        dto.setPermanentId(inst.getPermanentId());
        dto.setName(inst.getName());
        dto.setRegion(inst.getRegion());
        dto.setState(inst.getState());
        dto.setCity(inst.getCity());
        dto.setAddress(inst.getAddress());
        dto.setInstitutionType(inst.getInstitutionType());
        dto.setApprovalStatus(inst.getApprovalStatus());
        dto.setContactEmail(inst.getContactEmail());
        dto.setContactPhone(inst.getContactPhone());
        dto.setIsVerified(inst.getIsVerified());
        dto.setCreatedAt(inst.getCreatedAt());

        // Compute case counts
        List<CaseEntity> cases = caseRepository.findByInstitutionIdOrderByReceiptDateDesc(inst.getId());
        dto.setTotalCases(cases.size());
        dto.setActiveCases(cases.stream().filter(c -> !"DISPOSED".equalsIgnoreCase(c.getStatus())).count());
        dto.setDisposedCases(cases.stream().filter(c -> "DISPOSED".equalsIgnoreCase(c.getStatus())).count());

        return dto;
    }
}
