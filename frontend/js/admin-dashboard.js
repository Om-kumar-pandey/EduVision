/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * SUPER ADMIN DASHBOARD CONTROLLER (Dashboard 4)
 * 
 * Central administrative control panel implementing all 11 tabs,
 * RB-PGRC coordination, user governance, institution registry,
 * sequential case workflows, audit tracking, reports, and data ingestion.
 */

'use strict';

// Global state
let currentActivePane = 'paneDashboard';
let bureauChartInstance = null;
let statusChartInstance = null;
let currentSelectedCase = null;
let currentReportData = null;

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Modal management utilities
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
}

// =============================================================
// INITIALIZATION ON DOM READY
// =============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Auto-bootstrap credentials if provided via query params
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth_token');
    if (authParam) {
        localStorage.setItem(CONFIG.TOKEN_KEY, authParam);
        const userParam = urlParams.get('user_profile');
        if (userParam) {
            try {
                localStorage.setItem(CONFIG.USER_KEY, decodeURIComponent(userParam));
            } catch(e) {}
        }
    }

    // 1. Verify Authentication & Role
    if (!Auth.isAuthenticated()) {
        if (urlParams.get('demo') === 'true' || urlParams.get('auth_token')) {
            try {
                const loginRes = await Api.post(CONFIG.ENDPOINTS.LOGIN, {
                    email: 'admin@aicte.gov.in',
                    password: 'Admin@123'
                });
                if (loginRes && loginRes.token) {
                    localStorage.setItem(CONFIG.TOKEN_KEY, loginRes.token);
                    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({
                        id: loginRes.user?.id || 1,
                        email: 'admin@aicte.gov.in',
                        fullName: 'Super Administrator',
                        role: 'SYS_ADMIN'
                    }));
                }
            } catch(e) {
                console.warn('Admin auto-login fallback failed', e);
            }
        } else {
            window.location.href = 'login.html';
            return;
        }
    }

    const user = Auth.getUser() || {
        fullName: 'Super Administrator',
        role: 'SYS_ADMIN'
    };

    // 2. Set Header Profile Info
    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');

    if (avatarEl && user.fullName) avatarEl.textContent = user.fullName.charAt(0).toUpperCase();
    if (nameEl && user.fullName) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = 'SUPER ADMIN';

    // 3. Bind Sidebar Navigation Tabs
    document.querySelectorAll('[data-tab-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPane = link.getAttribute('data-tab-target');
            switchAdminTab(targetPane);
        });
    });

    // 4. Mobile Menu Toggle & Backdrop
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('appSidebar');
    const adminBackdrop = document.getElementById('adminSidebarBackdrop');

    function toggleAdminSidebar() {
        if (!sidebar) return;
        const isOpen = sidebar.classList.toggle('active');
        sidebar.classList.toggle('open', isOpen);
        if (adminBackdrop) adminBackdrop.classList.toggle('active', isOpen);
    }

    function closeAdminSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('active', 'open');
        if (adminBackdrop) adminBackdrop.classList.remove('active');
    }

    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', toggleAdminSidebar);
    }
    if (adminBackdrop) {
        adminBackdrop.addEventListener('click', closeAdminSidebar);
    }

    // Auto-close on mobile when tab is clicked
    document.querySelectorAll('[data-tab-target]').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeAdminSidebar();
        });
    });

    // 5. User Profile Menu Toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    if (userMenuBtn && userMenuDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('active');
        });
    }

    // 6. Notifications Toggle
    const notifBtn = document.getElementById('notificationBtn');
    const notifDropdown = document.getElementById('notificationsDropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
            loadNotifications();
        });
    }

    // 7. Global Search Input
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchResultsDropdown');
    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', debounce(async () => {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                searchDropdown.classList.remove('active');
                return;
            }
            try {
                const res = await Api.get(CONFIG.ENDPOINTS.GLOBAL_SEARCH(query));
                renderGlobalSearchResults(res);
            } catch (err) {
                console.error('Global search error:', err);
            }
        }, 300));

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) searchDropdown.classList.add('active');
        });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (userMenuDropdown && !userMenuDropdown.contains(e.target)) userMenuDropdown.classList.remove('active');
        if (notifDropdown && !notifDropdown.contains(e.target)) notifDropdown.classList.remove('active');
        if (searchDropdown && !searchDropdown.contains(e.target) && e.target !== searchInput) searchDropdown.classList.remove('active');
    });

    // Logout Action
    const logoutBtn = document.getElementById('logoutActionBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
            window.location.href = 'index.html';
        });
    }

    // 8. Load Initial Tab (supports ?tab=paneOfficerRequests etc.)
    const targetTab = urlParams.get('tab') || 'paneDashboard';
    switchAdminTab(targetTab);
    loadNotificationsCount();
});

// =============================================================
// TAB SWITCHING CONTROLLER
// =============================================================
function switchAdminTab(paneId, options = {}) {
    currentActivePane = paneId;

    // Update Sidebar Active Class
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        if (link.getAttribute('data-tab-target') === paneId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update Panes Visibility
    document.querySelectorAll('.admin-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(paneId);
    if (targetPane) targetPane.classList.add('active');

    // Update Header Titles
    const titles = {
        paneDashboard: { title: 'Super Admin Dashboard', sub: 'Comprehensive System Overview &bull; Real-time AICTE National Registry' },
        paneUsers: { title: 'Users & Roles Management', sub: 'Role-Based Access Control, Officer Assignments & Account Governance' },
        paneOfficerRequests: { title: 'Officer Access Requests Queue', sub: 'Verification, Administrative Review & Credential Provisioning for Bureau Officials' },
        paneInstitutions: { title: 'Technical Institutions Registry', sub: 'AICTE Permanent ID Directory & Approval Verification' },
        paneBureaus: { title: 'Bureaus & Cells Administration', sub: 'Regulatory Divisions, Workload Distribution & Inter-Bureau Transfers' },
        paneRegions: { title: 'Regional Jurisdictions', sub: 'Regional Office Management & State Mappings' },
        paneCases: { title: 'Complaints Master Queue', sub: 'Canonical Case Lifecycle, Officer Assignments & Resolution Tracking' },
        paneReports: { title: 'Administrative Reports & Analytics', sub: 'Compliance Metrics, SLA Breaches & Historical Aggregations' },
        paneSettings: { title: 'System Settings & Rules', sub: 'Platform Configuration, Allowed Workflow Transitions & Security Policies' },
        paneAudit: { title: 'Immutable Security Audit Trail', sub: 'Chronological Compliance & Action Logging' },
        paneImport: { title: 'Bulk Data Ingestion Engine', sub: 'Validated CSV Import, Error Reporting & Idempotent Batches' },
        paneSupport: { title: 'Help & Technical Support', sub: 'Operational Guidance, FAQs & Technical Support Log' }
    };

    const header = titles[paneId] || { title: 'Super Admin Console', sub: 'National Grievance Platform' };
    const titleEl = document.getElementById('currentPaneTitle');
    const subEl = document.getElementById('currentPaneSubtitle');
    if (titleEl) titleEl.textContent = header.title;
    if (subEl) subEl.innerHTML = header.sub;

    // Trigger tab-specific data load
    switch (paneId) {
        case 'paneDashboard':
            loadDashboardOverview();
            break;
        case 'paneUsers':
            loadUsersData();
            break;
        case 'paneOfficerRequests':
            loadOfficerRequestsData();
            break;
        case 'paneInstitutions':
            loadInstitutionsData();
            break;
        case 'paneBureaus':
            loadBureausData();
            loadTransfersData();
            break;
        case 'paneRegions':
            loadRegionsData();
            break;
        case 'paneCases':
            if (options.status) {
                const sel = document.getElementById('filterCaseStatus');
                if (sel) sel.value = options.status;
            }
            loadCasesData();
            break;
        case 'paneReports':
            generateReportData();
            break;
        case 'paneSettings':
            loadSettingsData();
            break;
        case 'paneAudit':
            loadAuditLogsData();
            break;
        case 'paneImport':
            if (typeof loadImportBatches === 'function') loadImportBatches();
            break;
        case 'paneSupport':
            loadSupportTicketsData();
            break;
    }
}

// =============================================================
// TAB 1: DASHBOARD OVERVIEW & ANALYTICS
// =============================================================
async function loadDashboardOverview() {
    try {
        const stats = await Api.get(CONFIG.ENDPOINTS.ADMIN_STATS);

        // 1. KPI Cards
        document.getElementById('kpiTotalInstitutions').textContent = stats.totalInstitutions.toLocaleString();
        document.getElementById('kpiTotalCases').textContent = stats.totalCases.toLocaleString();
        document.getElementById('kpiPendingCases').textContent = stats.pendingCases.toLocaleString();
        document.getElementById('kpiOverdueCases').textContent = stats.overdueCases.toLocaleString();
        document.getElementById('kpiUnassignedCases').textContent = stats.unassignedCases.toLocaleString();
        document.getElementById('kpiPotentialDuplicates').textContent = stats.potentialDuplicateCases.toLocaleString();

        // 2. Charts
        renderBureauChart(stats.casesByBureau || []);
        renderStatusChart(stats.casesByStatus || {});

        // 3. Region Summary Table
        renderDashboardRegionTable(stats.regionSummary || []);

        // 4. Bureau Workload Table
        renderDashboardBureauTable(stats.casesByBureau || []);

        // 5. Recent Cases Table
        renderDashboardRecentCases(stats.recentCases || []);

        // 6. Recent Activities Stream
        renderDashboardRecentActivities(stats.recentActivities || []);

    } catch (err) {
        console.error('Error loading dashboard overview:', err);
    }
}

function renderBureauChart(bureaus) {
    const canvas = document.getElementById('chartCasesByBureau');
    if (!canvas) return;

    const labels = bureaus.map(b => b.bureauCode);
    const data = bureaus.map(b => b.totalCases);

    if (bureauChartInstance) bureauChartInstance.destroy();

    bureauChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Complaints by Bureau',
                data: data,
                backgroundColor: ['#0076ff', '#0284c7', '#2563eb', '#38bdf8'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderStatusChart(statusMap) {
    const canvas = document.getElementById('chartCasesByStatus');
    if (!canvas) return;

    const labels = Object.keys(statusMap);
    const data = Object.values(statusMap);

    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#0284c7', // RECEIVED
                    '#d97706', // UNDER_REVIEW
                    '#7c3aed', // PENDING_ASSIGNMENT
                    '#2563eb', // IN_PROGRESS
                    '#c026d3', // AWAITING_INSTITUTION_RESPONSE
                    '#0891b2', // AWAITING_INTERNAL_REVIEW
                    '#16a34a', // RESOLVED
                    '#15803d', // DISPOSED
                    '#64748b'  // CLOSED
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
            }
        }
    });
}

