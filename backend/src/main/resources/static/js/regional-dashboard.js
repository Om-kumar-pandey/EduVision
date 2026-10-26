/**
 * EduVision — Regional Office Dashboard Logic
 * Region-specific monitoring, institution filtering, and senior authority escalation
 */

let currentRegion = 'Western';

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Demo auto-bootstrap & direct auth-token support for testing / preview
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    if (authToken) {
        localStorage.setItem(CONFIG.TOKEN_KEY, authToken);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({
            id: 3,
            fullName: 'Dr. Sandeep Deshmukh',
            email: 'western_ro@aicte.gov.in',
            role: 'REGIONAL_OFFICER',
            region: 'Western'
        }));
    } else if (urlParams.get('demo') === 'true' && !Auth.isAuthenticated()) {
        localStorage.setItem(CONFIG.TOKEN_KEY, 'demo_jwt_token_regional');
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify({
            id: 3,
            fullName: 'Dr. Sandeep Deshmukh',
            email: 'western_ro@aicte.gov.in',
            role: 'REGIONAL_OFFICER',
            region: 'Western'
        }));
    }

    // Route Protection: Accessible to REGIONAL_OFFICER, CENTRAL_MONITOR, SYS_ADMIN
    if (!Auth.checkPageAccess(['REGIONAL_OFFICER', 'CENTRAL_MONITOR', 'SYS_ADMIN'])) {
        return;
    }

    const user = Auth.getUser();
    if (user && user.region) {
        currentRegion = user.region;
        const select = document.getElementById('regionSelect');
        if (select) select.value = currentRegion;
    }

    updateRegionUI();
    loadRegionalStats();
    loadRegionalCases();
});

function updateRegionUI() {
    const badge = document.getElementById('currentRegionBadge');
    const title = document.getElementById('regionalOfficeTitle');
    const sub = document.getElementById('regQueueSubtitle');

    if (badge) badge.textContent = `${currentRegion} Region`;
    if (title) title.innerHTML = `${currentRegion} Regional Office &bull; Jurisdiction Dashboard`;
    if (sub) sub.textContent = `Complaints registered against technical institutions within ${currentRegion} Regional Office jurisdiction`;
}

function changeRegion() {
    const select = document.getElementById('regionSelect');
    if (select) {
        currentRegion = select.value;
        updateRegionUI();
        loadRegionalStats();
        loadRegionalCases();
    }
}

async function loadRegionalStats() {
    try {
        const stats = await Api.get(CONFIG.ENDPOINTS.REGIONAL_STATS, { region: currentRegion });
        document.getElementById('regTotalCases').textContent = stats.totalCases ?? 0;
        document.getElementById('regActiveCases').textContent = stats.activeCases ?? 0;
        document.getElementById('regOverdueCases').textContent = stats.overdueCases ?? 0;
        document.getElementById('regDisposedCases').textContent = stats.disposedCases ?? 0;
    } catch (error) {
        console.error('Failed to load regional stats', error);
    }
}

