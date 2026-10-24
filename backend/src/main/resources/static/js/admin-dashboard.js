/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Dashboard 4: System Administration Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    if (!Auth.checkPageAccess(['SYS_ADMIN'])) {
        return;
    }

    // Tab Navigation within Admin Dashboard
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminPanes = document.querySelectorAll('.admin-pane');

    function switchAdminTab(targetTabId) {
        adminTabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-admin-tab') === targetTabId));
        adminPanes.forEach(p => p.classList.toggle('active', p.id === targetTabId));

        if (targetTabId === 'paneUsers') loadUsers();
        else if (targetTabId === 'paneTransfers') loadTransfers();
        else if (targetTabId === 'paneBatches') loadImportBatches();
        else if (targetTabId === 'paneAudit') loadAuditLogs();
    }

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchAdminTab(e.currentTarget.getAttribute('data-admin-tab'));
        });
    });

    /* =========================================================================
       1. User Management Logic
    ========================================================================= */
    const usersTableBody = document.getElementById('usersTableBody');
    const btnOpenAddUser = document.getElementById('btnOpenAddUser');
    const btnSubmitNewUser = document.getElementById('btnSubmitNewUser');

    async function loadUsers() {
        if (!usersTableBody) return;
        try {
            usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;"><div class="spinner"></div></td></tr>`;
            const data = await Api.get(CONFIG.ENDPOINTS.ADMIN_USERS, { page: 0, size: 20 });

            if (!data || !Array.isArray(data.content) || data.content.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No users found.</p></td></tr>`;
                return;
            }

            usersTableBody.innerHTML = data.content.map(u => `
                <tr>
                    <td style="font-weight:700;">#${u.id}</td>
                    <td style="font-weight:600;">${Common.escapeHtml(u.fullName)}</td>
                    <td>${Common.escapeHtml(u.email)}</td>
                    <td><span class="role-pill">${Common.escapeHtml(u.role)}</span></td>
                    <td>${u.bureauCode ? `<span class="bureau-pill">${Common.escapeHtml(u.bureauCode)}</span>` : '<span style="color:var(--color-text-muted);">None (National)</span>'}</td>
                    <td>
                        <span class="badge" style="background:${u.isActive ? '#dcfce7' : '#fee2e2'};color:${u.isActive ? '#166534' : '#991b1b'};">
                            ${u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus(${u.id}, ${!u.isActive})">
                            ${u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            usersTableBody.innerHTML = `<tr><td colspan="7" style="color:#ef4444;text-align:center;">Error: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    window.toggleUserStatus = function(userId, newActiveStatus) {
        Common.confirm(`Are you sure you want to ${newActiveStatus ? 'activate' : 'deactivate'} this user account?`, async () => {
            try {
                await Api.patch(CONFIG.ENDPOINTS.ADMIN_USER_UPDATE(userId), { isActive: newActiveStatus });
                Common.showToast(`User status updated to ${newActiveStatus ? 'ACTIVE' : 'DEACTIVATED'}`, 'success');
                loadUsers();
            } catch (error) {
                Common.showToast('Failed to update user status: ' + error.message, 'error');
            }
        });
    };

    if (btnOpenAddUser) {
        btnOpenAddUser.addEventListener('click', () => {
            document.getElementById('newUserFullName').value = '';
            document.getElementById('newUserEmail').value = '';
            document.getElementById('newUserPassword').value = '';
            document.getElementById('newUserRole').value = 'BUREAU_OFFICER';
            document.getElementById('newUserBureau').value = '1';
            document.getElementById('newUserDesignation').value = '';
            Common.openModal('addUserModal');
        });
    }

    if (btnSubmitNewUser) {
        btnSubmitNewUser.addEventListener('click', async () => {
            const fullName = document.getElementById('newUserFullName').value.trim();
            const email = document.getElementById('newUserEmail').value.trim();
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;
            const bureauId = document.getElementById('newUserBureau').value;
            const designation = document.getElementById('newUserDesignation').value.trim();

            if (!fullName || !email || !password) {
                Common.showToast('Full name, email, and password are required.', 'warning');
                return;
            }

            try {
                btnSubmitNewUser.disabled = true;
                btnSubmitNewUser.textContent = 'Creating...';

                await Api.post(CONFIG.ENDPOINTS.ADMIN_USERS, {
                    fullName,
                    email,
                    password,
                    role,
                    bureauId: (role === 'BUREAU_OFFICER' && bureauId) ? parseInt(bureauId) : null,
                    designation
                });

                Common.showToast('User created successfully!', 'success');
                Common.closeModal('addUserModal');
                loadUsers();
            } catch (error) {
                Common.showToast('Failed to create user: ' + error.message, 'error');
            } finally {
                btnSubmitNewUser.disabled = false;
                btnSubmitNewUser.textContent = 'Create Account';
            }
        });
    }

    /* =========================================================================
       2. Inter-Bureau Transfer Approvals Logic
    ========================================================================= */
    const transfersTableBody = document.getElementById('transfersTableBody');

    async function loadTransfers() {
        if (!transfersTableBody) return;
        try {
            transfersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;"><div class="spinner"></div></td></tr>`;
            const data = await Api.get(CONFIG.ENDPOINTS.TRANSFER_REQUESTS, { page: 0, size: 20 });

            if (!data || !Array.isArray(data.content) || data.content.length === 0) {
                transfersTableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No inter-Bureau transfer requests found.</p></td></tr>`;
                return;
            }

            transfersTableBody.innerHTML = data.content.map(t => `
                <tr>
                    <td style="font-weight:700;">#${t.id}</td>
                    <td style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(t.caseNumber)}</td>
                    <td>${Common.escapeHtml(t.institutionName || 'N/A')}</td>
                    <td>
                        <span class="badge" style="background:#fee2e2;color:#991b1b;">${Common.escapeHtml(t.fromBureauCode)}</span>
                        &rarr;
                        <span class="badge" style="background:#dcfce7;color:#166534;">${Common.escapeHtml(t.toBureauCode)}</span>
                    </td>
                    <td>
                        <span class="badge" style="background:${t.status === 'APPROVED' ? '#dcfce7' : (t.status === 'REJECTED' ? '#fee2e2' : '#fef3c7')};">
                            ${t.status}
                        </span>
                    </td>
                    <td style="max-width:260px;font-size:0.8rem;">${Common.escapeHtml(t.reason)}</td>
                    <td>
                        ${t.status === 'PENDING' ? `
                            <button class="btn btn-primary btn-sm" onclick="openDecideTransferModal(${t.id}, '${Common.escapeHtml(t.caseNumber)}', '${Common.escapeHtml(t.toBureauCode)}')">Review Decision</button>
                        ` : `<span style="font-size:0.75rem;color:var(--color-text-muted);">Decided</span>`}
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            transfersTableBody.innerHTML = `<tr><td colspan="7" style="color:#ef4444;text-align:center;">Error: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    let currentTransferId = null;
    window.openDecideTransferModal = function(id, caseNumber, targetBureau) {
        currentTransferId = id;
        document.getElementById('decisionCaseInfo').textContent = `Transfer Request #${id} for Case ${caseNumber} to ${targetBureau}`;
        document.getElementById('transferDecisionRemarks').value = '';
        Common.openModal('transferDecisionModal');
    };

    window.submitTransferDecision = async function(approve) {
        const remarks = document.getElementById('transferDecisionRemarks').value.trim();
        try {
            await Api.patch(CONFIG.ENDPOINTS.TRANSFER_DECISION(currentTransferId), {
                approve: approve,
                remarks: remarks || (approve ? 'Approved by System Administrator' : 'Rejected by System Administrator')
            });
            Common.showToast(`Transfer request successfully ${approve ? 'APPROVED' : 'REJECTED'}. Case ID preserved.`, 'success');
            Common.closeModal('transferDecisionModal');
            loadTransfers();
        } catch (error) {
            Common.showToast('Decision failed: ' + error.message, 'error');
        }
    };

    /* =========================================================================
       3. Import Batches & Error Reports Logic
    ========================================================================= */
    const batchesTableBody = document.getElementById('batchesTableBody');

    async function loadImportBatches() {
        if (!batchesTableBody) return;
        try {
            batchesTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;"><div class="spinner"></div></td></tr>`;
            const data = await Api.get(CONFIG.ENDPOINTS.IMPORT_BATCHES, { page: 0, size: 20 });

            if (!data || !Array.isArray(data.content) || data.content.length === 0) {
                batchesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No previous import batches found.</p></td></tr>`;
                return;
            }

            batchesTableBody.innerHTML = data.content.map(b => `
                <tr>
                    <td style="font-weight:700;font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(b.batchId)}</td>
                    <td>${Common.escapeHtml(b.filename)}</td>
                    <td>${b.totalRows}</td>
                    <td style="color:#10b981;font-weight:700;">${b.validRows}</td>
                    <td style="${b.failedRows > 0 ? 'color:#ef4444;font-weight:700;' : ''}">${b.failedRows}</td>
                    <td>
                        <span class="badge" style="background:${b.status === 'COMPLETED' ? '#dcfce7' : '#fee2e2'};">
                            ${b.status}
                        </span>
                    </td>
                    <td>
                        ${b.failedRows > 0 ? `
                            <button class="btn btn-secondary btn-sm" onclick="viewBatchErrors(${b.id})">View Errors (${b.failedRows})</button>
                        ` : `<span style="font-size:0.75rem;color:#10b981;">Clean Import</span>`}
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            batchesTableBody.innerHTML = `<tr><td colspan="7" style="color:#ef4444;text-align:center;">Error: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    window.viewBatchErrors = async function(batchId) {
        try {
            const batch = await Api.get(CONFIG.ENDPOINTS.IMPORT_BATCH_DETAIL(batchId));
            document.getElementById('batchErrorTitle').textContent = `Errors for Batch: ${batch.batchId} (${batch.filename})`;
            const errList = document.getElementById('batchErrorList');

            if (batch.errors && batch.errors.length > 0) {
                errList.innerHTML = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CSV Row</th>
                                <th>Failure Reason</th>
                                <th>Raw Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${batch.errors.map(e => `
                                <tr>
                                    <td style="font-weight:700;color:#ef4444;">Row #${e.csvRowNumber}</td>
                                    <td style="font-weight:600;color:#991b1b;">${Common.escapeHtml(e.errorReason)}</td>
                                    <td style="font-family:var(--font-family-mono);font-size:0.75rem;max-width:300px;overflow:hidden;text-overflow:ellipsis;">${Common.escapeHtml(e.rawData)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                errList.innerHTML = `<p>No row-level errors recorded for this batch.</p>`;
            }

            Common.openModal('batchErrorModal');
        } catch (error) {
            Common.showToast('Could not load batch errors: ' + error.message, 'error');
        }
    };

    /* =========================================================================
       4. Audit Trail Logic
    ========================================================================= */
    const auditTableBody = document.getElementById('auditTableBody');

    async function loadAuditLogs() {
        if (!auditTableBody) return;
        try {
            auditTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;"><div class="spinner"></div></td></tr>`;
            const data = await Api.get(CONFIG.ENDPOINTS.AUDIT_LOGS, { page: 0, size: 25 });

            if (!data || !Array.isArray(data.content) || data.content.length === 0) {
                auditTableBody.innerHTML = `<tr><td colspan="6" class="empty-state"><p>No audit events logged.</p></td></tr>`;
                return;
            }

            auditTableBody.innerHTML = data.content.map(a => `
                <tr>
                    <td style="font-weight:700;">#${a.id}</td>
                    <td style="font-size:0.75rem;color:var(--color-text-muted);">${Common.formatDateTime(a.createdAt)}</td>
                    <td style="font-weight:600;">${Common.escapeHtml(a.userEmail)}</td>
                    <td><span class="audit-action-tag">${Common.escapeHtml(a.action)}</span></td>
                    <td>${Common.escapeHtml(a.entityType)} (${Common.escapeHtml(a.entityId || '—')})</td>
                    <td style="font-size:0.8rem;max-width:320px;">${Common.escapeHtml(a.details || '')}</td>
                </tr>
            `).join('');
        } catch (error) {
            auditTableBody.innerHTML = `<tr><td colspan="6" style="color:#ef4444;text-align:center;">Error: ${Common.escapeHtml(error.message)}</td></tr>`;
        }
    }

    // Modal close listeners
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            Common.closeModal(e.currentTarget.getAttribute('data-close-modal'));
        });
    });

    // Default load first tab (Users)
    loadUsers();
});