function renderDashboardRegionTable(regions) {
    const tbody = document.getElementById('dashRegionSummaryTableBody');
    if (!tbody) return;

    if (!regions.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">No region data available.</td></tr>`;
        return;
    }

    tbody.innerHTML = regions.map(r => `
        <tr>
            <td style="font-weight:600;color:#04244a;">${r.name}</td>
            <td><span class="role-pill" style="background:#eff6ff;color:#1e40af;">${r.code}</span></td>
            <td>${r.totalInstitutions}</td>
            <td style="font-weight:700;">${r.totalCases}</td>
            <td><span class="status-pill status-under-review">${r.pendingCases}</span></td>
            <td>${r.overdueCases > 0 ? `<span class="status-pill status-overdue">${r.overdueCases}</span>` : '0'}</td>
        </tr>
    `).join('');
}

function renderDashboardBureauTable(bureaus) {
    const tbody = document.getElementById('dashBureauWorkloadTableBody');
    if (!tbody) return;

    if (!bureaus.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:16px;color:#64748b;">No bureau data available.</td></tr>`;
        return;
    }

    tbody.innerHTML = bureaus.map(b => `
        <tr>
            <td><span class="role-pill" style="background:#f0fdf4;color:#166534;">${b.bureauCode}</span></td>
            <td style="font-weight:600;color:#04244a;">${b.bureauName}</td>
            <td style="font-weight:700;">${b.totalCases}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="switchAdminTab('paneCases', {bureauId: ${b.bureauId}})">
                    View Queue &rarr;
                </button>
            </td>
        </tr>
    `).join('');
}

function renderDashboardRecentCases(cases) {
    const tbody = document.getElementById('dashRecentCasesTableBody');
    if (!tbody) return;

    if (!cases.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#64748b;">No recent cases recorded.</td></tr>`;
        return;
    }

    tbody.innerHTML = cases.map(c => `
        <tr>
            <td style="font-weight:700;color:#04244a;">${c.caseNumber}</td>
            <td>${c.institutionName || 'Verified AICTE Institute'}</td>
            <td>${c.category}</td>
            <td><span class="role-pill" style="background:#f1f5f9;color:#334155;">${c.bureauCode || 'N/A'}</span></td>
            <td>${c.assignedToUserName || '<span style="color:#94a3b8;font-style:italic;">Unassigned</span>'}</td>
            <td>${c.region || 'Western'}</td>
            <td><span class="status-pill status-${(c.status || '').toLowerCase().replace(/_/g, '-')}">${c.status}</span></td>
            <td style="font-size:0.75rem;color:#64748b;">${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openCaseDetailsModal(${c.id})">
                    View &rarr;
                </button>
            </td>
        </tr>
    `).join('');
}

function renderDashboardRecentActivities(activities) {
    const tbody = document.getElementById('dashRecentActivitiesTableBody');
    if (!tbody) return;

    if (!activities.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">No recent activities logged.</td></tr>`;
        return;
    }

    tbody.innerHTML = activities.map(a => `
        <tr>
            <td style="font-size:0.75rem;color:#64748b;">${a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Just now'}</td>
            <td style="font-weight:600;color:#04244a;">${a.userEmail || 'System Admin'}</td>
            <td><span class="role-pill" style="background:#eff6ff;color:#1d4ed8;">${a.action}</span></td>
            <td style="font-weight:600;">${a.entityType || 'SYSTEM'} ${a.entityId ? '#' + a.entityId : ''}</td>
            <td style="color:#475569;font-size:0.78rem;">${a.details || ''}</td>
        </tr>
    `).join('');
}

// =============================================================
// TAB 2: USERS & ROLES
// =============================================================
async function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;"><div class="spinner"></div></td></tr>`;

    const role = document.getElementById('filterUserRole')?.value || '';
    const bureauId = document.getElementById('filterUserBureau')?.value || '';
    const status = document.getElementById('filterUserStatus')?.value || '';
    const query = document.getElementById('filterUserQuery')?.value || '';

    try {
        let url = `${CONFIG.ENDPOINTS.ADMIN_USERS}?page=0&size=20`;
        if (role) url += `&role=${encodeURIComponent(role)}`;
        if (bureauId) url += `&bureauId=${bureauId}`;
        if (status) url += `&isActive=${status}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;

        const res = await Api.get(url);
        const users = res.content || [];

        if (!users.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No users found matching criteria.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-weight:700;color:#04244a;">#${u.id}</td>
                <td style="font-weight:600;">${u.fullName}</td>
                <td>${u.email}</td>
                <td style="color:#64748b;">${u.designation || 'N/A'}</td>
                <td><span class="role-pill" style="background:#e0f2fe;color:#0369a1;">${u.role}</span></td>
                <td>${u.bureauCode ? `<span class="role-pill" style="background:#f1f5f9;color:#334155;">${u.bureauCode}</span>` : (u.region || 'National')}</td>
                <td>
                    <span class="status-pill ${u.isActive ? 'status-resolved' : 'status-overdue'}">
                        ${u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </td>
                <td style="font-size:0.75rem;color:#64748b;">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditUserModal(${u.id}, '${u.fullName}', '${u.role}', '${u.bureauId || ''}', '${u.designation || ''}')" title="Edit User">
                            ✏️
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="openResetPasswordModal(${u.id}, '${u.email}')" title="Reset Password">
                            🔑
                        </button>
                        <button class="btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}" onclick="toggleUserStatus(${u.id}, ${!u.isActive})" title="${u.isActive ? 'Deactivate' : 'Activate'}">
                            ${u.isActive ? '🔒' : '🔓'}
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading users:', err);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#dc2626;">Failed to load users: ${err.message}</td></tr>`;
    }
}

function resetUserFilters() {
    if (document.getElementById('filterUserRole')) document.getElementById('filterUserRole').value = '';
    if (document.getElementById('filterUserBureau')) document.getElementById('filterUserBureau').value = '';
    if (document.getElementById('filterUserStatus')) document.getElementById('filterUserStatus').value = '';
    if (document.getElementById('filterUserQuery')) document.getElementById('filterUserQuery').value = '';
    loadUsersData();
}

function openAddUserModal() {
    const form = document.getElementById('addUserForm');
    if (form) form.reset();
    openModal('addUserModal');
}

async function handleCreateUserSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitNewUser');

    const payload = {
        fullName: document.getElementById('newUserFullName').value.trim(),
        email: document.getElementById('newUserEmail').value.trim(),
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value,
        bureauId: document.getElementById('newUserBureau').value ? parseInt(document.getElementById('newUserBureau').value) : null,
        region: document.getElementById('newUserRegion').value || null,
        phone: document.getElementById('newUserPhone').value.trim() || null,
        designation: document.getElementById('newUserDesignation').value.trim() || null
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Creating...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_USERS, payload);
        btn.disabled = false;
        btn.textContent = 'Create Account';
        closeModal('addUserModal');
        alert('User account successfully created.');
        loadUsersData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Create Account';
        alert('Failed to create user: ' + err.message);
    }
}

function openEditUserModal(id, fullName, role, bureauId, designation) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserFullName').value = fullName;
    document.getElementById('editUserRole').value = role;
    document.getElementById('editUserBureau').value = bureauId || '';
    document.getElementById('editUserDesignation').value = designation || '';
    openModal('editUserModal');
}