async function loadRegionalCases() {
    const tbody = document.getElementById('regionalTableBody');
    if (!tbody) return;

    const query = document.getElementById('regSearchInput').value.trim();
    const status = document.getElementById('regStatusFilter').value;
    const priority = document.getElementById('regPriorityFilter').value;

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:24px;">
                    <div class="spinner"></div>
                    <p style="margin-top:8px;">Loading ${currentRegion} region queue...</p>
                </td>
            </tr>
        `;

        const res = await Api.get(CONFIG.ENDPOINTS.REGIONAL_CASES, {
            region: currentRegion,
            status,
            priority,
            query,
            page: 0,
            size: 20
        });

        if (!res || !res.content || res.content.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;padding:32px;color:#64748b;">
                        <div style="font-size:1.8rem;margin-bottom:8px;">🔍</div>
                        <h4 style="font-size:0.95rem;color:#0b2545;margin-bottom:4px;">No Cases Found for ${currentRegion} Region</h4>
                        <p style="font-size:0.8rem;">No complaints match the specified search or filter criteria in this jurisdiction.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = res.content.map(c => {
            const statusBadge = Common.getStatusBadge(c.status);
            const priorityBadge = Common.getPriorityBadge(c.priority);
            const dateStr = c.receiptDate ? new Date(c.receiptDate).toLocaleDateString() : 'N/A';
            const expDateStr = c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A';
            const overdueFlag = c.overdue ? `<span class="badge badge-danger" style="margin-left:4px;">OVERDUE</span>` : '';

            return `
                <tr>
                    <td><strong style="color:var(--color-gov-blue);font-family:var(--font-family-mono);">${c.caseNumber}</strong></td>
                    <td>
                        <div style="font-weight:600;color:var(--color-primary-navy);">${Common.escapeHtml(c.institutionName || 'Unknown')}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">${c.permanentId || ''} &bull; ${c.city || ''}, ${c.state || ''}</div>
                    </td>
                    <td>
                        <div style="font-weight:600;font-size:0.85rem;">${Common.escapeHtml(c.title)}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">${c.category}</div>
                    </td>
                    <td>${priorityBadge}</td>
                    <td><span class="badge" style="background:#e0f2fe;color:#0369a1;">${c.bureauCode || 'AICTE'}</span></td>
                    <td style="font-size:0.82rem;color:var(--color-text-muted);">${dateStr}</td>
                    <td style="font-size:0.82rem;color:${c.overdue ? '#ef4444' : 'var(--color-text-muted)'};font-weight:${c.overdue ? '700' : 'normal'};">
                        ${expDateStr} ${overdueFlag}
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-outline btn-sm" onclick="inspectRegCase(${c.id})">Inspect</button>
                            ${c.status !== 'DISPOSED' ? `
                                <button class="btn btn-danger btn-sm" onclick="openEscalateModal(${c.id}, '${c.caseNumber}')" title="Escalate to Senior Authority">
                                    Escalate &uarr;
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:24px;color:#ef4444;">
                    Failed to load regional queue: ${Common.escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

function applyRegionalFilters() {
    loadRegionalCases();
}

function resetRegionalFilters() {
    document.getElementById('regSearchInput').value = '';
    document.getElementById('regStatusFilter').value = '';
    document.getElementById('regPriorityFilter').value = '';
    loadRegionalCases();
}

async function inspectRegCase(caseId) {
    const modal = document.getElementById('regCaseDetailModal');
    const body = document.getElementById('regModalCaseBody');
    const title = document.getElementById('regModalCaseTitle');

    modal.classList.add('active');
    body.innerHTML = `<div style="text-align:center;padding:24px;"><div class="spinner"></div><p style="margin-top:8px;">Fetching case details...</p></div>`;

    try {
        const c = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
        const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));

        title.textContent = `Regional Case File: ${c.caseNumber}`;

        body.innerHTML = `
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:16px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:1.1rem;font-weight:700;color:var(--color-primary-navy);">${Common.escapeHtml(c.title)}</span>
                    ${Common.getStatusBadge(c.status)}
                </div>
                <div style="font-size:0.85rem;color:#334155;margin-bottom:6px;">
                    <strong>Institution:</strong> ${c.institutionName} (AICTE ID: <span style="font-family:var(--font-family-mono);">${c.permanentId}</span>) &bull; ${c.city}, ${c.state} (${c.region} Region)
                </div>
                <div style="font-size:0.85rem;color:#475569;margin-bottom:8px;line-height:1.5;">
                    <strong>Description:</strong> ${Common.escapeHtml(c.description)}
                </div>
                <div style="font-size:0.82rem;color:#64748b;">
                    Assigned Bureau: <strong>${c.bureauName} (${c.bureauCode})</strong> &bull; Priority: <strong>${c.priority}</strong> &bull; Filed: ${new Date(c.receiptDate).toLocaleDateString()}
                </div>
            </div>

            <h4 style="font-size:0.95rem;color:var(--color-primary-navy);margin:16px 0 8px;">Regional &amp; Bureau Action History</h4>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${history && history.length > 0 ? history.map(h => `
                    <div style="display:flex;gap:12px;background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:12px;">
                        <div style="font-size:1.2rem;color:var(--color-gov-blue);">●</div>
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <div>
                                    <strong style="font-size:0.85rem;color:var(--color-primary-navy);">${h.actionType.replace('_', ' ')}</strong>
                                    <span style="font-size:0.75rem;color:#64748b;margin-left:8px;">by ${Common.escapeHtml(h.userFullName || 'System')} (${h.userRole || ''})</span>
                                </div>
                                <span style="font-size:0.75rem;color:#94a3b8;">${new Date(h.createdAt).toLocaleString()}</span>
                            </div>
                            <p style="font-size:0.82rem;color:#475569;margin:6px 0 0;">${Common.escapeHtml(h.remarks)}</p>
                            ${h.nextAction ? `<div style="font-size:0.75rem;color:#0369a1;margin-top:4px;">Next Action: ${Common.escapeHtml(h.nextAction)}</div>` : ''}
                        </div>
                    </div>
                `).join('') : '<p style="color:#64748b;font-size:0.85rem;">No action history logged yet.</p>'}
            </div>
        `;
    } catch (error) {
        body.innerHTML = `<div style="color:#ef4444;padding:16px;">Failed to load case dossier: ${error.message}</div>`;
    }
}

function closeRegDetailModal() {
    document.getElementById('regCaseDetailModal').classList.remove('active');
}

function openEscalateModal(caseId, caseNumber) {
    document.getElementById('escalateCaseId').value = caseId;
    document.getElementById('escalateReason').value = '';
    document.getElementById('escalateModal').classList.add('active');
}

function closeEscalateModal() {
    document.getElementById('escalateModal').classList.remove('active');
}

async function submitEscalation() {
    const caseId = document.getElementById('escalateCaseId').value;
    const reason = document.getElementById('escalateReason').value.trim();
    const btn = document.getElementById('btnConfirmEscalate');

    if (!reason) {
        Common.showToast('Please provide an escalation justification.', 'warning');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Escalating...';

        await Api.post(CONFIG.ENDPOINTS.REGIONAL_ESCALATE(caseId), { reason });

        btn.disabled = false;
        btn.textContent = 'Confirm Escalation →';
        closeEscalateModal();
        Common.showToast('Case successfully escalated to Senior Authority!', 'success');
        loadRegionalCases();

    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Confirm Escalation →';
        Common.showToast(error.message || 'Failed to escalate case.', 'error');
    }
}
