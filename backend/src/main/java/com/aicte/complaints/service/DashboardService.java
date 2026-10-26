package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.Bureau;
import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.OverlapAlert;
import com.aicte.complaints.entity.Region;
import com.aicte.complaints.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CaseRepository caseRepository;
    private final BureauRepository bureauRepository;
    private final OverlapAlertRepository overlapAlertRepository;
    private final TransferRequestRepository transferRequestRepository;
    private final CoordinationRequestRepository coordinationRequestRepository;
    private final RegionRepository regionRepository;
    private final OverlapService overlapService;

    public DashboardService(CaseRepository caseRepository,
                            BureauRepository bureauRepository,
                            OverlapAlertRepository overlapAlertRepository,
                            TransferRequestRepository transferRequestRepository,
                            CoordinationRequestRepository coordinationRequestRepository,
                            RegionRepository regionRepository,
                            OverlapService overlapService) {
        this.caseRepository = caseRepository;
        this.bureauRepository = bureauRepository;
        this.overlapAlertRepository = overlapAlertRepository;
        this.transferRequestRepository = transferRequestRepository;
        this.coordinationRequestRepository = coordinationRequestRepository;
        this.regionRepository = regionRepository;
        this.overlapService = overlapService;
    }

    @Transactional(readOnly = true)
    public CentralKpiDto getCentralKpis() {
        LocalDateTime now = LocalDateTime.now();
        CentralKpiDto kpi = new CentralKpiDto();

        kpi.setTotalCases(caseRepository.count());
        kpi.setPendingCases(caseRepository.countByStatus("RECEIVED"));
        kpi.setUnderProcessCases(caseRepository.countByStatus("UNDER_PROCESS"));
        kpi.setDisposedCases(caseRepository.countByStatus("DISPOSED"));
        kpi.setTransferredCases(transferRequestRepository.countByStatus("APPROVED"));
        kpi.setOverdueCases(caseRepository.countOverdueCases(now));
        kpi.setPotentialOverlaps(overlapAlertRepository.countByStatus("DETECTED"));
        kpi.setUnassignedCases(caseRepository.countUnassignedCases());
        kpi.setPendingApprovalRequests(transferRequestRepository.countByStatus("PENDING"));
        kpi.setPendingCoordinationRequests(coordinationRequestRepository.countByStatus("PENDING"));
        kpi.setCriticalEscalatedCases(caseRepository.countByPriorityAndStatusNot("URGENT", "DISPOSED"));

        return kpi;
    }

    @Transactional(readOnly = true)
    public List<BureauWorkloadDto> getBureauWorkloads() {
        List<Bureau> bureaus = bureauRepository.findByIsActiveTrue();
        List<BureauWorkloadDto> workloads = new ArrayList<>();
        for (Bureau b : bureaus) {
            long total = caseRepository.countByBureauId(b.getId());
            long received = 0;
            long underProcess = 0;
            long disposed = 0;
            long overdue = 0;

            List<CaseEntity> bureauCases = caseRepository.searchCases(b.getId(), null, null, null, null, PageRequest.of(0, 1000)).getContent();
            for (CaseEntity c : bureauCases) {
                if ("RECEIVED".equalsIgnoreCase(c.getStatus())) received++;
                else if ("UNDER_PROCESS".equalsIgnoreCase(c.getStatus())) underProcess++;
                else if ("DISPOSED".equalsIgnoreCase(c.getStatus())) disposed++;

                if (c.isOverdue()) overdue++;
            }

            workloads.add(new BureauWorkloadDto(b.getId(), b.getCode(), b.getName(), total, received, underProcess, disposed, overdue));
        }

        return workloads;
    }

    @Transactional(readOnly = true)
    public MonthlyTrendDto getMonthlyTrends() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> inflowRows = caseRepository.countMonthlyInflow(sixMonthsAgo);
        List<Object[]> disposalRows = caseRepository.countMonthlyDisposal(sixMonthsAgo);

        Map<String, Long> inflowMap = new HashMap<>();
        for (Object[] row : inflowRows) {
            if (row[0] != null) inflowMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        Map<String, Long> disposalMap = new HashMap<>();
        for (Object[] row : disposalRows) {
            if (row[0] != null) disposalMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        List<String> labels = new ArrayList<>();
        List<Long> inflowList = new ArrayList<>();
        List<Long> disposalList = new ArrayList<>();

        YearMonth current = YearMonth.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String ymStr = ym.format(formatter);
            labels.add(ymStr);
            inflowList.add(inflowMap.getOrDefault(ymStr, 0L));
            disposalList.add(disposalMap.getOrDefault(ymStr, 0L));
        }

        return new MonthlyTrendDto(labels, inflowList, disposalList);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRegionDistribution() {
        List<Region> regions = regionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Region r : regions) {
            long total = caseRepository.countByInstitutionRegion(r.getName());
            long active = caseRepository.countActiveByInstitutionRegion(r.getName());
            long overdue = caseRepository.countOverdueByInstitutionRegion(r.getName(), now);
            long disposed = caseRepository.countDisposedByInstitutionRegion(r.getName());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("regionName", r.getName());
            map.put("regionCode", r.getCode());
            map.put("totalCases", total);
            map.put("activeCases", active);
            map.put("overdueCases", overdue);
            map.put("disposedCases", disposed);
            list.add(map);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAlertsSummary() {
        LocalDateTime now = LocalDateTime.now();
        List<CaseEntity> overdueCases = caseRepository.findOverdueCases(now, PageRequest.of(0, 10));
        List<OverlapAlert> activeOverlaps = overlapAlertRepository.findAllWithFilter("DETECTED", PageRequest.of(0, 10)).getContent();

        List<CaseDto> overdueDtos = overdueCases.stream().map(this::mapCaseToDto).collect(Collectors.toList());
        List<OverlapAlertDto> overlapDtos = activeOverlaps.stream().map(overlapService::mapToDto).collect(Collectors.toList());

        Map<String, Object> alerts = new HashMap<>();
        alerts.put("overdueCases", overdueDtos);
        alerts.put("overlapAlerts", overlapDtos);
        alerts.put("totalOverdueCount", caseRepository.countOverdueCases(now));
        alerts.put("totalOverlapCount", overlapAlertRepository.countByStatus("DETECTED"));

        return alerts;
    }

    public CaseDto mapCaseToDto(CaseEntity c) {
        CaseDto dto = new CaseDto();
        dto.setId(c.getId());
        dto.setCaseNumber(c.getCaseNumber());
        dto.setSourceCaseId(c.getSourceCaseId());
        if (c.getInstitution() != null) {
            dto.setInstitutionId(c.getInstitution().getId());
            dto.setInstitutionName(c.getInstitution().getName());
            dto.setPermanentId(c.getInstitution().getPermanentId());
            dto.setRegion(c.getInstitution().getRegion());
            dto.setState(c.getInstitution().getState());
            dto.setCity(c.getInstitution().getCity());
        }
        if (c.getBureau() != null) {
            dto.setBureauId(c.getBureau().getId());
            dto.setBureauCode(c.getBureau().getCode());
            dto.setBureauName(c.getBureau().getName());
        }
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setPriority(c.getPriority());
        dto.setStatus(c.getStatus());
        dto.setReceiptDate(c.getReceiptDate());
        dto.setExpectedDisposalDate(c.getExpectedDisposalDate());
        dto.setDisposedDate(c.getDisposedDate());
        dto.setOverdue(c.isOverdue());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
