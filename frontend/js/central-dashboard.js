/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Dashboard 1: Central Monitoring Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Guard page access: Central Monitor and Sys Admin
    if (!Auth.checkPageAccess(['CENTRAL_MONITOR', 'SYS_ADMIN'])) {
        return;
    }

    let bureauChart = null;
    let trendsChart = null;

    // Elements
    const refreshBtn = document.getElementById('refreshBtn');

    // KPI Elements
    const kpiTotal = document.getElementById('kpiTotal');
    const kpiPending = document.getElementById('kpiPending');
    const kpiUnderProcess = document.getElementById('kpiUnderProcess');
    const kpiDisposed = document.getElementById('kpiDisposed');
    const kpiTransferred = document.getElementById('kpiTransferred');
    const kpiOverdue = document.getElementById('kpiOverdue');
    const kpiOverlaps = document.getElementById('kpiOverlaps');

    // Alert List Containers
    const overdueList = document.getElementById('overdueList');
    const overlapList = document.getElementById('overlapList');
    const overdueCountBadge = document.getElementById('overdueCountBadge');
    const overlapCountBadge = document.getElementById('overlapCountBadge');

    /**
     * Load Central KPIs from Backend
     */
    async function loadKpis() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.CENTRAL_KPIS);
            if (data) {
                if (kpiTotal) kpiTotal.textContent = data.totalCases || 0;
                if (kpiPending) kpiPending.textContent = data.pendingCases || 0;
                if (kpiUnderProcess) kpiUnderProcess.textContent = data.underProcessCases || 0;
                if (kpiDisposed) kpiDisposed.textContent = data.disposedCases || 0;
                if (kpiTransferred) kpiTransferred.textContent = data.transferredCases || 0;
                if (kpiOverdue) kpiOverdue.textContent = data.overdueCases || 0;
                if (kpiOverlaps) kpiOverlaps.textContent = data.potentialOverlaps || 0;
            }
        } catch (error) {
            Common.showToast('Failed to load Central KPI metrics: ' + error.message, 'error');
        }
    }

    /**
     * Load Bureau Workload Analytics & Render Chart.js
     */
    async function loadBureauWorkload() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.BUREAU_WORKLOAD);
            const ctx = document.getElementById('bureauWorkloadChart');
            if (!ctx) return;

            const labels = [];
            const receivedData = [];
            const underProcessData = [];
            const disposedData = [];
            const overdueData = [];

            if (Array.isArray(data)) {
                data.forEach(item => {
                    labels.push(item.bureauCode + ' - ' + item.bureauName);
                    receivedData.push(item.receivedCases);
                    underProcessData.push(item.underProcessCases);
                    disposedData.push(item.disposedCases);
                    overdueData.push(item.overdueCases);
                });
            }

            if (bureauChart) {
                bureauChart.destroy();
            }

            bureauChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Received',
                            data: receivedData,
                            backgroundColor: '#3b82f6'
                        },
                        {
                            label: 'Under Process',
                            data: underProcessData,
                            backgroundColor: '#f59e0b'
                        },
                        {
                            label: 'Disposed',
                            data: disposedData,
                            backgroundColor: '#10b981'
                        },
                        {
                            label: 'Overdue',
                            data: overdueData,
                            backgroundColor: '#ef4444'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            });
        } catch (error) {
            Common.showToast('Failed to load Bureau workload chart: ' + error.message, 'error');
        }
    }

    /**
     * Load Monthly Trends Analytics & Render Chart.js
     */
    async function loadMonthlyTrends() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.MONTHLY_TRENDS);
            const ctx = document.getElementById('monthlyTrendsChart');
            if (!ctx) return;

            if (trendsChart) {
                trendsChart.destroy();
            }

            trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data && data.labels ? data.labels : [],
                    datasets: [
                        {
                            label: 'New Grievances (Inflow)',
                            data: data && data.inflowCounts ? data.inflowCounts : [],
                            borderColor: '#1d4ed8',
                            backgroundColor: 'rgba(29, 78, 216, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Disposed Grievances',
                            data: data && data.disposalCounts ? data.disposalCounts : [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            });
        } catch (error) {
            Common.showToast('Failed to load monthly trends: ' + error.message, 'error');
        }
    }

    /**
     * Load Alert Queues (Overdue Cases & Cross-Bureau Overlaps)
     */
    async function loadAlerts() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.ALERTS);

            // Render Overdue Cases
            if (overdueList) {
                const overdueCases = (data && data.overdueCases) ? data.overdueCases : [];
                if (overdueCountBadge) overdueCountBadge.textContent = data.totalOverdueCount || overdueCases.length;

                if (overdueCases.length === 0) {
                    overdueList.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>No overdue grievances pending.</p></div>`;
                } else {
                    overdueList.innerHTML = overdueCases.map(c => `
                        <div class="alert-item">
                            <div class="alert-item-header">
                                <span class="alert-item-id">${Common.escapeHtml(c.caseNumber)}</span>
                                ${Common.getPriorityBadge(c.priority)}
                            </div>
                            <div class="alert-item-title">${Common.escapeHtml(c.title)}</div>
                            <div class="alert-item-meta">
                                <span>🏛️ ${Common.escapeHtml(c.institutionName)} (${Common.escapeHtml(c.permanentId)})</span>
                                <span>🏢 Bureau: <strong>${Common.escapeHtml(c.bureauCode)}</strong></span>
                                <span style="color:#ef4444;font-weight:600;">⚠️ Deadline: ${Common.formatDate(c.expectedDisposalDate)}</span>
                                <button class="btn btn-secondary btn-sm" onclick="inspectCase(${c.id})">Inspect Case</button>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Render Cross-Bureau Overlap Alerts
            if (overlapList) {
                const overlapAlerts = (data && data.overlapAlerts) ? data.overlapAlerts : [];
                if (overlapCountBadge) overlapCountBadge.textContent = data.totalOverlapCount || overlapAlerts.length;

                if (overlapAlerts.length === 0) {
                    overlapList.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>No active cross-Bureau overlaps detected.</p></div>`;
                } else {
                    overlapList.innerHTML = overlapAlerts.map(o => `
                        <div class="alert-item overlap-item">
                            <div class="alert-item-header">
                                <span style="font-size:0.75rem;font-weight:700;color:#ec4899;">CROSS-BUREAU OVERLAP ALERT #${o.id}</span>
                                <span class="badge" style="background:#fce7f3;color:#9d174d;">${Common.escapeHtml(o.status)}</span>
                            </div>
                            <div style="font-weight:700;font-size:0.85rem;color:var(--color-primary-navy);margin:4px 0;">
                                ${Common.escapeHtml(o.institutionName)} (AICTE ID: ${Common.escapeHtml(o.permanentId)})
                            </div>
                            <div class="overlap-cases-bridge">
                                <div class="overlap-side">
                                    <div><strong>${Common.escapeHtml(o.case1BureauCode)}</strong></div>
                                    <div style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(o.case1Number)}</div>
                                    <div style="font-size:0.7rem;color:var(--color-text-muted);">${Common.escapeHtml(o.case1Category)}</div>
                                </div>
                                <div class="overlap-vs">VS</div>
                                <div class="overlap-side" style="text-align:right;">
                                    <div><strong>${Common.escapeHtml(o.case2BureauCode)}</strong></div>
                                    <div style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(o.case2Number)}</div>
                                    <div style="font-size:0.7rem;color:var(--color-text-muted);">${Common.escapeHtml(o.case2Category)}</div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
                                <span style="font-size:0.72rem;color:var(--color-text-muted);">Detected: ${Common.formatDateTime(o.createdAt)}</span>
                                <button class="btn btn-primary btn-sm" onclick="openOverlapReviewModal(${o.id})">Review Overlap</button>
                            </div>
                        </div>
                    `).join('');
                }
            }

        } catch (error) {
            Common.showToast('Failed to load alerts: ' + error.message, 'error');
        }
    }

    /**
     * Inspect Case Details Modal (Read-Only national oversight for Central Monitor)
     */
    window.inspectCase = async function(caseId) {
        try {
            const caseData = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
            const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));

            document.getElementById('inspectCaseId').textContent = caseData.caseNumber;
            document.getElementById('inspectCaseTitle').textContent = caseData.title;
            document.getElementById('inspectInstName').textContent = caseData.institutionName + ' (' + caseData.permanentId + ')';
            document.getElementById('inspectBureau').textContent = caseData.bureauCode + ' - ' + caseData.bureauName;
            document.getElementById('inspectCategory').textContent = caseData.category;
            document.getElementById('inspectPriority').innerHTML = Common.getPriorityBadge(caseData.priority);
            document.getElementById('inspectStatus').innerHTML = Common.getStatusBadge(caseData.status, caseData.overdue);
            document.getElementById('inspectReceiptDate').textContent = Common.formatDate(caseData.receiptDate);
            document.getElementById('inspectExpectedDisposal').textContent = Common.formatDate(caseData.expectedDisposalDate);
            document.getElementById('inspectDescription').textContent = caseData.description;

            // Render Timeline
            const timelineContainer = document.getElementById('inspectTimeline');
            if (timelineContainer) {
                if (Array.isArray(history) && history.length > 0) {
                    timelineContainer.innerHTML = history.map(h => `
                        <div class="timeline-entry">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <div class="timeline-header">
                                    <span class="timeline-author">${Common.escapeHtml(h.userFullName || 'AICTE Official')} (${Common.escapeHtml(h.userRole || '')})</span>
                                    <span class="timeline-time">${Common.formatDateTime(h.createdAt)}</span>
                                </div>
                                <div class="timeline-remarks">${Common.escapeHtml(h.remarks)}</div>
                                ${h.nextAction ? `<div class="timeline-next-action">Next Action: ${Common.escapeHtml(h.nextAction)} (Due: ${Common.formatDate(h.nextActionDueDate)})</div>` : ''}
                            </div>
                        </div>
                    `).join('');
                } else {
                    timelineContainer.innerHTML = `<p style="color:var(--color-text-muted);font-size:0.85rem;">No historical actions logged yet.</p>`;
                }
            }

            Common.openModal('caseInspectModal');
        } catch (error) {
            Common.showToast('Could not inspect case: ' + error.message, 'error');
        }
    };

    /**
     * Overlap Review Modal
     */
    let currentReviewOverlapId = null;
    window.openOverlapReviewModal = async function(overlapId) {
        currentReviewOverlapId = overlapId;
        try {
            const overlap = await Api.get(CONFIG.ENDPOINTS.OVERLAP_DETAIL(overlapId));
            document.getElementById('reviewOverlapTitle').textContent = `Review Cross-Bureau Overlap Alert #${overlap.id}`;
            document.getElementById('reviewInstInfo').textContent = `${overlap.institutionName} (AICTE ID: ${overlap.permanentId})`;
            document.getElementById('reviewCase1Details').innerHTML = `
                <strong>${Common.escapeHtml(overlap.case1BureauCode)}</strong>: ${Common.escapeHtml(overlap.case1Number)}<br>
                <em>${Common.escapeHtml(overlap.case1Title)}</em><br>
                Status: ${Common.getStatusBadge(overlap.case1Status)}
            `;
            document.getElementById('reviewCase2Details').innerHTML = `
                <strong>${Common.escapeHtml(overlap.case2BureauCode)}</strong>: ${Common.escapeHtml(overlap.case2Number)}<br>
                <em>${Common.escapeHtml(overlap.case2Title)}</em><br>
                Status: ${Common.getStatusBadge(overlap.case2Status)}
            `;
            document.getElementById('overlapClassification').value = '';
            document.getElementById('overlapRemarks').value = '';

            Common.openModal('overlapReviewModal');
        } catch (error) {
            Common.showToast('Failed to load overlap details: ' + error.message, 'error');
        }
    };

    // Handle Overlap Review Submit
    const submitReviewBtn = document.getElementById('submitOverlapReviewBtn');
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', async () => {
            const classification = document.getElementById('overlapClassification').value;
            const remarks = document.getElementById('overlapRemarks').value.trim();

            if (!classification) {
                Common.showToast('Please select an overlap classification.', 'warning');
                return;
            }
            if (!remarks) {
                Common.showToast('Supervisory review remarks are mandatory.', 'warning');
                return;
            }

            try {
                submitReviewBtn.disabled = true;
                submitReviewBtn.textContent = 'Submitting...';

                await Api.patch(CONFIG.ENDPOINTS.REVIEW_OVERLAP(currentReviewOverlapId), {
                    classification: classification,
                    reviewRemarks: remarks
                });

                Common.showToast('Overlap alert successfully classified and logged!', 'success');
                Common.closeModal('overlapReviewModal');
                loadAlerts();
                loadKpis();
            } catch (error) {
                Common.showToast('Failed to submit overlap review: ' + error.message, 'error');
            } finally {
                submitReviewBtn.disabled = false;
                submitReviewBtn.textContent = 'Confirm Classification';
            }
        });
    }

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-close-modal');
            Common.closeModal(modalId);
        });
    });

    // Refresh action
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadKpis();
            loadBureauWorkload();
            loadMonthlyTrends();
            loadAlerts();
            Common.showToast('Dashboard refreshed with latest national data', 'info');
        });
    }

    // Initial Dashboard Load
    loadKpis();
    loadBureauWorkload();
    loadMonthlyTrends();
    loadAlerts();
});