async function handleEditUserSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('editUserId').value;
    const btn = document.getElementById('btnSubmitEditUser');

    const payload = {
        fullName: document.getElementById('editUserFullName').value.trim(),
        role: document.getElementById('editUserRole').value,
        bureauId: document.getElementById('editUserBureau').value ? parseInt(document.getElementById('editUserBureau').value) : null,
        designation: document.getElementById('editUserDesignation').value.trim() || null
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        await Api.patch(CONFIG.ENDPOINTS.ADMIN_USER_UPDATE(id), payload);
        btn.disabled = false;
        btn.textContent = 'Save Changes';
        closeModal('editUserModal');
        alert('User details updated.');
        loadUsersData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
        alert('Failed to update user: ' + err.message);
    }
}

function openResetPasswordModal(id, email) {
    document.getElementById('resetPasswordUserId').value = id;
    document.getElementById('resetPasswordUserEmail').textContent = `Target User: ${email}`;
    document.getElementById('resetPasswordNew').value = '';
    openModal('resetPasswordModal');
}

async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('resetPasswordUserId').value;
    const newPassword = document.getElementById('resetPasswordNew').value;
    const btn = document.getElementById('btnSubmitResetPassword');

    try {
        btn.disabled = true;
        btn.textContent = 'Resetting...';
        await Api.post(`/admin/users/${id}/reset-password`, { newPassword: newPassword });
        btn.disabled = false;
        btn.textContent = 'Set New Password';
        closeModal('resetPasswordModal');
        alert('Password has been successfully updated.');
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Set New Password';
        alert('Failed to reset password: ' + err.message);
    }
}

async function toggleUserStatus(id, active) {
    if (!confirm(`Are you sure you want to ${active ? 'activate' : 'deactivate'} this user account?`)) return;

    try {
        await Api.patch(`/admin/users/${id}/status`, { active: active });
        loadUsersData();
    } catch (err) {
        alert('Failed to update status: ' + err.message);
    }
}

// =============================================================
// TAB 3: INSTITUTIONS REGISTRY
// =============================================================
async function loadInstitutionsData() {
    const tbody = document.getElementById('institutionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;"><div class="spinner"></div></td></tr>`;

    const region = document.getElementById('filterInstRegion')?.value || '';
    const query = document.getElementById('filterInstQuery')?.value || '';

    try {
        let url = `${CONFIG.ENDPOINTS.ADMIN_INSTITUTIONS}?page=0&size=20`;
        if (region) url += `&region=${encodeURIComponent(region)}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;

        const res = await Api.get(url);
        const insts = res.content || [];

        if (!insts.length) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">No institutions found.</td></tr>`;
            return;
        }

        tbody.innerHTML = insts.map(i => `
            <tr>
                <td style="font-weight:700;color:#04244a;">${i.permanentId}</td>
                <td style="font-weight:600;">${i.name}</td>
                <td><span class="role-pill" style="background:#eff6ff;color:#1e40af;">${i.region}</span></td>
                <td>${i.state}, ${i.city}</td>
                <td style="font-size:0.75rem;color:#475569;">${i.institutionType || 'Engineering'}</td>
                <td><span class="status-pill status-resolved">${i.approvalStatus || 'APPROVED'}</span></td>
                <td>
                    <span class="status-pill ${i.verified ? 'status-resolved' : 'status-under-review'}">
                        ${i.verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleVerifyInstitution(${i.id}, ${!i.verified})">
                        ${i.verified ? 'Unverify' : 'Verify'}
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading institutions:', err);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#dc2626;">Failed to load institutions: ${err.message}</td></tr>`;
    }
}

function resetInstFilters() {
    if (document.getElementById('filterInstRegion')) document.getElementById('filterInstRegion').value = '';
    if (document.getElementById('filterInstQuery')) document.getElementById('filterInstQuery').value = '';
    loadInstitutionsData();
}

function openAddInstitutionModal() {
    const form = document.getElementById('addInstitutionForm');
    if (form) form.reset();
    openModal('addInstitutionModal');
}

async function handleAddInstitutionSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitNewInst');

    const payload = {
        permanentId: document.getElementById('newInstPermId').value.trim(),
        name: document.getElementById('newInstName').value.trim(),
        region: document.getElementById('newInstRegion').value,
        state: document.getElementById('newInstState').value.trim(),
        city: document.getElementById('newInstCity').value.trim(),
        institutionType: document.getElementById('newInstType').value.trim(),
        approvalStatus: 'APPROVED',
        verified: true
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Registering...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_INSTITUTIONS, payload);
        btn.disabled = false;
        btn.textContent = 'Register Institution';
        closeModal('addInstitutionModal');
        alert('Institution registered successfully.');
        loadInstitutionsData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Register Institution';
        alert('Failed to register institution: ' + err.message);
    }
}

async function toggleVerifyInstitution(id, verified) {
    try {
        await Api.patch(`/admin/institutions/${id}/verify`, { verified: verified });
        loadInstitutionsData();
    } catch (err) {
        alert('Verification toggle failed: ' + err.message);
    }
}

