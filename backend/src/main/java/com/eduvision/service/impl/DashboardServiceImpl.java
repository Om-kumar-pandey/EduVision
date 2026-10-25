package com.eduvision.service.impl;

import com.eduvision.dto.response.ComplaintSummaryResponse;
import com.eduvision.dto.response.DashboardSummaryResponse;
import com.eduvision.entity.ComplaintStatus;
import com.eduvision.entity.Role;
import com.eduvision.repository.ComplaintRepository;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.ComplaintService;
import com.eduvision.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    private static final DateTimeFormatter LAST_UPDATED_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    public DashboardServiceImpl(ComplaintRepository complaintRepository, ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UserPrincipal currentUser) {
        DashboardSummaryResponse summary = new DashboardSummaryResponse();

        long total;
        long inProcess;
        long resolved;
        long rejected;
        long underReview;

        if (currentUser != null && currentUser.getRole() == Role.STUDENT) {
            Long userId = currentUser.getId();
            total = complaintRepository.countByComplainantId(userId);
            inProcess = complaintRepository.countByComplainantIdAndStatus(userId, ComplaintStatus.IN_PROCESS);
            resolved = complaintRepository.countByComplainantIdAndStatus(userId, ComplaintStatus.RESOLVED);
            rejected = complaintRepository.countByComplainantIdAndStatus(userId, ComplaintStatus.REJECTED);
            underReview = complaintRepository.countByComplainantIdAndStatus(userId, ComplaintStatus.UNDER_REVIEW);
        } else {
            // Admin, AICTE Officer, Institution Head view aggregate system stats
            total = complaintRepository.count();
            inProcess = complaintRepository.countByStatus(ComplaintStatus.IN_PROCESS);
            resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
            rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);
            underReview = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        }

        summary.setTotalComplaints(total);
        summary.setInProcessCount(inProcess);
        summary.setInProcessPct(calculatePercentage(inProcess, total));

        summary.setResolvedCount(resolved);
        summary.setResolvedPct(calculatePercentage(resolved, total));

        summary.setRejectedCount(rejected);
        summary.setRejectedPct(calculatePercentage(rejected, total));

        summary.setUnderReviewCount(underReview);
        summary.setUnderReviewPct(calculatePercentage(underReview, total));

        summary.setLastUpdated("Last Updated: " + LocalDateTime.now().format(LAST_UPDATED_FORMAT));

        List<ComplaintSummaryResponse> recent = complaintService.getRecentComplaints(currentUser);
        summary.setRecentComplaints(recent);

        return summary;
    }

    private String calculatePercentage(long count, long total) {
        if (total == 0) return "(0%)";
        long pct = Math.round(((double) count / total) * 100);
        return "(" + pct + "%)";
    }
}
