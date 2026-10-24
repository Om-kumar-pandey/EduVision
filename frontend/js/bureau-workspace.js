/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Dashboard 2: Bureau / Cell Workspace Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    if (!Auth.checkPageAccess(['BUREAU_OFFICER', 'SYS_ADMIN'])) {
        return;
    }

    const user = Auth.getUser();

    // Elements
    const workspaceTitle = document.getElementById('workspaceBureauName');
    const workspaceCodeBadge = document.getElementById('workspaceBureauCode');
    const casesTableBody = document.getElementById('casesTableBody');
    const paginationInfo = document.getElementById('paginationInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    // Filters
    const searchInput = document.getElementById('searchQuery');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const sortSelect = document.getElementById('sortSelect');
    const refreshBtn = document.getElementById('refreshBtn');
    const btnNewCase = document.getElementById('btnNewCase');

    // State
    let currentPage = 0;
    const pageSize = CONFIG.DEFAULT_PAGE_SIZE;
    let totalPages = 0;
    let selectedCase = null;

    if (workspaceTitle && user.bureauName) {
        workspaceTitle.textContent = `${user.bureauName} Workspace`;
    }
    if (workspaceCodeBadge && user.bureauCode) {
        workspaceCodeBadge.textContent = user.bureauCode;
    }

    /**
     * Load Cases Queue for Authenticated Officer's Bureau
     */
    async function loadCases() {
        try {
            casesTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;"><div class="spinner"></div><p style="margin-top:8px;color:var(--color-text-muted);">Loading Bureau Case Queue...</p></td></tr>`;

            const queryParams = {
                bureauId: user.bureauId || undefined,
                status: statusFilter ? statusFilter.value : undefined,
                priority: priorityFilter ? priorityFilter.value : undefined,
                query: searchInput ? searchInput.value.trim() : undefined,
                page: currentPage,
                size: pageSize
            };

            if (sortSelect) {
                const sortVal = sortSelect.value;
                if (sortVal === 'deadline_asc') {
                    queryParams.sortBy = 'expectedDisposalDate';
                    queryParams.sortDir = 'ASC';
                } else if (sortVal === 'deadline_desc') {
                    queryParams.sortBy = 'expectedDisposalDate';
                    queryParams.sortDir = 'DESC';
                } else {
                    queryParams.sortBy = 'receiptDate';
                    queryParams.sortDir = 'DESC';
                }
            }

            const data = await Api.get(CONFIG.ENDPOINTS.CASES_QUEUE, queryParams);

            if (!data || !Array.isArray(data.content) || data.content.length === 0) {
                casesTableBody.innerHTML = `<tr><td colspan="8" class="empty-state"><div class="empty-state-icon">📋</div><h4>No Grievance Cases Found</h4><p>No complaints match the current filter criteria for this Bureau.</p></td></tr>`;
                if (paginationInfo) paginationInfo.textContent = 'Showing 0 of 0 cases';
                if (prevPageBtn) prevPageBtn.disabled = true;
                if (nextPageBtn) nextPageBtn.disabled = true;
                return;
            }

            totalPages = data.totalPages;
            if (paginationInfo) {
                const start = currentPage * pageSize + 1;
                const end = Math.min((currentPage + 1) * pageSize, data.totalElements);
                paginationInfo.textContent = `Showing ${start}-${end} of ${data.totalElements} cases`;
            }

            if (prevPageBtn) prevPageBtn.disabled = currentPage === 0;
            if (nextPageBtn) nextPageBtn.disabled = data.last;

            casesTableBody.innerHTML = data.content.map(c => `
                <tr style="cursor:pointer;" onclick="openCaseDetailModal(${c.id})">
                    <td style="font-weight:700;color:var(--color-gov-blue);">${Common.escapeHtml(c.caseNumber)}</td>
                    <td>
                        <div style="font-weight:600;">${Common.escapeHtml(c.institutionName)}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);font-family:var(--font-family-mono);">${Common.escapeHtml(c.permanentId)}</div>
                    </td>
                    <td>${Common.escapeHtml(c.category)}</td>
                    <td>${Common.getPriorityBadge(c.priority)}</td>
                    <td>${Common.getStatusBadge(c.status, c.overdue)}</td>
                    <td>${Common.formatDate(c.receiptDate)}</td>
                    <td style="${c.overdue ? 'color:#ef4444;font-weight:700;' : ''}">${Common.formatDate(c.expectedDisposalDate)}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCaseDetailModal(${c.id})">Manage</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            casesTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#ef4444;padding:30px;">Error loading queue: ${Common.escapeHtml(error.message)}</td></tr>`;
            Common.showToast('Failed to load case queue: ' + error.message, 'error');
        }
    }

    /**
     * Open Case Detail Workspace Modal
     */
    window.openCaseDetailModal = async function(caseId) {
        try {
            selectedCase = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
            loadCaseHistory(caseId);

            document.getElementById('modalCaseNumber').textContent = selectedCase.caseNumber;
            document.getElementById('detailInstName').textContent = selectedCase.institutionName;
            document.getElementById('detailPermanentId').textContent = selectedCase.permanentId;
            document.getElementById('detailRegion').textContent = selectedCase.region + ' (' + selectedCase.city + ', ' + selectedCase.state + ')';
            document.getElementById('detailBureau').textContent = selectedCase.bureauCode + ' - ' + selectedCase.bureauName;
            document.getElementById('detailCategory').textContent = selectedCase.category;
            document.getElementById('detailPriority').innerHTML = Common.getPriorityBadge(selectedCase.priority);
            document.getElementById('detailStatus').innerHTML = Common.getStatusBadge(selectedCase.status, selectedCase.overdue);
            document.getElementById('detailReceiptDate').textContent = Common.formatDate(selectedCase.receiptDate);
            document.getElementById('detailExpectedDisposal').textContent = Common.formatDate(selectedCase.expectedDisposalDate);
            document.getElementById('detailTitle').textContent = selectedCase.title;
            document.getElementById('detailDescription').textContent = selectedCase.description;

            // Pre-fill status update form
            document.getElementById('updateStatusSelect').value = selectedCase.status;
            document.getElementById('updateRemarks').value = '';
            document.getElementById('updateNextAction').value = '';
            document.getElementById('updateNextActionDue').value = '';

            // Switch to primary tab
            switchTab('tabDetails');

            Common.openModal('caseWorkspaceModal');
        } catch (error) {
            Common.showToast('Failed to load case details: ' + error.message, 'error');
        }
    };

    /**
     * Load Chronological Action History
     */
    async function loadCaseHistory(caseId) {
        const historyContainer = document.getElementById('caseHistoryTimeline');
        if (!historyContainer) return;

        try {
            const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));
            if (Array.isArray(history) && history.length > 0) {
                historyContainer.innerHTML = history.map(h => `
                    <div class="timeline-entry">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <span class="timeline-author">${Common.escapeHtml(h.userFullName || 'Authorized Officer')} (${Common.escapeHtml(h.userRole || '')})</span>
                                <span class="timeline-time">${Common.formatDateTime(h.createdAt)}</span>
                            </div>
                            <div style="font-size:0.78rem;font-weight:700;color:var(--color-gov-blue);margin-bottom:4px;">
                                Action: ${Common.escapeHtml(h.actionType.replace('_', ' '))}
                                ${h.fromStatus && h.toStatus ? `(${h.fromStatus} &rarr; ${h.toStatus})` : ''}
                            </div>
                            <div class="timeline-remarks">${Common.escapeHtml(h.remarks)}</div>
                            ${h.nextAction ? `<div class="timeline-next-action">Next Action: ${Common.escapeHtml(h.nextAction)} (Due: ${Common.formatDate(h.nextActionDueDate)})</div>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                historyContainer.innerHTML = `<p style="color:var(--color-text-muted);font-size:0.85rem;">No action history logged yet.</p>`;
            }
        } catch (error) {
            historyContainer.innerHTML = `<p style="color:#ef4444;">Failed to load history: ${Common.escapeHtml(error.message)}</p>`;
        }
    }

    /**
     * Handle Status Update Form Submission
     */
    const btnSubmitStatusUpdate = document.getElementById('btnSubmitStatusUpdate');
    if (btnSubmitStatusUpdate) {
        btnSubmitStatusUpdate.addEventListener('click', async () => {
            if (!selectedCase) return;

            const newStatus = document.getElementById('updateStatusSelect').value;
            const remarks = document.getElementById('updateRemarks').value.trim();
            const nextAction = document.getElementById('updateNextAction').value.trim();
            const nextActionDue = document.getElementById('updateNextActionDue').value;

            if (!newStatus) {
                Common.showToast('Please select a valid case status.', 'warning');
                return;
            }
            if (!remarks) {
                Common.showToast('Mandatory official action remarks are required for all status changes.', 'warning');
                return;
            }

            Common.confirm(`Confirm updating status of Case ${selectedCase.caseNumber} to '${newStatus}'?`, async () => {
                try {
                    btnSubmitStatusUpdate.disabled = true;
                    btnSubmitStatusUpdate.textContent = 'Updating...';

                    const payload = {
                        status: newStatus,
                        remarks: remarks,
                        nextAction: nextAction || null,
                        nextActionDueDate: nextActionDue ? nextActionDue + 'T17:00:00' : null
                    };

                    const updated = await Api.patch(CONFIG.ENDPOINTS.UPDATE_STATUS(selectedCase.id), payload);
                    selectedCase = updated;

                    Common.showToast(`Case ${updated.caseNumber} updated to ${updated.status}`, 'success');
                    document.getElementById('detailStatus').innerHTML = Common.getStatusBadge(updated.status, updated.overdue);

                    // Refresh history and queue
                    loadCaseHistory(selectedCase.id);
                    loadCases();

                    document.getElementById('updateRemarks').value = '';
                } catch (error) {
                    Common.showToast('Failed to update status: ' + error.message, 'error');
                } finally {
                    btnSubmitStatusUpdate.disabled = false;
                    btnSubmitStatusUpdate.textContent = 'Save Status Update';
                }
            });
        });
    }

    /**
     * Handle Inter-Bureau Transfer Request Modal
     */
    const btnOpenTransfer = document.getElementById('btnOpenTransfer');
    if (btnOpenTransfer) {
        btnOpenTransfer.addEventListener('click', async () => {
            if (!selectedCase) return;

            document.getElementById('transferCaseNumber').textContent = selectedCase.caseNumber;
            document.getElementById('transferCurrentBureau').textContent = selectedCase.bureauCode + ' - ' + selectedCase.bureauName;
            document.getElementById('transferReason').value = '';

            // Populate bureaus dropdown excluding current bureau
            const bureauSelect = document.getElementById('transferTargetBureau');
            bureauSelect.innerHTML = '<option value="">Loading bureaus...</option>';

            try {
                // Bureaus from admin or fallback config
                const bureaus = [
                    { id: 1, code: 'RB', name: 'Regulation Bureau' },
                    { id: 2, code: 'PGRC', name: 'Public Grievance Redressal Cell' },
                    { id: 3, code: 'APPROVAL', name: 'Approval Bureau' },
                    { id: 4, code: 'POLICY', name: 'Policy & Planning Bureau' }
                ];

                bureauSelect.innerHTML = '<option value="">-- Select Destination Bureau --</option>' +
                    bureaus
                        .filter(b => b.id !== selectedCase.bureauId)
                        .map(b => `<option value="${b.id}">${b.code} - ${b.name}</option>`)
                        .join('');

                Common.openModal('transferModal');
            } catch (error) {
                Common.showToast('Failed to load bureaus: ' + error.message, 'error');
            }
        });
    }

    const btnSubmitTransfer = document.getElementById('btnSubmitTransfer');
    if (btnSubmitTransfer) {
        btnSubmitTransfer.addEventListener('click', async () => {
            if (!selectedCase) return;

            const targetBureauId = document.getElementById('transferTargetBureau').value;
            const reason = document.getElementById('transferReason').value.trim();

            if (!targetBureauId) {
                Common.showToast('Please select a destination Bureau.', 'warning');
                return;
            }
            if (!reason) {
                Common.showToast('Transfer justification reason is required.', 'warning');
                return;
            }

            try {
                btnSubmitTransfer.disabled = true;
                btnSubmitTransfer.textContent = 'Submitting...';

                await Api.post(CONFIG.ENDPOINTS.TRANSFER_REQUEST(selectedCase.id), {
                    toBureauId: parseInt(targetBureauId),
                    reason: reason
                });

                Common.showToast('Inter-Bureau transfer request submitted successfully for supervisory review.', 'success');
                Common.closeModal('transferModal');
                loadCaseHistory(selectedCase.id);
                loadCases();
            } catch (error) {
                Common.showToast('Failed to submit transfer request: ' + error.message, 'error');
            } finally {
                btnSubmitTransfer.disabled = false;
                btnSubmitTransfer.textContent = 'Submit Transfer Request';
            }
        });
    }

    /**
     * Handle Intake of New Case Modal
     */
    if (btnNewCase) {
        btnNewCase.addEventListener('click', () => {
            document.getElementById('newCasePermanentId').value = '';
            document.getElementById('newCaseTitle').value = '';
            document.getElementById('newCaseCategory').value = 'Faculty Irregularities';
            document.getElementById('newCasePriority').value = 'MEDIUM';
            document.getElementById('newCaseDescription').value = '';
            Common.openModal('newCaseModal');
        });
    }

    const btnSubmitNewCase = document.getElementById('btnSubmitNewCase');
    if (btnSubmitNewCase) {
        btnSubmitNewCase.addEventListener('click', async () => {
            const permanentId = document.getElementById('newCasePermanentId').value.trim();
            const title = document.getElementById('newCaseTitle').value.trim();
            const category = document.getElementById('newCaseCategory').value;
            const priority = document.getElementById('newCasePriority').value;
            const description = document.getElementById('newCaseDescription').value.trim();

            if (!permanentId || !title || !description) {
                Common.showToast('Please fill all mandatory fields (Permanent ID, Title, Description).', 'warning');
                return;
            }

            try {
                btnSubmitNewCase.disabled = true;
                btnSubmitNewCase.textContent = 'Registering...';

                const newCase = await Api.post(CONFIG.ENDPOINTS.CREATE_CASE, {
                    permanentId: permanentId,
                    bureauId: user.bureauId || 1,
                    title: title,
                    category: category,
                    priority: priority,
                    description: description
                });

                Common.showToast(`New Case Registered: ${newCase.caseNumber}`, 'success');
                Common.closeModal('newCaseModal');
                loadCases();
            } catch (error) {
                Common.showToast('Failed to register case: ' + error.message, 'error');
            } finally {
                btnSubmitNewCase.disabled = false;
                btnSubmitNewCase.textContent = 'Create Case';
            }
        });
    }

    // Tab Navigation within Case Workspace Modal
    function switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabId);
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.currentTarget.getAttribute('data-tab'));
        });
    });

    // Close Modal listeners
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            Common.closeModal(e.currentTarget.getAttribute('data-close-modal'));
        });
    });

    // Pagination Listeners
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                loadCases();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                loadCases();
            }
        });
    }

    // Filter listeners
    if (statusFilter) statusFilter.addEventListener('change', () => { currentPage = 0; loadCases(); });
    if (priorityFilter) priorityFilter.addEventListener('change', () => { currentPage = 0; loadCases(); });
    if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 0; loadCases(); });
    if (refreshBtn) refreshBtn.addEventListener('click', () => { loadCases(); Common.showToast('Queue refreshed', 'info'); });
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentPage = 0;
                loadCases();
            }
        });
    }

    // Initial load
    loadCases();
});