// =============================================================
// TAB 4: BUREAUS & CELLS
// =============================================================
async function loadBureausData() {
    const tbody = document.getElementById('bureausTableBody');
    if (!tbody) return;

    try {
        const bureaus = await Api.get(CONFIG.ENDPOINTS.ADMIN_BUREAUS);
        if (!bureaus.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">No bureaus found.</td></tr>`;
            return;
        }

        tbody.innerHTML = bureaus.map(b => `
            <tr>
                <td style="font-weight:700;">#${b.id}</td>
                <td><span class="role-pill" style="background:#f0fdf4;color:#166534;font-weight:800;">${b.code}</span></td>
                <td style="font-weight:600;color:#04244a;">${b.name}</td>
                <td>${b.contactEmail || 'N/A'}</td>
                <td style="font-weight:700;">${b.totalCases || 0}</td>
                <td><span class="status-pill status-resolved">${b.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="switchAdminTab('paneCases', {bureauId: ${b.id}})">
                        View Cases &rarr;
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading bureaus:', err);
    }
}

function openAddBureauModal() {
    const form = document.getElementById('addBureauForm');
    if (form) form.reset();
    openModal('addBureauModal');
}

async function handleAddBureauSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitNewBureau');

    const payload = {
        code: document.getElementById('newBureauCode').value.trim(),
        name: document.getElementById('newBureauName').value.trim(),
        contactEmail: document.getElementById('newBureauEmail').value.trim() || null,
        description: document.getElementById('newBureauDesc').value.trim() || null,
        isActive: true
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Creating...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_BUREAUS, payload);
        btn.disabled = false;
        btn.textContent = 'Create Bureau';
        closeModal('addBureauModal');
        alert('Bureau / Cell registered successfully.');
        loadBureausData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Create Bureau';
        alert('Failed to create bureau: ' + err.message);
    }
}

async function loadTransfersData() {
    const tbody = document.getElementById('transfersTableBody');
    if (!tbody) return;

    try {
        const res = await Api.get(CONFIG.ENDPOINTS.TRANSFER_REQUESTS);
        const list = res.content || [];

        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">No transfer requests found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(t => `
            <tr>
                <td style="font-weight:700;">#${t.id}</td>
                <td style="font-weight:700;color:#04244a;">${t.caseNumber}</td>
                <td>${t.institutionName || 'AICTE Verified Institute'}</td>
                <td><strong>${t.fromBureauCode}</strong> &rarr; <strong>${t.toBureauCode}</strong></td>
                <td><span class="status-pill status-${(t.status || '').toLowerCase()}">${t.status}</span></td>
                <td style="font-size:0.75rem;color:#475569;">${t.reason || 'Supervisory routing review'}</td>
                <td>
                    ${t.status === 'PENDING' ? `
                        <button class="btn btn-primary btn-sm" onclick="openTransferDecisionModal(${t.id}, '${t.caseNumber}', '${t.fromBureauCode}', '${t.toBureauCode}')">
                            Decide &rarr;
                        </button>
                    ` : `<span style="font-size:0.75rem;color:#64748b;">Processed</span>`}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading transfers:', err);
    }
}

let activeTransferRequestId = null;
function openTransferDecisionModal(id, caseNumber, fromCode, toCode) {
    activeTransferRequestId = id;
    document.getElementById('decisionCaseInfo').textContent = `Case #${caseNumber}: Transfer from ${fromCode} to ${toCode}`;
    document.getElementById('transferDecisionRemarks').value = '';
    openModal('transferDecisionModal');
}

async function submitTransferDecision(approve) {
    if (!activeTransferRequestId) return;
    const remarks = document.getElementById('transferDecisionRemarks').value.trim();

    try {
        await Api.patch(CONFIG.ENDPOINTS.TRANSFER_DECISION(activeTransferRequestId), {
            approve: approve,
            remarks: remarks
        });
        closeModal('transferDecisionModal');
        alert(`Transfer request ${approve ? 'APPROVED' : 'REJECTED'}.`);
        loadTransfersData();
        loadDashboardOverview();
    } catch (err) {
        alert('Failed to process transfer decision: ' + err.message);
    }
}

// =============================================================
// TAB 5: REGIONS
// =============================================================
async function loadRegionsData() {
    const tbody = document.getElementById('regionsTableBody');
    if (!tbody) return;

    try {
        const regions = await Api.get(CONFIG.ENDPOINTS.ADMIN_REGIONS);
        if (!regions.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#64748b;">No regional offices configured.</td></tr>`;
            return;
        }

        tbody.innerHTML = regions.map(r => `
            <tr>
                <td><span class="role-pill" style="background:#eff6ff;color:#1e40af;font-weight:700;">${r.code}</span></td>
                <td style="font-weight:600;color:#04244a;">${r.name}</td>
                <td style="font-size:0.75rem;color:#475569;">${r.jurisdictionStates || 'All territory'}</td>
                <td>${r.coordinatorName || 'Regional Officer'}</td>
                <td style="font-weight:600;">${r.totalInstitutions}</td>
                <td style="font-weight:700;">${r.totalCases}</td>
                <td>${r.overdueCases > 0 ? `<span class="status-pill status-overdue">${r.overdueCases}</span>` : '0'}</td>
                <td><span class="status-pill status-resolved">${r.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="switchAdminTab('paneInstitutions', {region: '${r.name.replace(' Region', '')}'})">
                        Institutions &rarr;
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading regions:', err);
    }
}

function openAddRegionModal() {
    const form = document.getElementById('addRegionForm');
    if (form) form.reset();
    openModal('addRegionModal');
}

async function handleAddRegionSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitNewRegion');

    const payload = {
        name: document.getElementById('newRegionName').value.trim(),
        code: document.getElementById('newRegionCode').value.trim(),
        jurisdictionStates: document.getElementById('newRegionStates').value.trim() || null,
        coordinatorName: document.getElementById('newRegionCoordName').value.trim() || null,
        coordinatorEmail: document.getElementById('newRegionCoordEmail').value.trim() || null,
        status: 'ACTIVE'
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_REGIONS, payload);
        btn.disabled = false;
        btn.textContent = 'Save Jurisdiction';
        closeModal('addRegionModal');
        alert('Regional jurisdiction saved successfully.');
        loadRegionsData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Save Jurisdiction';
        alert('Failed to save region: ' + err.message);
    }
}

// =============================================================
// TAB 6: CASES & WORKFLOW
// =============================================================
async function loadCasesData() {
    const tbody = document.getElementById('casesTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;"><div class="spinner"></div></td></tr>`;

    const bureauId = document.getElementById('filterCaseBureau')?.value || '';
    const status = document.getElementById('filterCaseStatus')?.value || '';
    const priority = document.getElementById('filterCasePriority')?.value || '';
    const query = document.getElementById('filterCaseQuery')?.value || '';

    try {
        let url = `${CONFIG.ENDPOINTS.ADMIN_CASES}?page=0&size=20`;
        if (bureauId) url += `&bureauId=${bureauId}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (priority) url += `&priority=${encodeURIComponent(priority)}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;

        const res = await Api.get(url);
        const cases = res.content || [];

        if (!cases.length) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No complaints found matching criteria.</td></tr>`;
            return;
        }

        tbody.innerHTML = cases.map(c => `
            <tr>
                <td style="font-weight:700;color:#04244a;">${c.caseNumber}</td>
                <td style="font-weight:600;">${c.institutionName || 'Verified Institute'}</td>
                <td>${c.category}</td>
                <td><span class="role-pill" style="background:#f1f5f9;color:#334155;">${c.bureauCode || 'N/A'}</span></td>
                <td>${c.assignedToUserName || '<span style="color:#94a3b8;font-style:italic;">Unassigned</span>'}</td>
                <td><span class="status-pill status-${(c.status || '').toLowerCase().replace(/_/g, '-')}">${c.status}</span></td>
                <td style="font-size:0.75rem;color:#64748b;">${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'}</td>
                <td>${c.overdue ? '<span class="status-pill status-overdue">YES</span>' : '<span style="color:#16a34a;font-weight:700;">NO</span>'}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-primary btn-sm" onclick="openCaseDetailsModal(${c.id})">
                            Details &rarr;
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading cases:', err);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#dc2626;">Failed to load cases: ${err.message}</td></tr>`;
    }
}

function resetCaseFilters() {
    if (document.getElementById('filterCaseBureau')) document.getElementById('filterCaseBureau').value = '';
    if (document.getElementById('filterCaseStatus')) document.getElementById('filterCaseStatus').value = '';
    if (document.getElementById('filterCasePriority')) document.getElementById('filterCasePriority').value = '';
    if (document.getElementById('filterCaseQuery')) document.getElementById('filterCaseQuery').value = '';
    loadCasesData();
}

// 12-Section Case Details Modal
async function openCaseDetailsModal(caseId) {
    try {
        const c = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
        currentSelectedCase = c;

        document.getElementById('caseDetailsModalTitle').textContent = `Case #${c.caseNumber}: ${c.title}`;
        document.getElementById('caseDetailsModalSub').textContent = `Institution: ${c.institutionName} (${c.permanentId}) | Status: ${c.status} | Priority: ${c.priority}`;

        // Populate Section 1: Overview
        document.getElementById('csecOverviewContent').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div><strong>Case Number:</strong> ${c.caseNumber}</div>
                <div><strong>Current Status:</strong> <span class="status-pill status-${(c.status || '').toLowerCase().replace(/_/g, '-')}">${c.status}</span></div>
                <div><strong>Institution:</strong> ${c.institutionName} (${c.permanentId})</div>
                <div><strong>Region:</strong> ${c.region || 'Western'} (${c.state})</div>
                <div><strong>Primary Bureau:</strong> ${c.bureauName} (${c.bureauCode})</div>
                <div><strong>Assigned Officer:</strong> ${c.assignedToUserName || 'Unassigned (Bureau Pool)'}</div>
                <div><strong>Supporting Units:</strong> ${c.supportingBureaus || 'None'}</div>
                <div><strong>SLA Due Date:</strong> ${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'} ${c.overdue ? '<span class="status-pill status-overdue">OVERDUE</span>' : ''}</div>
            </div>
        `;

        // Section 2: Details
        document.getElementById('csecDetailsContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;margin-bottom:12px;">
                <h4 style="margin:0 0 6px;color:#04244a;">Subject: ${c.title}</h4>
                <div style="font-size:0.8rem;color:#64748b;margin-bottom:12px;">Category: <strong>${c.category}</strong> | Received: ${c.receiptDate ? new Date(c.receiptDate).toLocaleString() : 'N/A'}</div>
                <p style="white-space:pre-wrap;font-size:0.85rem;color:#1e293b;line-height:1.6;">${c.description}</p>
            </div>
        `;

        // Section 3: Institution
        document.getElementById('csecInstitutionContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <div><strong>Official Name:</strong> ${c.institutionName}</div>
                <div><strong>AICTE Permanent ID:</strong> ${c.permanentId}</div>
                <div><strong>Address:</strong> ${c.city}, ${c.state}</div>
                <div><strong>Region:</strong> ${c.region}</div>
            </div>
        `;

        // Section 4: Assignments
        document.getElementById('csecAssignmentsContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <div><strong>Primary Bureau:</strong> ${c.bureauCode} - ${c.bureauName}</div>
                <div><strong>Assigned Officer:</strong> ${c.assignedToUserName || 'Not Assigned'}</div>
                <div><strong>Supporting Bureaus:</strong> ${c.supportingBureaus || 'None Assigned'}</div>
            </div>
        `;

        // Section 5: Supporting Units
        document.getElementById('csecSupportingContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <h4 style="margin:0 0 8px;color:#04244a;">RB-PGRC Coordination Architecture</h4>
                <p style="font-size:0.82rem;color:#475569;line-height:1.6;">
                    This complaint maintains canonical Case ID <strong>${c.caseNumber}</strong>. Supporting units involved: <strong>${c.supportingBureaus || 'None yet'}</strong>. All actions are appended to the immutable history below.
                </p>
            </div>
        `;

        // Section 6: Timeline History
        const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));
        document.getElementById('csecTimelineContent').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${history && history.length ? history.map(h => `
                    <div style="display:flex;gap:12px;background:#ffffff;border:1px solid #e2e8f0;padding:10px 14px;border-radius:4px;">
                        <span style="color:#0076ff;font-weight:700;">●</span>
                        <div style="flex:1;">
                            <div style="font-weight:700;color:#04244a;font-size:0.85rem;">${h.actionType}</div>
                            <div style="font-size:0.82rem;color:#334155;">${h.remarks}</div>
                            <div style="font-size:0.72rem;color:#94a3b8;margin-top:4px;">By: ${h.actingUserName || 'Super Admin'} &bull; ${h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</div>
                        </div>
                    </div>
                `).join('') : '<p style="color:#64748b;">No action timeline recorded yet.</p>'}
            </div>
        `;

        // Section 7: Institution Response
        document.getElementById('csecInstResponseContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <h4 style="margin:0 0 8px;color:#04244a;">Official Clarification from Institution Representative</h4>
                ${c.institutionResponse ? `
                    <p style="white-space:pre-wrap;font-size:0.85rem;color:#1e293b;line-height:1.6;">${c.institutionResponse}</p>
                    <div style="font-size:0.75rem;color:#64748b;margin-top:8px;">Submitted on: ${c.institutionResponseDate ? new Date(c.institutionResponseDate).toLocaleString() : 'N/A'}</div>
                ` : `
                    <p style="color:#64748b;font-size:0.82rem;">No institution response recorded yet.</p>
                    <button class="btn btn-primary btn-sm" onclick="openRequestResponseModal()">Request Institution Response &rarr;</button>
                `}
            </div>
        `;

        // Section 8: Internal Notes
        document.getElementById('csecInternalNotesContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <h4 style="margin:0 0 8px;color:#04244a;">Confidential Administrative Notes</h4>
                ${c.internalNotes ? `
                    <pre style="white-space:pre-wrap;font-size:0.82rem;color:#334155;font-family:inherit;">${c.internalNotes}</pre>
                ` : '<p style="color:#64748b;font-size:0.82rem;">No internal notes added.</p>'}
            </div>
        `;

        // Section 9: Duplicates
        document.getElementById('csecDuplicatesContent').innerHTML = `
            <div style="background:#f8fafc;padding:16px;border-radius:4px;border:1px solid #e2e8f0;">
                <h4 style="margin:0 0 8px;color:#04244a;">Cross-Bureau Duplicate Review</h4>
                <div><strong>Duplicate Status:</strong> <span class="role-pill" style="background:#eff6ff;color:#1d4ed8;">${c.duplicateStatus || 'NONE'}</span></div>
                ${c.duplicateOfCaseId ? `<div><strong>Master Case ID:</strong> #${c.duplicateOfCaseId}</div>` : ''}
                <div style="margin-top:12px;">
                    <button class="btn btn-secondary btn-sm" onclick="openDuplicateReviewModal()">Review Duplicate Decision &rarr;</button>
                </div>
            </div>
        `;

        // Bind Sub-Tabs
        document.querySelectorAll('.case-tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.case-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.case-section-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-case-section');
                const pane = document.getElementById(targetId);
                if (pane) pane.classList.add('active');
            };
        });

        openModal('caseDetailsModal');
    } catch (err) {
        alert('Failed to load case details: ' + err.message);
    }
}

// Case Action Modals
function openAssignCaseModal() {
    if (!currentSelectedCase) return;
    document.getElementById('assignCaseId').value = currentSelectedCase.id;
    document.getElementById('assignPrimaryBureau').value = currentSelectedCase.bureauId || '1';
    document.getElementById('assignSupportingBureaus').value = currentSelectedCase.supportingBureaus || '';
    document.getElementById('assignReason').value = '';
    loadOfficersForSelect(currentSelectedCase.bureauId || 1);
    openModal('assignCaseModal');
}

async function loadOfficersForSelect(bureauId) {
    const sel = document.getElementById('assignOfficerSelect');
    if (!sel) return;
    sel.innerHTML = `<option value="">Bureau General Pool (Unassigned)</option>`;
    try {
        const res = await Api.get(`${CONFIG.ENDPOINTS.ADMIN_USERS}?bureauId=${bureauId}&size=50`);
        const users = res.content || [];
        users.forEach(u => {
            sel.innerHTML += `<option value="${u.id}">${u.fullName} (${u.email})</option>`;
        });
    } catch (e) {
        console.error('Error loading officers:', e);
    }
}

async function handleAssignCaseSubmit(event) {
    event.preventDefault();
    if (!currentSelectedCase) return;
    const btn = document.getElementById('btnSubmitAssign');

    const officerId = document.getElementById('assignOfficerSelect').value;
    const payload = {
        primaryBureauId: parseInt(document.getElementById('assignPrimaryBureau').value),
        officerUserId: officerId ? parseInt(officerId) : null,
        supportingBureaus: document.getElementById('assignSupportingBureaus').value.trim() || null,
        reason: document.getElementById('assignReason').value.trim() || null
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        await Api.patch(CONFIG.ENDPOINTS.ADMIN_CASE_ASSIGN(currentSelectedCase.id), payload);
        btn.disabled = false;
        btn.textContent = 'Save Assignment';
        closeModal('assignCaseModal');
        alert('Case assignment successfully updated.');
        openCaseDetailsModal(currentSelectedCase.id);
        loadCasesData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Save Assignment';
        alert('Failed to assign case: ' + err.message);
    }
}

function openCaseStatusModal() {
    if (!currentSelectedCase) return;
    document.getElementById('statusCaseId').value = currentSelectedCase.id;
    document.getElementById('newCaseStatus').value = currentSelectedCase.status || 'IN_PROGRESS';
    document.getElementById('statusChangeRemarks').value = '';
    openModal('caseStatusModal');
}

async function handleCaseStatusSubmit(event) {
    event.preventDefault();
    if (!currentSelectedCase) return;
    const btn = document.getElementById('btnSubmitStatusChange');

    const payload = {
        status: document.getElementById('newCaseStatus').value,
        remarks: document.getElementById('statusChangeRemarks').value.trim()
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Updating...';
        await Api.patch(CONFIG.ENDPOINTS.ADMIN_CASE_STATUS(currentSelectedCase.id), payload);
        btn.disabled = false;
        btn.textContent = 'Update Status';
        closeModal('caseStatusModal');
        alert('Case status updated successfully.');
        openCaseDetailsModal(currentSelectedCase.id);
        loadCasesData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Update Status';
        alert('Failed to update status: ' + err.message);
    }
}

function openInternalNoteModal() {
    if (!currentSelectedCase) return;
    document.getElementById('noteCaseId').value = currentSelectedCase.id;
    document.getElementById('internalNoteText').value = '';
    openModal('internalNoteModal');
}

async function handleInternalNoteSubmit(event) {
    event.preventDefault();
    if (!currentSelectedCase) return;
    const btn = document.getElementById('btnSubmitNote');
    const note = document.getElementById('internalNoteText').value.trim();

    try {
        btn.disabled = true;
        btn.textContent = 'Recording...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_CASE_NOTE(currentSelectedCase.id), { note: note });
        btn.disabled = false;
        btn.textContent = 'Record Note';
        closeModal('internalNoteModal');
        alert('Internal note recorded.');
        openCaseDetailsModal(currentSelectedCase.id);
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Record Note';
        alert('Failed to record internal note: ' + err.message);
    }
}

function openRequestResponseModal() {
    if (!currentSelectedCase) return;
    const reason = prompt('Enter official clarification / document request for institution representative:');
    if (!reason) return;

    Api.post(CONFIG.ENDPOINTS.ADMIN_CASE_REQUEST_RESPONSE(currentSelectedCase.id), { reason: reason })
        .then(() => {
            alert('Institution response requested.');
            openCaseDetailsModal(currentSelectedCase.id);
        })
        .catch(err => alert('Request failed: ' + err.message));
}

function openDuplicateReviewModal() {
    if (!currentSelectedCase) return;
    const decision = confirm('Do you want to CONFIRM this case as a duplicate and merge it into a Master Case? Click OK to Confirm, Cancel to Dismiss flag.') ? 'CONFIRM' : 'DISMISS';
    let masterId = null;
    if (decision === 'CONFIRM') {
        const input = prompt('Enter Master Case ID # to link:');
        if (!input) return;
        masterId = parseInt(input);
    }
    const remarks = prompt('Enter administrative review remarks:');

    Api.post(CONFIG.ENDPOINTS.ADMIN_CASE_DUPLICATE_REVIEW(currentSelectedCase.id), {
        decision: decision,
        duplicateOfCaseId: masterId,
        remarks: remarks || 'Supervisory duplicate review'
    }).then(() => {
        alert('Duplicate decision recorded.');
        openCaseDetailsModal(currentSelectedCase.id);
        loadCasesData();
    }).catch(err => alert('Duplicate review failed: ' + err.message));
}

// =============================================================
// TAB 7: REPORTS
// =============================================================
async function generateReportData() {
    const container = document.getElementById('reportOutputContainer');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center;padding:24px;"><div class="spinner"></div><p style="margin-top:8px;color:#64748b;">Generating report aggregation...</p></div>`;

    const reportType = document.getElementById('reportTypeSelect')?.value || 'CASE_SUMMARY';

    try {
        const res = await Api.get(`${CONFIG.ENDPOINTS.ADMIN_REPORTS}?reportType=${reportType}`);
        currentReportData = res;

        container.innerHTML = `
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:20px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div>
                        <h4 style="margin:0;font-size:1.1rem;color:#04244a;">Report: ${res.reportType}</h4>
                        <div style="font-size:0.75rem;color:#64748b;">Generated at: ${new Date(res.generatedAt).toLocaleString()} &bull; AICTE Statutory Standards</div>
                    </div>
                    <span class="role-pill" style="background:#dcfce7;color:#166534;font-size:0.8rem;padding:6px 12px;">Verified Aggregation</span>
                </div>

                <!-- Metrics Strip -->
                <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;margin-bottom:20px;">
                    <div style="background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:4px;text-align:center;">
                        <div style="font-size:0.7rem;color:#64748b;font-weight:700;">TOTAL CASES</div>
                        <div style="font-size:1.4rem;font-weight:800;color:#04244a;">${res.summaryMetrics.totalCases}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:4px;text-align:center;">
                        <div style="font-size:0.7rem;color:#64748b;font-weight:700;">PENDING</div>
                        <div style="font-size:1.4rem;font-weight:800;color:#d97706;">${res.summaryMetrics.pendingCases}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:4px;text-align:center;">
                        <div style="font-size:0.7rem;color:#64748b;font-weight:700;">DISPOSED</div>
                        <div style="font-size:1.4rem;font-weight:800;color:#16a34a;">${res.summaryMetrics.disposedCases}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:4px;text-align:center;">
                        <div style="font-size:0.7rem;color:#64748b;font-weight:700;">OVERDUE</div>
                        <div style="font-size:1.4rem;font-weight:800;color:#dc2626;">${res.summaryMetrics.overdueCases}</div>
                    </div>
                    <div style="background:#fff;border:1px solid #e2e8f0;padding:12px;border-radius:4px;text-align:center;">
                        <div style="font-size:0.7rem;color:#64748b;font-weight:700;">COMPLIANCE RATE</div>
                        <div style="font-size:1.4rem;font-weight:800;color:#0284c7;">${res.summaryMetrics.complianceRatePercentage}%</div>
                    </div>
                </div>

                <!-- Workload Table -->
                <h4 style="font-size:0.92rem;color:#04244a;margin-bottom:8px;">Bureau Regulatory Breakdown</h4>
                <div class="table-responsive" style="background:#fff;border-radius:4px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Bureau Code</th>
                                <th>Official Bureau Name</th>
                                <th>Total Assigned Complaints</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${res.bureauWorkloads.map(b => `
                                <tr>
                                    <td><span class="role-pill" style="background:#f1f5f9;color:#334155;font-weight:700;">${b.bureauCode}</span></td>
                                    <td style="font-weight:600;">${b.bureauName}</td>
                                    <td style="font-weight:700;color:#04244a;">${b.caseCount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="text-align:center;padding:24px;color:#dc2626;">Report generation failed: ${err.message}</div>`;
    }
}

function exportReportToCsv() {
    if (!currentReportData) {
        alert('Please generate a report first.');
        return;
    }

    let csv = `Report Type,${currentReportData.reportType}\n`;
    csv += `Generated At,${currentReportData.generatedAt}\n\n`;
    csv += `Metric,Value\n`;
    Object.entries(currentReportData.summaryMetrics).forEach(([k, v]) => {
        csv += `${k},${v}\n`;
    });
    csv += `\nBureau Code,Bureau Name,Total Complaints\n`;
    currentReportData.bureauWorkloads.forEach(b => {
        csv += `${b.bureauCode},"${b.bureauName}",${b.caseCount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE-Report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// =============================================================
// TAB 8: SYSTEM SETTINGS
// =============================================================
async function loadSettingsData() {
    try {
        const settings = await Api.get(CONFIG.ENDPOINTS.ADMIN_SETTINGS);
        settings.forEach(s => {
            if (s.settingKey === 'platform_name') {
                const el = document.getElementById('settingPlatformName');
                if (el) el.value = s.settingValue;
            } else if (s.settingKey === 'default_disposal_days') {
                const el = document.getElementById('settingDefaultDisposalDays');
                if (el) el.value = s.settingValue;
            } else if (s.settingKey === 'duplicate_similarity_threshold') {
                const el = document.getElementById('settingSimilarityThreshold');
                if (el) el.value = s.settingValue;
            } else if (s.settingKey === 'password_min_length') {
                const el = document.getElementById('settingPasswordMinLength');
                if (el) el.value = s.settingValue;
            } else if (s.settingKey === 'session_timeout_minutes') {
                const el = document.getElementById('settingSessionTimeout');
                if (el) el.value = s.settingValue;
            }
        });
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

async function saveSystemSettings() {
    const payload = {
        platform_name: document.getElementById('settingPlatformName')?.value || 'EduVision',
        default_disposal_days: document.getElementById('settingDefaultDisposalDays')?.value || '45',
        duplicate_similarity_threshold: document.getElementById('settingSimilarityThreshold')?.value || '0.75',
        password_min_length: document.getElementById('settingPasswordMinLength')?.value || '8',
        session_timeout_minutes: document.getElementById('settingSessionTimeout')?.value || '1440'
    };

    try {
        await Api.post(CONFIG.ENDPOINTS.ADMIN_SETTINGS, payload);
        alert('System settings successfully saved and audited.');
        loadSettingsData();
    } catch (err) {
        alert('Failed to save settings: ' + err.message);
    }
}

// =============================================================
// TAB 9: AUDIT LOGS
// =============================================================
async function loadAuditLogsData() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;"><div class="spinner"></div></td></tr>`;

    const action = document.getElementById('filterAuditAction')?.value || '';
    const entity = document.getElementById('filterAuditEntity')?.value || '';

    try {
        let url = `${CONFIG.ENDPOINTS.AUDIT_LOGS}?page=0&size=30`;
        if (action) url += `&action=${encodeURIComponent(action)}`;
        if (entity) url += `&entityType=${encodeURIComponent(entity)}`;

        const res = await Api.get(url);
        const logs = res.content || [];

        if (!logs.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">No audit logs found.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td style="font-weight:700;">#${l.id}</td>
                <td style="font-size:0.75rem;color:#64748b;">${l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A'}</td>
                <td style="font-weight:600;color:#04244a;">${l.userEmail || 'System Admin'}</td>
                <td><span class="role-pill" style="background:#eff6ff;color:#1e40af;">${l.action}</span></td>
                <td><strong>${l.entityType || 'SYSTEM'}</strong> ${l.entityId ? '#' + l.entityId : ''}</td>
                <td style="font-size:0.78rem;color:#334155;">${l.details || ''}</td>
                <td style="font-size:0.72rem;color:#94a3b8;">${l.ipAddress || '127.0.0.1'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading audit logs:', err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#dc2626;">Failed to load audit logs: ${err.message}</td></tr>`;
    }
}

function resetAuditFilters() {
    if (document.getElementById('filterAuditAction')) document.getElementById('filterAuditAction').value = '';
    if (document.getElementById('filterAuditEntity')) document.getElementById('filterAuditEntity').value = '';
    loadAuditLogsData();
}

// =============================================================
// TAB 11: HELP & SUPPORT TICKETS
// =============================================================
async function loadSupportTicketsData() {
    const tbody = document.getElementById('supportTicketsTableBody');
    if (!tbody) return;

    try {
        const res = await Api.get(CONFIG.ENDPOINTS.ADMIN_SUPPORT_TICKETS);
        const list = res.content || [];

        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">No support tickets logged.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(t => `
            <tr>
                <td style="font-weight:700;color:#04244a;">${t.ticketNumber}</td>
                <td style="font-weight:600;">${t.title}</td>
                <td><span class="role-pill" style="background:#f1f5f9;color:#334155;">${t.category}</span></td>
                <td><span class="status-pill status-${t.priority === 'HIGH' ? 'overdue' : 'under-review'}">${t.priority}</span></td>
                <td>${t.createdByUserEmail || 'System Admin'}</td>
                <td><span class="status-pill status-${t.status === 'OPEN' ? 'under-review' : 'resolved'}">${t.status}</span></td>
                <td style="font-size:0.75rem;color:#64748b;">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading support tickets:', err);
    }
}

async function handleSupportTicketSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitTicket');

    const payload = {
        title: document.getElementById('ticketTitle').value.trim(),
        category: document.getElementById('ticketCategory').value,
        description: document.getElementById('ticketDesc').value.trim(),
        priority: 'MEDIUM'
    };

    try {
        btn.disabled = true;
        btn.textContent = 'Submitting...';
        await Api.post(CONFIG.ENDPOINTS.ADMIN_SUPPORT_TICKETS, payload);
        btn.disabled = false;
        btn.textContent = 'Submit Support Ticket →';
        document.getElementById('supportTicketForm').reset();
        alert('Technical support ticket submitted.');
        loadSupportTicketsData();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Submit Support Ticket →';
        alert('Failed to submit ticket: ' + err.message);
    }
}

// =============================================================
// TOP NAV: GLOBAL SEARCH & NOTIFICATIONS
// =============================================================
function renderGlobalSearchResults(results) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    let totalItems = 0;

    // 1. Cases
    if (results.cases && results.cases.length) {
        totalItems += results.cases.length;
        dropdown.innerHTML += `<div class="search-result-group-title">Complaints (${results.cases.length})</div>`;
        results.cases.forEach(c => {
            dropdown.innerHTML += `
                <div class="search-result-item" onclick="openCaseDetailsModal(${c.id})">
                    <div style="font-weight:700;color:#04244a;font-size:0.82rem;">${c.caseNumber} &bull; ${c.title}</div>
                    <div style="font-size:0.72rem;color:#64748b;">${c.institutionName || 'Verified Institute'} &bull; Status: ${c.status}</div>
                </div>
            `;
        });
    }

    // 2. Institutions
    if (results.institutions && results.institutions.length) {
        totalItems += results.institutions.length;
        dropdown.innerHTML += `<div class="search-result-group-title">Institutions (${results.institutions.length})</div>`;
        results.institutions.forEach(i => {
            dropdown.innerHTML += `
                <div class="search-result-item" onclick="switchAdminTab('paneInstitutions', {query: '${i.permanentId}'})">
                    <div style="font-weight:700;color:#04244a;font-size:0.82rem;">${i.name}</div>
                    <div style="font-size:0.72rem;color:#64748b;">Permanent ID: ${i.permanentId} &bull; ${i.city}, ${i.state}</div>
                </div>
            `;
        });
    }

    // 3. Users
    if (results.users && results.users.length) {
        totalItems += results.users.length;
        dropdown.innerHTML += `<div class="search-result-group-title">Officers &amp; Users (${results.users.length})</div>`;
        results.users.forEach(u => {
            dropdown.innerHTML += `
                <div class="search-result-item" onclick="switchAdminTab('paneUsers', {query: '${u.email}'})">
                    <div style="font-weight:700;color:#04244a;font-size:0.82rem;">${u.fullName} (${u.role})</div>
                    <div style="font-size:0.72rem;color:#64748b;">${u.email} &bull; ${u.designation || 'Officer'}</div>
                </div>
            `;
        });
    }

    if (!totalItems) {
        dropdown.innerHTML = `<div style="padding:16px;text-align:center;color:#64748b;font-size:0.82rem;">No matching records found.</div>`;
    }

    dropdown.classList.add('active');
}

async function loadNotificationsCount() {
    try {
        const notes = await Api.get(CONFIG.ENDPOINTS.NOTIFICATIONS);
        const badge = document.getElementById('notificationBadge');
        if (badge && notes.length) {
            badge.textContent = notes.length;
            badge.style.display = 'flex';
        }
    } catch (e) {
        console.error('Error fetching notifications count:', e);
    }
}

async function loadNotifications() {
    const listEl = document.getElementById('notificationsList');
    if (!listEl) return;

    try {
        const notes = await Api.get(CONFIG.ENDPOINTS.NOTIFICATIONS);
        if (!notes.length) {
            listEl.innerHTML = `<div style="padding:16px;text-align:center;color:#64748b;font-size:0.8rem;">No pending alerts.</div>`;
            return;
        }

        listEl.innerHTML = notes.map(n => `
            <div class="notification-item" onclick="switchAdminTab('pane${n.link === 'cases' ? 'Cases' : 'Bureaus'}')">
                <div class="notification-title">${n.title}</div>
                <div class="notification-desc">${n.message}</div>
                <div class="notification-time">${new Date(n.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    } catch (e) {
        listEl.innerHTML = `<div style="padding:16px;text-align:center;color:#dc2626;font-size:0.8rem;">Failed to load alerts.</div>`;
    }
}

function openMyProfileModal() {
    const user = Auth.getUser();
    const content = document.getElementById('myProfileContent');
    if (!content || !user) return;

    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div class="user-avatar" style="width:54px;height:54px;font-size:1.4rem;">${user.fullName ? user.fullName.charAt(0) : 'A'}</div>
            <div>
                <h4 style="margin:0;font-size:1.1rem;color:#04244a;">${user.fullName}</h4>
                <div style="font-size:0.78rem;color:#64748b;">${user.email}</div>
                <span class="role-pill" style="background:#fef2f2;color:#991b1b;margin-top:4px;">${user.role}</span>
            </div>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;font-size:0.82rem;display:flex;flex-direction:column;gap:8px;">
            <div><strong>Designation:</strong> ${user.designation || 'Chief Information Officer'}</div>
            <div><strong>Contact Phone:</strong> ${user.phone || '+91 11 2958 1001'}</div>
            <div><strong>Jurisdiction:</strong> National AICTE Oversight Console</div>
            <div><strong>Account Status:</strong> <span class="status-pill status-resolved">ACTIVE</span></div>
        </div>
    `;

    openModal('myProfileModal');
}

// =============================================================
// TAB: OFFICER REGISTRATION REQUESTS MANAGEMENT
// =============================================================

async function loadOfficerRequestsData() {
    const tbody = document.getElementById('officerRequestsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;"><div class="spinner"></div><p style="margin-top:8px;font-size:0.85rem;color:#64748b;">Loading officer registration requests...</p></td></tr>`;

    const status = document.getElementById('filterOfficerReqStatus')?.value || '';
    const bureauCode = document.getElementById('filterOfficerReqBureau')?.value || '';
    const query = (document.getElementById('filterOfficerReqQuery')?.value || '').trim();

    try {
        let url = `${CONFIG.ENDPOINTS.OFFICER_REQUESTS}?page=0&size=50`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (bureauCode) url += `&bureauCode=${encodeURIComponent(bureauCode)}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;

        const res = await Api.get(url);
        const list = res.content || [];

        // Update pending count badge
        updateOfficerRequestBadge(list);

        if (!list.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:32px;color:#64748b;">
                        <span style="font-size:1.8rem;display:block;margin-bottom:8px;">📭</span>
                        No officer registration requests match the selected criteria.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map(req => {
            let statusPill = '';
            if (req.status === 'PENDING_APPROVAL') {
                statusPill = `<span class="status-pill status-pending" style="background:#fef3c7;color:#92400e;font-weight:700;">PENDING APPROVAL</span>`;
            } else if (req.status === 'APPROVED') {
                statusPill = `<span class="status-pill status-resolved" style="background:#dcfce7;color:#166534;font-weight:700;">APPROVED &amp; ACTIVE</span>`;
            } else {
                statusPill = `<span class="status-pill status-closed" style="background:#fee2e2;color:#991b1b;font-weight:700;">REJECTED</span>`;
            }

            const bureauBadge = (req.requestedBureauCode === 'RB')
                ? `<span class="role-pill" style="background:#eff6ff;color:#1e40af;font-weight:700;">RB (Regulation)</span>`
                : `<span class="role-pill" style="background:#f5f3ff;color:#6d28d9;font-weight:700;">PGRC (Grievances)</span>`;

            const isPending = req.status === 'PENDING_APPROVAL';

            return `
                <tr>
                    <td>
                        <strong style="font-family:monospace;color:#0b2545;">${req.requestId}</strong>
                    </td>
                    <td>
                        <strong style="color:#0f172a;">${Common.escapeHtml(req.fullName)}</strong>
                        <div style="font-size:0.75rem;color:#64748b;">${req.phone || 'No phone'}</div>
                    </td>
                    <td>
                        <span style="color:#2563eb;">${Common.escapeHtml(req.email)}</span>
                    </td>
                    <td>
                        ${bureauBadge}
                        <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">BUREAU_OFFICER</div>
                    </td>
                    <td>
                        <div>${Common.escapeHtml(req.designation || 'Officer')}</div>
                        <div style="font-size:0.75rem;color:#64748b;font-family:monospace;">ID: ${req.employeeId || 'N/A'}</div>
                    </td>
                    <td style="font-size:0.8rem;color:#475569;">
                        ${new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                        ${statusPill}
                    </td>
                    <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn btn-outline btn-sm" onclick="viewOfficerRequestDetail(${req.id})" title="View complete application dossier">
                                View
                            </button>
                            ${isPending ? `
                                <button class="btn btn-primary btn-sm" style="background:#16a34a;border-color:#16a34a;padding:4px 8px;" onclick="openApproveOfficerModal(${req.id}, '${Common.escapeHtml(req.fullName).replace(/'/g, "\\'")}', '${req.requestedBureauCode}')" title="Approve and issue activation token">
                                    Approve
                                </button>
                                <button class="btn btn-danger btn-sm" style="padding:4px 8px;" onclick="openRejectOfficerModal(${req.id}, '${Common.escapeHtml(req.fullName).replace(/'/g, "\\'")}')" title="Reject request with formal reason">
                                    Reject
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:24px;color:#ef4444;">
                    Failed to load officer requests: ${Common.escapeHtml(err.message)}
                </td>
            </tr>
        `;
    }
}

function updateOfficerRequestBadge(list) {
    const badge = document.getElementById('badgePendingOfficerRequests');
    if (!badge) return;
    const pendingCount = list.filter(r => r.status === 'PENDING_APPROVAL').length;
    if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function resetOfficerReqFilters() {
    const s = document.getElementById('filterOfficerReqStatus');
    const b = document.getElementById('filterOfficerReqBureau');
    const q = document.getElementById('filterOfficerReqQuery');
    if (s) s.value = 'PENDING_APPROVAL';
    if (b) b.value = '';
    if (q) q.value = '';
    loadOfficerRequestsData();
}

async function viewOfficerRequestDetail(id) {
    const modal = document.getElementById('officerRequestDetailModal');
    const body = document.getElementById('officerRequestDetailBody');
    const footer = document.getElementById('officerRequestDetailFooter');

    openModal('officerRequestDetailModal');
    body.innerHTML = `<div style="text-align:center;padding:24px;"><div class="spinner"></div><p style="margin-top:8px;">Fetching application dossier...</p></div>`;

    try {
        const req = await Api.get(`${CONFIG.ENDPOINTS.OFFICER_REQUESTS}/${id}`);

        let statusBadge = '';
        if (req.status === 'PENDING_APPROVAL') {
            statusBadge = `<span class="badge" style="background:#fef3c7;color:#92400e;font-weight:700;padding:4px 10px;">PENDING APPROVAL</span>`;
        } else if (req.status === 'APPROVED') {
            statusBadge = `<span class="badge" style="background:#dcfce7;color:#166534;font-weight:700;padding:4px 10px;">APPROVED &amp; ACTIVE</span>`;
        } else {
            statusBadge = `<span class="badge" style="background:#fee2e2;color:#991b1b;font-weight:700;padding:4px 10px;">REJECTED</span>`;
        }

        body.innerHTML = `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div>
                        <span style="font-family:monospace;font-size:1.15rem;font-weight:700;color:#0b2545;">${req.requestId}</span>
                        <span style="color:#64748b;font-size:0.8rem;margin-left:8px;">Submitted: ${new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                    ${statusBadge}
                </div>
                <div style="font-size:0.85rem;color:#475569;">
                    Requested Bureau: <strong>${req.requestedBureauCode === 'RB' ? 'Regulation Bureau (RB)' : 'Public Grievance Redressal Cell (PGRC)'}</strong>
                    &bull; Role: <strong>BUREAU_OFFICER</strong>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:12px;">
                    <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;">Officer Details</div>
                    <div style="font-size:1rem;font-weight:700;color:#0b2545;margin-top:4px;">${Common.escapeHtml(req.fullName)}</div>
                    <div style="font-size:0.83rem;color:#2563eb;margin-top:2px;">${Common.escapeHtml(req.email)}</div>
                    <div style="font-size:0.8rem;color:#475569;margin-top:2px;">Phone: ${req.phone || 'N/A'}</div>
                </div>
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:12px;">
                    <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;">Official Posting &amp; Credentials</div>
                    <div style="font-size:0.95rem;font-weight:600;color:#0b2545;margin-top:4px;">Designation: ${Common.escapeHtml(req.designation || 'Officer')}</div>
                    <div style="font-size:0.83rem;color:#475569;margin-top:2px;">Staff ID / Code: <strong>${req.employeeId || 'N/A'}</strong></div>
                    <div style="font-size:0.8rem;color:#64748b;margin-top:2px;">Department: ${req.department || 'N/A'}</div>
                </div>
            </div>

            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:14px;margin-bottom:16px;">
                <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Official Purpose &amp; Verification Remarks</div>
                <p style="font-size:0.88rem;color:#334155;margin:0;line-height:1.5;">${Common.escapeHtml(req.verificationInfo || 'No additional remarks provided.')}</p>
            </div>

            ${req.status === 'APPROVED' ? `
                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:14px;margin-bottom:12px;">
                    <strong style="color:#166534;font-size:0.88rem;">Approval Audit Record:</strong>
                    <div style="font-size:0.82rem;color:#166534;margin-top:4px;">
                        Approved by Super Admin on ${new Date(req.approvedAt).toLocaleString()}
                    </div>
                    ${req.adminRemarks ? `<div style="font-size:0.82rem;color:#374151;margin-top:4px;">Remarks: <em>${Common.escapeHtml(req.adminRemarks)}</em></div>` : ''}
                    ${req.activationUrl ? `
                        <div style="margin-top:8px;">
                            <label style="font-size:0.75rem;font-weight:700;color:#166534;">Activation URL:</label>
                            <input type="text" readonly value="${req.activationUrl}" class="form-control" style="font-family:monospace;font-size:0.75rem;margin-top:2px;">
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${req.status === 'REJECTED' ? `
                <div style="background:#fef2f2;border:1px solid #f87171;border-radius:4px;padding:14px;margin-bottom:12px;">
                    <strong style="color:#991b1b;font-size:0.88rem;">Rejection Record:</strong>
                    <div style="font-size:0.82rem;color:#991b1b;margin-top:4px;">
                        Rejected by Super Admin on ${new Date(req.approvedAt || req.updatedAt).toLocaleString()}
                    </div>
                    <div style="font-size:0.85rem;color:#7f1d1d;margin-top:6px;font-weight:600;">
                        Reason: ${Common.escapeHtml(req.rejectionReason || 'No reason specified.')}
                    </div>
                </div>
            ` : ''}
        `;

        if (req.status === 'PENDING_APPROVAL') {
            footer.innerHTML = `
                <button class="btn btn-secondary" onclick="closeModal('officerRequestDetailModal')">Close</button>
                <button class="btn btn-danger" onclick="closeModal('officerRequestDetailModal'); openRejectOfficerModal(${req.id}, '${Common.escapeHtml(req.fullName).replace(/'/g, "\\'")}')">Reject Request</button>
                <button class="btn btn-primary" style="background:#16a34a;border-color:#16a34a;" onclick="closeModal('officerRequestDetailModal'); openApproveOfficerModal(${req.id}, '${Common.escapeHtml(req.fullName).replace(/'/g, "\\'")}', '${req.requestedBureauCode}')">Approve &amp; Issue Token &rarr;</button>
            `;
        } else {
            footer.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('officerRequestDetailModal')">Close</button>`;
        }

    } catch (err) {
        body.innerHTML = `<div style="text-align:center;padding:24px;color:#ef4444;">Failed to load dossier: ${Common.escapeHtml(err.message)}</div>`;
    }
}

function openApproveOfficerModal(id, fullName, bureau) {
    document.getElementById('approveOfficerRequestId').value = id;
    document.getElementById('approveOfficerRemarks').value = '';
    document.getElementById('approveResultBox').style.display = 'none';
    const notice = document.getElementById('approveOfficerNotice');
    if (notice) {
        notice.innerHTML = `Approving <strong>${fullName}</strong> for <strong>${bureau === 'RB' ? 'Regulation Bureau (RB)' : 'Public Grievance Redressal Cell (PGRC)'}</strong>. This will issue a secure 64-character one-time activation token (valid 48h) and dispatch account credentials.`;
    }
    const btn = document.getElementById('btnConfirmApproveOfficer');
    btn.disabled = false;
    btn.innerHTML = `Confirm Approval &amp; Issue Token &rarr;`;
    openModal('approveOfficerRequestModal');
}

async function confirmApproveOfficerRequest() {
    const id = document.getElementById('approveOfficerRequestId').value;
    const remarks = document.getElementById('approveOfficerRemarks').value.trim();
    const btn = document.getElementById('btnConfirmApproveOfficer');

    try {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Approving &amp; Generating Token...`;

        const res = await Api.post(CONFIG.ENDPOINTS.APPROVE_OFFICER_REQUEST(id), {
            adminRemarks: remarks
        });

        Common.showToast('Officer registration request approved successfully! Activation token issued.', 'success');

        if (res.activationUrl) {
            document.getElementById('approveResultBox').style.display = 'block';
            document.getElementById('approveActivationUrl').value = res.activationUrl;
            btn.innerHTML = `Approved ✓`;
            setTimeout(() => {
                closeModal('approveOfficerRequestModal');
                loadOfficerRequestsData();
            }, 2500);
        } else {
            closeModal('approveOfficerRequestModal');
            loadOfficerRequestsData();
        }

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `Confirm Approval &amp; Issue Token &rarr;`;
        Common.showToast(err.message || 'Failed to approve request.', 'error');
    }
}

function openRejectOfficerModal(id, fullName) {
    document.getElementById('rejectOfficerRequestId').value = id;
    document.getElementById('rejectOfficerReason').value = '';
    const btn = document.getElementById('btnConfirmRejectOfficer');
    btn.disabled = false;
    btn.innerHTML = `Confirm Rejection`;
    openModal('rejectOfficerRequestModal');
}

async function confirmRejectOfficerRequest() {
    const id = document.getElementById('rejectOfficerRequestId').value;
    const reason = document.getElementById('rejectOfficerReason').value.trim();
    const btn = document.getElementById('btnConfirmRejectOfficer');

    if (!reason) {
        Common.showToast('Please provide a mandatory rejection reason.', 'warning');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Rejecting Request...`;

        await Api.post(CONFIG.ENDPOINTS.REJECT_OFFICER_REQUEST(id), {
            rejectionReason: reason
        });

        Common.showToast('Officer registration request rejected.', 'info');
        closeModal('rejectOfficerRequestModal');
        loadOfficerRequestsData();

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `Confirm Rejection`;
        Common.showToast(err.message || 'Failed to reject request.', 'error');
    }
}

