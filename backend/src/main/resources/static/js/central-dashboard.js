/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Senior Authority Supervisory Monitoring & Governance Console Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. Support Direct Auth Token or Demo Auto-Bootstrap for Testing
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    const userProfileParam = urlParams.get('user_profile');

    if (authToken) {
        localStorage.setItem(CONFIG.TOKEN_KEY, authToken);
        if (userProfileParam) {
            try {
                localStorage.setItem(CONFIG.USER_KEY, decodeURIComponent(userProfileParam));
            } catch (e) {
                // Ignore parse error
            }
        } else {
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({
                id: 2,
                fullName: 'Smt. Sunita Verma',
                email: 'monitor@aicte.gov.in',
                role: 'CENTRAL_MONITOR',
                designation: 'Director, Central Monitoring & Quality Assurance'
            }));
        }
    } else if (urlParams.get('demo') === 'true' && !Auth.isAuthenticated()) {
        localStorage.setItem(CONFIG.TOKEN_KEY, 'demo_jwt_token_senior');
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({
            id: 2,
            fullName: 'Smt. Sunita Verma',
            email: 'monitor@aicte.gov.in',
            role: 'CENTRAL_MONITOR',
            designation: 'Director, Central Monitoring & Quality Assurance'
        }));
    }

    // Guard page access: Central Monitor, Senior Authority, and Sys Admin
    if (!Auth.checkPageAccess(['CENTRAL_MONITOR', 'SENIOR_AUTHORITY', 'SYS_ADMIN'])) {
        return;
    }

    // Chart instances & Module State
    let bureauChart = null;
    let trendsChart = null;
    let statusDonutChart = null;
    let regionDistChart = null;
    let casesCurrentPage = 0;
    const casesPageSize = 10;
    let currentReviewOverlapId = null;

    // Cache user info
    const currentUser = Auth.getUser();
    if (currentUser) {
        const headerUserName = document.getElementById('headerUserName');
        const headerUserRole = document.getElementById('headerUserRole');
        const headerUserAvatar = document.getElementById('headerUserAvatar');
        if (headerUserName) headerUserName.textContent = currentUser.fullName || 'Smt. Sunita Verma';
        if (headerUserRole) headerUserRole.textContent = currentUser.designation || 'Senior Authority (Director)';
        if (headerUserAvatar) headerUserAvatar.textContent = (currentUser.fullName ? currentUser.fullName[0] : 'S').toUpperCase();
    }

    // ========================================================
    // TAB PANE SWITCHING SYSTEM
    // ========================================================
    window.switchToTab = function(tabId, initialFilters = {}) {
        // Deactivate all nav links and tab panes
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Activate matching nav link
        const targetLink = document.querySelector(`.sidebar-nav .nav-link[data-tab-target="${tabId}"]`);
        if (targetLink) targetLink.classList.add('active');

        // Activate target pane
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (backdrop) backdrop.classList.remove('active');
        }

        // Trigger corresponding pane data loader
        switch (tabId) {
            case 'paneDashboard':
                loadDashboardData();
                break;
            case 'paneAllCases':
                if (initialFilters.status) {
                    const statusSel = document.getElementById('caseFilterStatus');
                    if (statusSel) statusSel.value = initialFilters.status;
                }
                loadAllCases(0);
                break;
            case 'paneOverlaps':
                loadOverlaps(0);
                break;
            case 'paneCoordination':
                loadCoordinations(0);
                break;
            case 'paneEscalations':
                loadEscalations();
                break;
            case 'paneApprovals':
                loadApprovals(0);
                break;
            case 'paneInstitutions':
                loadInstitutions(0);
                break;
            case 'paneBureauPerformance':
                loadBureauPerformance();
                break;
            case 'paneReports':
                // Reports ready on demand
                break;
            case 'paneActivityHistory':
                loadActivityHistory(0);
                break;
        }
    };

    // Sidebar tab clicks
    document.querySelectorAll('.sidebar-nav [data-tab-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab-target');
            switchToTab(tabId);
        });
    });

    // Mobile sidebar toggle
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');
    if (mobileSidebarToggle && sidebar) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
        });
    }
    if (sidebarBackdrop && sidebar) {
        sidebarBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarBackdrop.classList.remove('active');
        });
    }

    // Notification dropdown toggle
    const btnSeniorNotifToggle = document.getElementById('btnSeniorNotifToggle');
    const seniorNotifDropdown = document.getElementById('seniorNotifDropdown');
    if (btnSeniorNotifToggle && seniorNotifDropdown) {
        btnSeniorNotifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            seniorNotifDropdown.style.display = seniorNotifDropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', () => {
            seniorNotifDropdown.style.display = 'none';
        });
    }

    // ========================================================
    // MODULE 1: EXECUTIVE DASHBOARD OVERVIEW & KPIS
    // ========================================================
    async function loadKpis() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.CENTRAL_KPIS);
            if (data) {
                // Populate all 10 KPI Cards
                setElText('kpiTotal', data.totalCases || 0);
                setElText('kpiPending', data.pendingCases || 0);
                setElText('kpiUnderProcess', data.underProcessCases || 0);
                setElText('kpiDisposed', data.disposedCases || 0);
                setElText('kpiOverdue', data.overdueCases || 0);
                setElText('kpiUnassigned', data.unassignedCases || 0);
                setElText('kpiApprovals', data.pendingApprovalRequests || 0);
                setElText('kpiOverlaps', data.potentialOverlaps || 0);
                setElText('kpiCoordinations', data.pendingCoordinationRequests || 0);
                setElText('kpiCritical', data.criticalEscalatedCases || 0);

                // Update sidebar badges
                setElText('badgeAllCasesCount', data.totalCases || 0);
                setElText('badgeOverlapsCount', data.potentialOverlaps || 0);
                setElText('badgeCoordCount', data.pendingCoordinationRequests || 0);
                setElText('badgeEscalationCount', data.overdueCases || 0);
                setElText('badgeApprovalCount', data.pendingApprovalRequests || 0);
                setElText('headerNotifBadge', (data.overdueCases || 0) + (data.potentialOverlaps || 0));

                // Populate notification dropdown list
                const seniorNotifList = document.getElementById('seniorNotifList');
                if (seniorNotifList) {
                    seniorNotifList.innerHTML = `
                        <div style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
                            <strong style="color:#ef4444;">⚠️ ${data.overdueCases || 0} Overdue Cases</strong> exceeding SLA deadlines.
                        </div>
                        <div style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
                            <strong style="color:#ec4899;">⚡ ${data.potentialOverlaps || 0} Overlap Alerts</strong> requiring supervisory review.
                        </div>
                        <div style="padding:6px 0;">
                            <strong style="color:#06b6d4;">🔄 ${data.pendingApprovalRequests || 0} Transfer Requests</strong> awaiting approval.
                        </div>
                    `;
                }
            }
        } catch (error) {
            Common.showToast('Failed to load Central KPI metrics: ' + error.message, 'error');
        }
    }

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
                    labels.push(item.bureauCode);
                    receivedData.push(item.receivedCases || 0);
                    underProcessData.push(item.underProcessCases || 0);
                    disposedData.push(item.disposedCases || 0);
                    overdueData.push(item.overdueCases || 0);
                });
            }

            if (bureauChart) bureauChart.destroy();

            bureauChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Scrutiny / Received', data: receivedData, backgroundColor: '#3b82f6' },
                        { label: 'Under Inquiries', data: underProcessData, backgroundColor: '#f59e0b' },
                        { label: 'Disposed', data: disposedData, backgroundColor: '#10b981' },
                        { label: 'Overdue Backlog', data: overdueData, backgroundColor: '#ef4444' }
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
            console.error('Failed to load Bureau workload chart:', error);
        }
    }

    async function loadMonthlyTrends() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.MONTHLY_TRENDS);
            const ctx = document.getElementById('monthlyTrendsChart');
            if (!ctx) return;

            if (trendsChart) trendsChart.destroy();

            trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data && data.labels ? data.labels : [],
                    datasets: [
                        {
                            label: 'New Grievances (Inflow)',
                            data: data && data.inflowCounts ? data.inflowCounts : [],
                            borderColor: '#1d4ed8',
                            backgroundColor: 'rgba(29, 78, 216, 0.12)',
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2
                        },
                        {
                            label: 'Disposed Grievances',
                            data: data && data.disposalCounts ? data.disposalCounts : [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2
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
            console.error('Failed to load monthly trends:', error);
        }
    }

    async function loadStatusDonutChart() {
        try {
            const kpis = await Api.get(CONFIG.ENDPOINTS.CENTRAL_KPIS);
            const ctx = document.getElementById('statusDonutChart');
            if (!ctx || !kpis) return;

            if (statusDonutChart) statusDonutChart.destroy();

            statusDonutChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Received / Scrutiny', 'Under Inquiries', 'Disposed / Closed', 'Overdue'],
                    datasets: [{
                        data: [
                            kpis.pendingCases || 0,
                            kpis.underProcessCases || 0,
                            kpis.disposedCases || 0,
                            kpis.overdueCases || 0
                        ],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load status donut chart:', error);
        }
    }

    async function loadRegionDistributionChart() {
        try {
            const data = await Api.get('/dashboard/region-distribution');
            const ctx = document.getElementById('regionDistributionChart');
            if (!ctx) return;

            const labels = [];
            const counts = [];

            if (Array.isArray(data)) {
                data.forEach(r => {
                    labels.push(r.regionName ? r.regionName.replace(' Region', '') : 'Unknown');
                    counts.push(r.totalCases || 0);
                });
            }

            if (regionDistChart) regionDistChart.destroy();

            regionDistChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Registered Complaints',
                        data: counts,
                        backgroundColor: '#0284c7',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load regional distribution chart:', error);
        }
    }

    async function loadAlerts() {
        try {
            const data = await Api.get(CONFIG.ENDPOINTS.ALERTS);
            const overdueList = document.getElementById('overdueList');
            const overlapList = document.getElementById('overlapList');
            const overdueCountBadge = document.getElementById('overdueCountBadge');
            const overlapCountBadge = document.getElementById('overlapCountBadge');

            // Render Overdue Cases
            if (overdueList) {
                const overdueCases = (data && data.overdueCases) ? data.overdueCases : [];
                if (overdueCountBadge) overdueCountBadge.textContent = data.totalOverdueCount || overdueCases.length;

                if (overdueCases.length === 0) {
                    overdueList.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>No overdue grievances pending national SLA.</p></div>`;
                } else {
                    overdueList.innerHTML = overdueCases.map(c => `
                        <div class="alert-item">
                            <div class="alert-item-header">
                                <span class="alert-item-id">${Common.escapeHtml(c.caseNumber)}</span>
                                ${Common.getPriorityBadge(c.priority)}
                            </div>
                            <div class="alert-item-title">${Common.escapeHtml(c.title)}</div>
                            <div class="alert-item-meta">
                                <span>🏛️ ${Common.escapeHtml(c.institutionName || 'Campus')} (${Common.escapeHtml(c.permanentId || '')})</span>
                                <span>🏢 Bureau: <strong>${Common.escapeHtml(c.bureauCode || 'HQ')}</strong></span>
                                <span style="color:#ef4444;font-weight:600;">⚠️ Deadline: ${Common.formatDate(c.expectedDisposalDate)}</span>
                                <button class="btn btn-secondary btn-sm" onclick="inspectCase(${c.id})" style="margin-left:auto;">Inspect Case</button>
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
                                <span class="badge" style="background:#fce7f3;color:#9d174d;">${Common.escapeHtml(o.status || 'DETECTED')}</span>
                            </div>
                            <div style="font-weight:700;font-size:0.85rem;color:var(--color-primary-navy);margin:4px 0;">
                                ${Common.escapeHtml(o.institutionName)} (AICTE ID: ${Common.escapeHtml(o.permanentId)})
                            </div>
                            <div class="overlap-cases-bridge">
                                <div class="overlap-side">
                                    <div><strong>${Common.escapeHtml(o.case1BureauCode || 'RB')}</strong></div>
                                    <div style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(o.case1Number)}</div>
                                </div>
                                <div class="overlap-vs">VS</div>
                                <div class="overlap-side" style="text-align:right;">
                                    <div><strong>${Common.escapeHtml(o.case2BureauCode || 'PGRC')}</strong></div>
                                    <div style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(o.case2Number)}</div>
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
            console.error('Failed to load alerts:', error);
        }
    }

    function loadDashboardData() {
        loadKpis();
        loadBureauWorkload();
        loadMonthlyTrends();
        loadStatusDonutChart();
        loadRegionDistributionChart();
        loadAlerts();
    }

    // Refresh Dashboard button
    const btnRefreshDashboard = document.getElementById('btnRefreshDashboard');
    if (btnRefreshDashboard) {
        btnRefreshDashboard.addEventListener('click', () => {
            loadDashboardData();
            Common.showToast('National dashboard refreshed with latest records', 'info');
        });
    }

    // Filter toolbar buttons
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    if (btnApplyFilters) {
        btnApplyFilters.addEventListener('click', () => {
            loadBureauWorkload();
            Common.showToast('Analytics filtered successfully', 'info');
        });
    }
    const btnResetFilters = document.getElementById('btnResetFilters');
    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            document.getElementById('filterBureau').value = '';
            document.getElementById('filterStatus').value = '';
            document.getElementById('filterPriority').value = '';
            loadDashboardData();
        });
    }

    // ========================================================
    // MODULE 2: ALL CASES / CASE MONITORING QUEUE
    // ========================================================
    async function loadAllCases(page = 0) {
        casesCurrentPage = page;
        const tbody = document.getElementById('allCasesTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        const bureauId = document.getElementById('caseFilterBureau').value || null;
        const status = document.getElementById('caseFilterStatus').value || null;
        const priority = document.getElementById('caseFilterPriority').value || null;
        const query = (document.getElementById('caseSearchInput').value || '').trim();

        let endpoint = `/cases/queue?page=${page}&size=${casesPageSize}&sortBy=receiptDate&sortDir=DESC`;
        if (bureauId) endpoint += `&bureauId=${bureauId}`;
        if (status) endpoint += `&status=${encodeURIComponent(status)}`;
        if (priority) endpoint += `&priority=${encodeURIComponent(priority)}`;
        if (query) endpoint += `&query=${encodeURIComponent(query)}`;

        try {
            const data = await Api.get(endpoint);
            const cases = (data && data.content) ? data.content : [];
            const totalElements = data ? data.totalElements : 0;

            const paginationInfo = document.getElementById('casesPaginationInfo');
            if (paginationInfo) paginationInfo.textContent = `Showing ${cases.length} of ${totalElements} national cases (Page ${page + 1} of ${data ? data.totalPages : 1})`;

            const prevBtn = document.getElementById('btnCasesPrevPage');
            const nextBtn = document.getElementById('btnCasesNextPage');
            if (prevBtn) prevBtn.disabled = page <= 0;
            if (nextBtn) nextBtn.disabled = data ? data.last : true;

            if (cases.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748b;">No complaints matching the criteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = cases.map(c => `
                <tr>
                    <td>
                        <span class="case-id-cell">${Common.escapeHtml(c.caseNumber)}</span>
                        ${c.sourceCaseId ? `<div style="font-size:0.7rem; color:#64748b;">Src: ${Common.escapeHtml(c.sourceCaseId)}</div>` : ''}
                    </td>
                    <td>
                        <div style="font-weight:600; color:#04244a;">${Common.escapeHtml(c.title)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${Common.escapeHtml(c.category)}</div>
                    </td>
                    <td>
                        <div>${Common.escapeHtml(c.institutionName || 'Campus')}</div>
                        <div style="font-size:0.72rem; color:#64748b;">AICTE ID: ${Common.escapeHtml(c.permanentId || '—')} &bull; ${Common.escapeHtml(c.region || 'HQ')}</div>
                    </td>
                    <td><span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${Common.escapeHtml(c.bureauCode || 'HQ')}</span></td>
                    <td>${Common.getPriorityBadge(c.priority)}</td>
                    <td>${Common.getStatusBadge(c.status, c.overdue)}</td>
                    <td style="font-size:0.78rem;">${Common.formatDate(c.receiptDate)}</td>
                    <td style="font-size:0.78rem; font-weight:600; color:${c.overdue ? '#ef4444' : '#334155'};">
                        ${Common.formatDate(c.expectedDisposalDate)}
                    </td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-secondary btn-sm" onclick="inspectCase(${c.id})">Inspect</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#ef4444;">Failed to load cases: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    // Case Search & Filter Handlers
    const btnApplyCaseSearch = document.getElementById('btnApplyCaseSearch');
    if (btnApplyCaseSearch) btnApplyCaseSearch.addEventListener('click', () => loadAllCases(0));
    const btnResetCaseSearch = document.getElementById('btnResetCaseSearch');
    if (btnResetCaseSearch) {
        btnResetCaseSearch.addEventListener('click', () => {
            document.getElementById('caseSearchInput').value = '';
            document.getElementById('caseFilterBureau').value = '';
            document.getElementById('caseFilterStatus').value = '';
            document.getElementById('caseFilterPriority').value = '';
            loadAllCases(0);
        });
    }
    const btnCasesPrevPage = document.getElementById('btnCasesPrevPage');
    if (btnCasesPrevPage) btnCasesPrevPage.addEventListener('click', () => { if (casesCurrentPage > 0) loadAllCases(casesCurrentPage - 1); });
    const btnCasesNextPage = document.getElementById('btnCasesNextPage');
    if (btnCasesNextPage) btnCasesNextPage.addEventListener('click', () => loadAllCases(casesCurrentPage + 1));

    // Export All Cases CSV
    const btnExportAllCasesCSV = document.getElementById('btnExportAllCasesCSV');
    if (btnExportAllCasesCSV) {
        btnExportAllCasesCSV.addEventListener('click', async () => {
            try {
                const data = await Api.get('/cases/queue?page=0&size=500&sortBy=receiptDate&sortDir=DESC');
                const cases = (data && data.content) ? data.content : [];
                if (cases.length === 0) {
                    Common.showToast('No case records available to export.', 'warning');
                    return;
                }
                const headers = ['Case Number', 'Title', 'Institution', 'Permanent ID', 'Bureau', 'Category', 'Priority', 'Status', 'Overdue', 'Receipt Date', 'Expected Disposal'];
                const rows = cases.map(c => [
                    c.caseNumber,
                    `"${(c.title || '').replace(/"/g, '""')}"`,
                    `"${(c.institutionName || '').replace(/"/g, '""')}"`,
                    c.permanentId || '',
                    c.bureauCode || '',
                    `"${(c.category || '').replace(/"/g, '""')}"`,
                    c.priority || '',
                    c.status || '',
                    c.overdue ? 'YES' : 'NO',
                    c.receiptDate ? c.receiptDate.substring(0, 10) : '',
                    c.expectedDisposalDate ? c.expectedDisposalDate.substring(0, 10) : ''
                ]);
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `AICTE_National_Cases_Audit_${new Date().toISOString().substring(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Common.showToast('Cases exported successfully to CSV!', 'success');
            } catch (err) {
                Common.showToast('Export failed: ' + err.message, 'error');
            }
        });
    }

    // ========================================================
    // MODULE 3: OVERLAPPING CASES SUITE
    // ========================================================
    async function loadOverlaps(page = 0) {
        const tbody = document.getElementById('overlapsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        const status = document.getElementById('overlapFilterStatus').value || null;
        const decision = document.getElementById('overlapFilterClassification').value || null;

        let endpoint = `/overlaps?page=${page}&size=20`;
        if (status) endpoint += `&status=${encodeURIComponent(status)}`;
        if (decision) endpoint += `&decisionStatus=${encodeURIComponent(decision)}`;

        try {
            const data = await Api.get(endpoint);
            const alerts = (data && data.content) ? data.content : [];

            if (alerts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748b;">No overlap alerts logged.</td></tr>`;
                return;
            }

            tbody.innerHTML = alerts.map(o => `
                <tr>
                    <td><strong style="color:#ec4899;">ALERT #${o.id}</strong></td>
                    <td>
                        <div style="font-weight:700; color:#04244a;">${Common.escapeHtml(o.institutionName)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">AICTE ID: ${Common.escapeHtml(o.permanentId)}</div>
                    </td>
                    <td>
                        <div><strong style="color:#1d4ed8;">${Common.escapeHtml(o.case1BureauCode)}</strong>: ${Common.escapeHtml(o.case1Number)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${Common.escapeHtml(o.case1Title)}</div>
                    </td>
                    <td>
                        <div><strong style="color:#10b981;">${Common.escapeHtml(o.case2BureauCode)}</strong>: ${Common.escapeHtml(o.case2Number)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${Common.escapeHtml(o.case2Title)}</div>
                    </td>
                    <td>
                        <div style="font-weight:800; font-size:1rem; color:#04244a;">${o.similarityScore}%</div>
                    </td>
                    <td>
                        <span class="badge" style="background:${o.reviewBand === 'HIGH' ? '#fecaca' : o.reviewBand === 'MEDIUM' ? '#fed7aa' : '#e2e8f0'}; color:#04244a; font-weight:700;">
                            ${Common.escapeHtml(o.reviewBand || 'MEDIUM')}
                        </span>
                    </td>
                    <td>${Common.getStatusBadge(o.status)}</td>
                    <td>
                        <span class="badge" style="background:#f1f5f9; color:#04244a; font-weight:600;">
                            ${Common.escapeHtml(o.classification || o.decisionStatus || 'AWAITING_REVIEW')}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="openOverlapReviewModal(${o.id})">Supervisory Review</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#ef4444;">Failed to load overlaps: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    const btnFilterOverlaps = document.getElementById('btnFilterOverlaps');
    if (btnFilterOverlaps) btnFilterOverlaps.addEventListener('click', () => loadOverlaps(0));

    const btnReanalyzeOverlaps = document.getElementById('btnReanalyzeOverlaps');
    if (btnReanalyzeOverlaps) {
        btnReanalyzeOverlaps.addEventListener('click', async () => {
            btnReanalyzeOverlaps.disabled = true;
            btnReanalyzeOverlaps.textContent = '🔄 Re-analyzing...';
            try {
                await Api.post('/overlaps/reanalyze', {});
                Common.showToast('Re-analyzed complaints with hybrid overlap matching engine!', 'success');
                loadOverlaps(0);
                loadKpis();
            } catch (err) {
                Common.showToast('Re-analysis failed: ' + err.message, 'error');
            } finally {
                btnReanalyzeOverlaps.disabled = false;
                btnReanalyzeOverlaps.textContent = '🔄 Re-Analyze All Complaints';
            }
        });
    }

    // ========================================================
    // MODULE 4: CROSS-BUREAU COORDINATION
    // ========================================================
    async function loadCoordinations(page = 0) {
        const tbody = document.getElementById('coordinationTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        try {
            const data = await Api.get(`/coordination-requests?page=${page}&size=15`);
            const requests = (data && data.content) ? data.content : [];

            if (requests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748b;">No active Cross-Bureau Coordination requests logged.</td></tr>`;
                return;
            }

            tbody.innerHTML = requests.map(r => `
                <tr>
                    <td><strong style="color:#f97316;">${Common.escapeHtml(r.requestNumber || '#' + r.id)}</strong></td>
                    <td><span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:700;">${Common.escapeHtml(r.initiatingBureauCode)}</span></td>
                    <td><span class="badge" style="background:#dcfce7; color:#166534; font-weight:700;">${Common.escapeHtml(r.targetBureauCode)}</span></td>
                    <td><span class="case-id-cell">${Common.escapeHtml(r.primaryCaseNumber)}</span></td>
                    <td><span class="case-id-cell">${Common.escapeHtml(r.linkedCaseNumber || '—')}</span></td>
                    <td>
                        <div style="font-size:0.82rem; color:#334155; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${Common.escapeHtml(r.reason)}">
                            ${Common.escapeHtml(r.reason)}
                        </div>
                    </td>
                    <td style="font-size:0.78rem; font-weight:600;">${Common.formatDate(r.deadline)}</td>
                    <td>${Common.getStatusBadge(r.status)}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="inspectCase(${r.primaryCaseId})">Inspect Case</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#ef4444;">Failed to load coordination requests: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    // Modal to Initiate Coordination
    const btnOpenInitiateCoordModal = document.getElementById('btnOpenInitiateCoordModal');
    if (btnOpenInitiateCoordModal) {
        btnOpenInitiateCoordModal.addEventListener('click', async () => {
            // Load active cases into dropdowns
            try {
                const casesData = await Api.get('/cases/queue?page=0&size=50&status=UNDER_PROCESS');
                const cases = (casesData && casesData.content) ? casesData.content : [];

                const primarySel = document.getElementById('coordPrimaryCaseSelect');
                const linkedSel = document.getElementById('coordLinkedCaseSelect');

                if (primarySel && linkedSel) {
                    const options = cases.map(c => `<option value="${c.id}">${c.caseNumber} - ${c.bureauCode}: ${c.title.substring(0, 40)} (${c.institutionName})</option>`).join('');
                    primarySel.innerHTML = `<option value="">-- Select Primary Case --</option>` + options;
                    linkedSel.innerHTML = `<option value="">-- Select Linked Case --</option>` + options;
                }

                // Default deadline to 14 days from today
                const deadlineInput = document.getElementById('coordDeadline');
                if (deadlineInput) {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    deadlineInput.value = d.toISOString().substring(0, 10);
                }

                Common.openModal('initiateCoordModal');
            } catch (err) {
                Common.showToast('Failed to load active cases for coordination: ' + err.message, 'error');
            }
        });
    }

    const initiateCoordForm = document.getElementById('initiateCoordForm');
    if (initiateCoordForm) {
        initiateCoordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const primaryCaseId = document.getElementById('coordPrimaryCaseSelect').value;
            const linkedCaseId = document.getElementById('coordLinkedCaseSelect').value;
            const targetBureauId = document.getElementById('coordTargetBureauSelect').value;
            const deadline = document.getElementById('coordDeadline').value;
            const reason = document.getElementById('coordReason').value.trim();

            if (!primaryCaseId || !linkedCaseId || !targetBureauId || !reason) {
                Common.showToast('Please fill all required coordination fields.', 'warning');
                return;
            }

            try {
                await Api.post('/coordination-requests', {
                    primaryCaseId: parseInt(primaryCaseId),
                    linkedCaseId: parseInt(linkedCaseId),
                    targetBureauId: parseInt(targetBureauId),
                    deadline: deadline ? deadline + 'T18:00:00' : null,
                    reason: reason
                });

                Common.showToast('Cross-Bureau coordination request successfully submitted!', 'success');
                Common.closeModal('initiateCoordModal');
                loadCoordinations(0);
                loadKpis();
            } catch (err) {
                Common.showToast('Coordination initiation failed: ' + err.message, 'error');
            }
        });
    }

    // ========================================================
    // MODULE 5: ESCALATIONS & OVERDUE CASES
    // ========================================================
    async function loadEscalations() {
        const tbody = document.getElementById('escalationsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        try {
            const data = await Api.get('/cases/queue?page=0&size=50&priority=URGENT');
            const urgentCases = (data && data.content) ? data.content : [];

            const alerts = await Api.get(CONFIG.ENDPOINTS.ALERTS);
            const overdueCases = (alerts && alerts.overdueCases) ? alerts.overdueCases : [];

            // Combine unique cases
            const map = new Map();
            overdueCases.forEach(c => map.set(c.id, c));
            urgentCases.forEach(c => map.set(c.id, c));
            const combined = Array.from(map.values());

            if (combined.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#10b981;">✅ No urgent escalations or overdue cases pending!</td></tr>`;
                return;
            }

            tbody.innerHTML = combined.map(c => `
                <tr>
                    <td><span class="case-id-cell">${Common.escapeHtml(c.caseNumber)}</span></td>
                    <td>
                        <div style="font-weight:600; color:#04244a;">${Common.escapeHtml(c.title)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${Common.escapeHtml(c.category)}</div>
                    </td>
                    <td>
                        <div>${Common.escapeHtml(c.institutionName)}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${Common.escapeHtml(c.permanentId)} &bull; ${Common.escapeHtml(c.region || 'HQ')}</div>
                    </td>
                    <td><span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${Common.escapeHtml(c.bureauCode)}</span></td>
                    <td>${Common.getPriorityBadge(c.priority)}</td>
                    <td style="font-size:0.78rem;">${Common.formatDate(c.receiptDate)}</td>
                    <td style="font-size:0.78rem; font-weight:700; color:#ef4444;">${Common.formatDate(c.expectedDisposalDate)}</td>
                    <td>
                        <span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">
                            ${c.overdue ? 'EXCEEDED SLA' : 'URGENT PRIORITY'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="inspectCase(${c.id})">Directives &amp; Action Plan</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#ef4444;">Failed to load escalations: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    // Export Escalations CSV
    const btnExportEscalationsCSV = document.getElementById('btnExportEscalationsCSV');
    if (btnExportEscalationsCSV) {
        btnExportEscalationsCSV.addEventListener('click', async () => {
            try {
                const alerts = await Api.get(CONFIG.ENDPOINTS.ALERTS);
                const overdueCases = (alerts && alerts.overdueCases) ? alerts.overdueCases : [];
                if (overdueCases.length === 0) {
                    Common.showToast('No overdue cases to export.', 'info');
                    return;
                }
                const headers = ['Case Number', 'Title', 'Institution', 'Permanent ID', 'Bureau', 'Priority', 'Receipt Date', 'Expected Disposal'];
                const rows = overdueCases.map(c => [
                    c.caseNumber,
                    `"${(c.title || '').replace(/"/g, '""')}"`,
                    `"${(c.institutionName || '').replace(/"/g, '""')}"`,
                    c.permanentId || '',
                    c.bureauCode || '',
                    c.priority || '',
                    c.receiptDate ? c.receiptDate.substring(0, 10) : '',
                    c.expectedDisposalDate ? c.expectedDisposalDate.substring(0, 10) : ''
                ]);
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const link = document.createElement('a');
                link.setAttribute('href', encodeURI(csvContent));
                link.setAttribute('download', `AICTE_Overdue_Escalations_${new Date().toISOString().substring(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Common.showToast('Escalations exported successfully!', 'success');
            } catch (err) {
                Common.showToast('Export failed: ' + err.message, 'error');
            }
        });
    }

    // ========================================================
    // MODULE 6: APPROVAL REQUESTS (TRANSFERS)
    // ========================================================
    async function loadApprovals(page = 0) {
        const tbody = document.getElementById('approvalsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        try {
            const data = await Api.get(`/transfer-requests?page=${page}&size=15`);
            const requests = (data && data.content) ? data.content : [];

            if (requests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#64748b;">No transfer approval requests pending supervisory review.</td></tr>`;
                return;
            }

            tbody.innerHTML = requests.map(t => `
                <tr>
                    <td><strong>#TR-${t.id}</strong></td>
                    <td><span class="case-id-cell">${Common.escapeHtml(t.caseNumber)}</span></td>
                    <td style="font-weight:600; color:#04244a;">${Common.escapeHtml(t.caseTitle || '—')}</td>
                    <td>${Common.escapeHtml(t.institutionName || 'Campus')}</td>
                    <td>
                        <span class="badge" style="background:#fee2e2; color:#991b1b;">${Common.escapeHtml(t.fromBureauCode)}</span>
                        &rarr;
                        <span class="badge" style="background:#dcfce7; color:#166534;">${Common.escapeHtml(t.toBureauCode)}</span>
                    </td>
                    <td>${Common.escapeHtml(t.requestedByUserName || 'Officer')}</td>
                    <td style="font-size:0.8rem; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${Common.escapeHtml(t.reason)}">
                        ${Common.escapeHtml(t.reason)}
                    </td>
                    <td style="font-size:0.78rem;">${Common.formatDate(t.createdAt)}</td>
                    <td>${Common.getStatusBadge(t.status)}</td>
                    <td>
                        ${t.status === 'PENDING' ? `
                            <button class="btn btn-primary btn-sm" onclick="openTransferDecisionModal(${t.id}, '${Common.escapeHtml(t.caseNumber)}', '${Common.escapeHtml(t.institutionName || '')}', '${t.fromBureauCode}', '${t.toBureauCode}', '${Common.escapeHtml(t.requestedByUserName || '')}', '${Common.escapeHtml(t.reason)}')">
                                Review &amp; Decide
                            </button>
                        ` : `
                            <span style="font-size:0.75rem; color:#64748b;">Processed (${Common.escapeHtml(t.status)})</span>
                        `}
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:#ef4444;">Failed to load transfer requests: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    window.openTransferDecisionModal = function(id, caseNum, instName, fromB, toB, requestedBy, reason) {
        document.getElementById('modalTransferId').value = id;
        document.getElementById('transferModalCaseNumber').textContent = caseNum;
        document.getElementById('transferModalInstName').textContent = instName;
        document.getElementById('transferModalPath').textContent = `${fromB}  ⟶  ${toB}`;
        document.getElementById('transferModalRequestedBy').textContent = requestedBy;
        document.getElementById('transferModalReason').textContent = reason;
        document.getElementById('transferDecisionRemarks').value = '';

        Common.openModal('transferDecisionModal');
    };

    const btnApproveTransfer = document.getElementById('btnApproveTransfer');
    const btnRejectTransfer = document.getElementById('btnRejectTransfer');

    if (btnApproveTransfer) {
        btnApproveTransfer.addEventListener('click', async () => {
            const transferId = document.getElementById('modalTransferId').value;
            const remarks = document.getElementById('transferDecisionRemarks').value.trim();
            if (!remarks) {
                Common.showToast('Supervisory decision remarks are required for approval.', 'warning');
                return;
            }
            try {
                btnApproveTransfer.disabled = true;
                await Api.patch(`/transfer-requests/${transferId}/decision`, {
                    approve: true,
                    remarks: remarks
                });
                Common.showToast('Inter-Bureau transfer APPROVED and case successfully reassigned!', 'success');
                Common.closeModal('transferDecisionModal');
                loadApprovals(0);
                loadKpis();
            } catch (err) {
                Common.showToast('Approval failed: ' + err.message, 'error');
            } finally {
                btnApproveTransfer.disabled = false;
            }
        });
    }

    if (btnRejectTransfer) {
        btnRejectTransfer.addEventListener('click', async () => {
            const transferId = document.getElementById('modalTransferId').value;
            const remarks = document.getElementById('transferDecisionRemarks').value.trim();
            if (!remarks) {
                Common.showToast('Please state official reason for rejecting the transfer.', 'warning');
                return;
            }
            try {
                btnRejectTransfer.disabled = true;
                await Api.patch(`/transfer-requests/${transferId}/decision`, {
                    approve: false,
                    remarks: remarks
                });
                Common.showToast('Inter-Bureau transfer REJECTED. Case retained in original Bureau.', 'info');
                Common.closeModal('transferDecisionModal');
                loadApprovals(0);
                loadKpis();
            } catch (err) {
                Common.showToast('Rejection failed: ' + err.message, 'error');
            } finally {
                btnRejectTransfer.disabled = false;
            }
        });
    }

    // ========================================================
    // MODULE 7: INSTITUTION MONITORING
    // ========================================================
    async function loadInstitutions(page = 0) {
        const tbody = document.getElementById('institutionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        const query = (document.getElementById('instSearchInput').value || '').trim();
        const region = document.getElementById('instFilterRegion').value || null;

        let endpoint = `/institutions?page=${page}&size=15`;
        if (query) endpoint += `&query=${encodeURIComponent(query)}`;
        if (region) endpoint += `&region=${encodeURIComponent(region)}`;

        try {
            const data = await Api.get(endpoint);
            const institutions = (data && data.content) ? data.content : [];

            if (institutions.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#64748b;">No institutions found matching criteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = institutions.map(i => `
                <tr>
                    <td><strong style="font-family:var(--font-family-mono); color:#1d4ed8;">${Common.escapeHtml(i.permanentId)}</strong></td>
                    <td style="font-weight:700; color:#04244a;">${Common.escapeHtml(i.name)}</td>
                    <td>${Common.escapeHtml(i.region || '—')}, ${Common.escapeHtml(i.state || '')}</td>
                    <td>${Common.escapeHtml(i.city || '—')}</td>
                    <td style="font-weight:700; text-align:center;">${i.complaintCount !== undefined ? i.complaintCount : 1}</td>
                    <td style="text-align:center;">
                        <span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">
                            ${i.activeComplaintCount !== undefined ? i.activeComplaintCount : 1} Active
                        </span>
                    </td>
                    <td>
                        <span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">MONITORED</span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="inspectInstitution(${i.id})">Inspect Dossier</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#ef4444;">Failed to load institutions: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    const btnSearchInstitutions = document.getElementById('btnSearchInstitutions');
    if (btnSearchInstitutions) btnSearchInstitutions.addEventListener('click', () => loadInstitutions(0));

    window.inspectInstitution = async function(instId) {
        try {
            const inst = await Api.get(`/institutions/${instId}`);
            const history = await Api.get(`/institutions/${instId}/history`);
            alert(`AICTE Institution Dossier: ${inst.name}\nPermanent ID: ${inst.permanentId}\nRegion: ${inst.region}, ${inst.state}\nTotal Historical Grievances: ${history ? history.length : 0}\n\nAll historical complaints across Bureaus are logged in the central repository.`);
        } catch (err) {
            Common.showToast('Could not load institution dossier: ' + err.message, 'error');
        }
    };

    // ========================================================
    // MODULE 8: BUREAU PERFORMANCE SCORECARD
    // ========================================================
    async function loadBureauPerformance() {
        const container = document.getElementById('bureauScorecardsContainer');
        const tbody = document.getElementById('bureauPerformanceTableBody');
        if (!container || !tbody) return;

        try {
            const data = await Api.get(CONFIG.ENDPOINTS.BUREAU_WORKLOAD);
            const list = Array.isArray(data) ? data : [];

            // Scorecard cards
            const bureauClassMap = {
                'RB': 'rb',
                'PGRC': 'pgrc',
                'APPROVAL': 'approval',
                'POLICY': 'policy'
            };

            container.innerHTML = list.map(b => {
                const total = b.totalCases || 0;
                const disposed = b.disposedCases || 0;
                const rate = total > 0 ? Math.round((disposed / total) * 100) : 0;
                const cardClass = bureauClassMap[b.bureauCode] || 'rb';

                return `
                    <div class="bureau-scorecard-card ${cardClass}">
                        <div class="scorecard-title">
                            <span>${Common.escapeHtml(b.bureauCode)} &bull; ${Common.escapeHtml(b.bureauName)}</span>
                            <span class="badge" style="background:#e0f2fe; color:#0369a1;">SLA 45d</span>
                        </div>
                        <div class="scorecard-metrics-row">
                            <div class="scorecard-metric-box">
                                <div class="scorecard-metric-val">${total}</div>
                                <div class="scorecard-metric-lbl">Total Allocated</div>
                            </div>
                            <div class="scorecard-metric-box">
                                <div class="scorecard-metric-val" style="color:#10b981;">${disposed}</div>
                                <div class="scorecard-metric-lbl">Disposed</div>
                            </div>
                            <div class="scorecard-metric-box">
                                <div class="scorecard-metric-val" style="color:#ef4444;">${b.overdueCases || 0}</div>
                                <div class="scorecard-metric-lbl">Overdue</div>
                            </div>
                            <div class="scorecard-metric-box">
                                <div class="scorecard-metric-val" style="color:#1d4ed8;">${rate}%</div>
                                <div class="scorecard-metric-lbl">Disposal Rate</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Scorecard comparative table
            tbody.innerHTML = list.map(b => {
                const total = b.totalCases || 0;
                const disposed = b.disposedCases || 0;
                const rate = total > 0 ? Math.round((disposed / total) * 100) : 0;
                const rating = rate >= 70 ? '🟢 Exemplary' : rate >= 40 ? '🟡 Compliant' : '🔴 Scrutiny Required';

                return `
                    <tr>
                        <td>
                            <strong style="color:#04244a;">${Common.escapeHtml(b.bureauCode)}</strong> — ${Common.escapeHtml(b.bureauName)}
                        </td>
                        <td style="font-weight:700; text-align:center;">${total}</td>
                        <td style="text-align:center;">${b.receivedCases || 0}</td>
                        <td style="text-align:center;">${b.underProcessCases || 0}</td>
                        <td style="text-align:center; color:#10b981; font-weight:700;">${disposed}</td>
                        <td style="text-align:center; color:#ef4444; font-weight:700;">${b.overdueCases || 0}</td>
                        <td style="text-align:center; font-weight:800; color:#1d4ed8;">${rate}%</td>
                        <td>${rating}</td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load bureau performance:', error);
        }
    }

    // ========================================================
    // MODULE 9: REPORTS & ANALYTICS
    // ========================================================
    const btnGenerateReportPreview = document.getElementById('btnGenerateReportPreview');
    const btnDownloadCSVReport = document.getElementById('btnDownloadCSVReport');

    async function fetchReportData() {
        const reportType = document.getElementById('reportTypeSelect').value;
        const dateFrom = document.getElementById('reportDateFrom').value || null;
        const dateTo = document.getElementById('reportDateTo').value || null;
        const bureauId = document.getElementById('reportBureauSelect').value || null;
        const region = document.getElementById('reportRegionSelect').value || null;
        const status = document.getElementById('reportStatusSelect').value || null;

        let url = `/dashboard/reports?reportType=${encodeURIComponent(reportType)}`;
        if (dateFrom) url += `&dateFrom=${dateFrom}`;
        if (dateTo) url += `&dateTo=${dateTo}`;
        if (bureauId) url += `&bureauId=${bureauId}`;
        if (region) url += `&region=${encodeURIComponent(region)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;

        return await Api.get(url);
    }

    if (btnGenerateReportPreview) {
        btnGenerateReportPreview.addEventListener('click', async () => {
            const container = document.getElementById('reportPreviewContainer');
            if (!container) return;
            container.innerHTML = `<div style="text-align:center; padding:30px;"><div class="spinner"></div><p style="margin-top:8px;">Compiling national compliance report...</p></div>`;

            try {
                const res = await fetchReportData();
                const metrics = res.summaryMetrics || {};

                container.innerHTML = `
                    <div style="background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <div>
                                <h3 style="margin:0; font-size:1.1rem; color:#04244a;">${res.reportType}</h3>
                                <div style="font-size:0.75rem; color:#64748b;">Generated at: ${new Date(res.generatedAt).toLocaleString()} &bull; AICTE Statutory Oversight</div>
                            </div>
                            <span class="badge" style="background:#dcfce7; color:#166534; font-size:0.78rem;">Live Verification</span>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; margin-bottom:18px;">
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; text-align:center;">
                                <div style="font-size:0.68rem; color:#64748b; font-weight:700;">TOTAL CASES</div>
                                <div style="font-size:1.35rem; font-weight:800; color:#04244a;">${metrics.totalCases || 0}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; text-align:center;">
                                <div style="font-size:0.68rem; color:#64748b; font-weight:700;">PENDING</div>
                                <div style="font-size:1.35rem; font-weight:800; color:#d97706;">${metrics.pendingCases || 0}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; text-align:center;">
                                <div style="font-size:0.68rem; color:#64748b; font-weight:700;">UNDER PROCESS</div>
                                <div style="font-size:1.35rem; font-weight:800; color:#2563eb;">${metrics.underProcessCases || 0}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; text-align:center;">
                                <div style="font-size:0.68rem; color:#64748b; font-weight:700;">DISPOSED</div>
                                <div style="font-size:1.35rem; font-weight:800; color:#10b981;">${metrics.disposedCases || 0}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:4px; text-align:center;">
                                <div style="font-size:0.68rem; color:#64748b; font-weight:700;">OVERDUE</div>
                                <div style="font-size:1.35rem; font-weight:800; color:#ef4444;">${metrics.overdueCases || 0}</div>
                            </div>
                        </div>

                        <p style="font-size:0.8rem; color:#475569;">Report dataset generated successfully. Use <strong>Download Real CSV Report</strong> to export the full data sheet for audit archives.</p>
                    </div>
                `;
            } catch (err) {
                container.innerHTML = `<div style="text-align:center; padding:20px; color:#ef4444;">Failed to generate report preview: ${Common.escapeHtml(err.message)}</div>`;
            }
        });
    }

    if (btnDownloadCSVReport) {
        btnDownloadCSVReport.addEventListener('click', async () => {
            try {
                const casesData = await Api.get('/cases/queue?page=0&size=500&sortBy=receiptDate&sortDir=DESC');
                const cases = (casesData && casesData.content) ? casesData.content : [];

                const reportType = document.getElementById('reportTypeSelect').value;
                const headers = ['Case Number', 'Title', 'Institution', 'Permanent ID', 'Bureau', 'Category', 'Priority', 'Status', 'Overdue', 'Receipt Date', 'Expected Disposal'];
                const rows = cases.map(c => [
                    c.caseNumber,
                    `"${(c.title || '').replace(/"/g, '""')}"`,
                    `"${(c.institutionName || '').replace(/"/g, '""')}"`,
                    c.permanentId || '',
                    c.bureauCode || '',
                    `"${(c.category || '').replace(/"/g, '""')}"`,
                    c.priority || '',
                    c.status || '',
                    c.overdue ? 'YES' : 'NO',
                    c.receiptDate ? c.receiptDate.substring(0, 10) : '',
                    c.expectedDisposalDate ? c.expectedDisposalDate.substring(0, 10) : ''
                ]);

                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const link = document.createElement('a');
                link.setAttribute('href', encodeURI(csvContent));
                link.setAttribute('download', `AICTE_Report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Common.showToast('Supervisory report downloaded successfully as CSV!', 'success');
            } catch (err) {
                Common.showToast('CSV download failed: ' + err.message, 'error');
            }
        });
    }

    // ========================================================
    // MODULE 10: ACTIVITY & AUDIT HISTORY
    // ========================================================
    async function loadActivityHistory(page = 0) {
        const tbody = document.getElementById('auditLogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;"><div class="spinner"></div></td></tr>`;

        const action = document.getElementById('auditFilterAction').value || null;
        let url = `/dashboard/activity-history?page=${page}&size=20`;
        if (action) url += `&action=${encodeURIComponent(action)}`;

        try {
            const data = await Api.get(url);
            const logs = (data && data.content) ? data.content : [];

            if (logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">No audit records found matching criteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = logs.map(l => `
                <tr>
                    <td style="font-size:0.78rem; white-space:nowrap;">${Common.formatDateTime(l.createdAt)}</td>
                    <td>
                        <strong style="color:#04244a;">${Common.escapeHtml(l.userEmail || 'SYSTEM')}</strong>
                    </td>
                    <td>
                        <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">
                            ${Common.escapeHtml(l.action)}
                        </span>
                    </td>
                    <td><span class="case-id-cell">${Common.escapeHtml(l.entityType || '')} #${Common.escapeHtml(l.entityId || '')}</span></td>
                    <td style="font-size:0.82rem; color:#334155; max-width:320px;">${Common.escapeHtml(l.details || '')}</td>
                    <td style="font-size:0.75rem; color:#64748b;">${Common.escapeHtml(l.ipAddress || '127.0.0.1')}</td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ef4444;">Failed to load activity history: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    const btnFilterAuditLogs = document.getElementById('btnFilterAuditLogs');
    if (btnFilterAuditLogs) btnFilterAuditLogs.addEventListener('click', () => loadActivityHistory(0));

    // ========================================================
    // MODALS: CASE INSPECT & SUPERVISORY DIRECTIVES
    // ========================================================
    window.inspectCase = async function(caseId) {
        try {
            const caseData = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
            const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));

            document.getElementById('inspectCaseId').textContent = caseData.caseNumber;
            document.getElementById('inspectCaseTitle').textContent = caseData.title;
            document.getElementById('inspectInstName').textContent = `${caseData.institutionName} (${caseData.permanentId})`;
            document.getElementById('inspectBureau').textContent = `${caseData.bureauCode} - ${caseData.bureauName}`;
            document.getElementById('inspectCategory').textContent = caseData.category;
            document.getElementById('inspectPriority').innerHTML = Common.getPriorityBadge(caseData.priority);
            document.getElementById('inspectStatus').innerHTML = Common.getStatusBadge(caseData.status, caseData.overdue);
            document.getElementById('inspectDeadline').textContent = Common.formatDate(caseData.expectedDisposalDate);
            document.getElementById('inspectDescription').textContent = caseData.description;

            // Form hidden field
            document.getElementById('directiveCaseId').value = caseData.id;

            // Default due date to 7 days from today
            const dueInput = document.getElementById('directiveDueDate');
            if (dueInput) {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                dueInput.value = d.toISOString().substring(0, 10);
            }

            // Render Timeline
            const timelineContainer = document.getElementById('inspectActionHistory');
            if (timelineContainer) {
                if (Array.isArray(history) && history.length > 0) {
                    timelineContainer.innerHTML = history.map(h => `
                        <div class="timeline-entry">
                            <div class="timeline-dot"></div>
                            <div class="timeline-header">
                                <span class="timeline-author">${Common.escapeHtml(h.userFullName || 'Official')} (${Common.escapeHtml(h.userRole || 'AICTE')})</span>
                                <span class="timeline-time">${Common.formatDateTime(h.createdAt)}</span>
                            </div>
                            <div class="timeline-remarks">
                                <strong style="color:#0369a1;">[${Common.escapeHtml(h.actionType || 'REMARK')}]</strong>: ${Common.escapeHtml(h.remarks)}
                            </div>
                            ${h.nextAction ? `<div class="timeline-next-action">Next Action: ${Common.escapeHtml(h.nextAction)} (Due: ${Common.formatDate(h.nextActionDueDate)})</div>` : ''}
                        </div>
                    `).join('');
                } else {
                    timelineContainer.innerHTML = `<p style="color:var(--color-text-muted); font-size:0.85rem;">No historical actions logged yet.</p>`;
                }
            }

            Common.openModal('caseInspectModal');
        } catch (error) {
            Common.showToast('Could not inspect case: ' + error.message, 'error');
        }
    };

    // Supervisory Directive Form submit
    const supervisoryDirectiveForm = document.getElementById('supervisoryDirectiveForm');
    if (supervisoryDirectiveForm) {
        supervisoryDirectiveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const caseId = document.getElementById('directiveCaseId').value;
            const actionType = document.getElementById('directiveActionType').value;
            const remarks = document.getElementById('directiveRemarks').value.trim();
            const dueDate = document.getElementById('directiveDueDate').value;

            if (!remarks) {
                Common.showToast('Directive remarks are required.', 'warning');
                return;
            }

            try {
                const submitBtn = document.getElementById('btnSubmitDirective');
                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Transmitting...'; }

                await Api.post(`/cases/${caseId}/actions`, {
                    actionType: actionType,
                    remarks: `[Senior Authority Directive]: ${remarks}`,
                    nextAction: actionType,
                    nextActionDueDate: dueDate ? dueDate + 'T18:00:00' : null
                });

                Common.showToast('Supervisory directive successfully recorded and transmitted!', 'success');
                document.getElementById('directiveRemarks').value = '';

                // Refresh modal history
                inspectCase(caseId);
                loadAllCases(casesCurrentPage);
                loadKpis();
            } catch (err) {
                Common.showToast('Directive transmission failed: ' + err.message, 'error');
            } finally {
                const submitBtn = document.getElementById('btnSubmitDirective');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Transmit Official Directive →'; }
            }
        });
    }

    // Overlap Review Modal
    window.openOverlapReviewModal = async function(overlapId) {
        currentReviewOverlapId = overlapId;
        try {
            const overlap = await Api.get(CONFIG.ENDPOINTS.OVERLAP_DETAIL(overlapId));
            document.getElementById('overlapAlertId').value = overlap.id;
            document.getElementById('reviewOverlapTitle').textContent = `Review Cross-Bureau Overlap Alert #${overlap.id}`;
            document.getElementById('overlapInstName').textContent = overlap.institutionName;
            document.getElementById('overlapInstId').textContent = overlap.permanentId;

            document.getElementById('overlapCase1Bureau').textContent = overlap.case1BureauCode || 'RB';
            document.getElementById('overlapCase1Number').textContent = overlap.case1Number;
            document.getElementById('overlapCase1Title').textContent = overlap.case1Title;
            document.getElementById('overlapCase1Meta').textContent = `Category: ${overlap.case1Category || '—'} | Status: ${overlap.case1Status || 'UNDER_PROCESS'}`;

            document.getElementById('overlapCase2Bureau').textContent = overlap.case2BureauCode || 'PGRC';
            document.getElementById('overlapCase2Number').textContent = overlap.case2Number;
            document.getElementById('overlapCase2Title').textContent = overlap.case2Title;
            document.getElementById('overlapCase2Meta').textContent = `Category: ${overlap.case2Category || '—'} | Status: ${overlap.case2Status || 'RECEIVED'}`;

            document.getElementById('overlapClassification').value = overlap.classification || '';
            document.getElementById('overlapRemarks').value = '';

            Common.openModal('overlapReviewModal');
        } catch (error) {
            Common.showToast('Failed to load overlap details: ' + error.message, 'error');
        }
    };

    const overlapReviewForm = document.getElementById('overlapReviewForm');
    if (overlapReviewForm) {
        overlapReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const classification = document.getElementById('overlapClassification').value;
            const remarks = document.getElementById('overlapRemarks').value.trim();

            if (!classification || !remarks) {
                Common.showToast('Supervisory classification and remarks are mandatory.', 'warning');
                return;
            }

            try {
                const btn = document.getElementById('btnSaveOverlapReview');
                if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

                await Api.patch(CONFIG.ENDPOINTS.REVIEW_OVERLAP(currentReviewOverlapId), {
                    classification: classification,
                    decision: classification,
                    reviewRemarks: remarks
                });

                Common.showToast('Overlap supervisory classification logged successfully!', 'success');
                Common.closeModal('overlapReviewModal');
                loadOverlaps(0);
                loadAlerts();
                loadKpis();
            } catch (err) {
                Common.showToast('Failed to save overlap review: ' + err.message, 'error');
            } finally {
                const btn = document.getElementById('btnSaveOverlapReview');
                if (btn) { btn.disabled = false; btn.textContent = 'Save Supervisory Directives'; }
            }
        });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-close-modal');
            Common.closeModal(modalId);
        });
    });

    // Sign out button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }

    // Helper function
    function setElText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Always load supervisory KPIs to populate sidebar badges & notification dropdown
    loadKpis();

    // Deep-link routing or default to Executive Overview
    const initialTabParam = urlParams.get('tab');
    if (initialTabParam && document.getElementById(initialTabParam)) {
        switchToTab(initialTabParam);
    } else {
        loadDashboardData();
    }
});
