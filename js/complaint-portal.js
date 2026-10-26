/**
 * EduVision — Complainant Portal Logic
 * Grievance filing, tracking, and personal complaint history
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const user = Auth.getUser();
    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user && user.role === 'COMPLAINANT') {
        if (avatarEl) avatarEl.textContent = (user.fullName || 'C').charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = user.fullName || 'Complainant';
        if (roleEl) roleEl.textContent = 'Registered Complainant';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
        loadMyComplaints();
    } else {
        if (avatarEl) avatarEl.textContent = 'P';
        if (nameEl) nameEl.textContent = 'Public Complainant';
        if (roleEl) roleEl.textContent = 'Student / Citizen Grievance Portal';
        if (logoutBtn) {
            logoutBtn.textContent = 'Officer Login';
            logoutBtn.addEventListener('click', () => { window.location.href = 'login.html'; });
        }
        // Default to file grievance tab for public users
        switchPortalTab('file-complaint');
    }
});

function switchPortalTab(tabName) {
    const btnMy = document.getElementById('tabBtnMyComplaints');
    const btnFile = document.getElementById('tabBtnFileComplaint');
    const btnTrack = document.getElementById('tabBtnTrackRef');

    const secMy = document.getElementById('sectionMyComplaints');
    const secFile = document.getElementById('sectionFileComplaint');
    const secTrack = document.getElementById('sectionTrackRef');

    btnMy.classList.remove('active');
    btnFile.classList.remove('active');
    btnTrack.classList.remove('active');

    secMy.style.display = 'none';
    secFile.style.display = 'none';
    secTrack.style.display = 'none';

    if (tabName === 'file-complaint') {
        btnFile.classList.add('active');
        secFile.style.display = 'block';
    } else if (tabName === 'track-ref') {
        btnTrack.classList.add('active');
        secTrack.style.display = 'block';
    } else {
        btnMy.classList.add('active');
        secMy.style.display = 'block';
        loadMyComplaints();
    }
}

async function loadMyComplaints() {
    const tbody = document.getElementById('myComplaintsTableBody');
    if (!tbody) return;

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:24px;">
                    <div class="spinner"></div>
                    <p style="margin-top:8px;">Loading your registered complaints...</p>
                </td>
            </tr>
        `;

        const list = await Api.get(CONFIG.ENDPOINTS.MY_COMPLAINTS);

        if (!list || list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:32px;color:#64748b;">
                        <div style="font-size:2rem;margin-bottom:8px;">📄</div>
                        <h4 style="font-size:1rem;color:#0b2545;margin-bottom:4px;">No Complaints Filed Yet</h4>
                        <p style="font-size:0.85rem;margin-bottom:14px;">You have not registered any grievances against technical institutions.</p>
                        <button type="button" class="btn btn-primary btn-sm" onclick="switchPortalTab('file-complaint')">
                            File Your First Complaint &rarr;
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map(c => {
            const statusBadge = Common.getStatusBadge(c.status);
            const priorityBadge = Common.getPriorityBadge(c.priority);
            const dateStr = c.receiptDate ? new Date(c.receiptDate).toLocaleDateString() : 'N/A';

            return `
                <tr>
                    <td><strong style="color:var(--color-gov-blue);font-family:var(--font-family-mono);">${c.caseNumber}</strong></td>
                    <td>
                        <div style="font-weight:600;color:var(--color-primary-navy);">${Common.escapeHtml(c.institutionName || 'Unknown')}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">${c.permanentId || ''} &bull; ${c.region || ''}</div>
                    </td>
                    <td>
                        <div style="font-weight:600;font-size:0.85rem;">${Common.escapeHtml(c.title)}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">${c.category}</div>
                    </td>
                    <td>${priorityBadge}</td>
                    <td><span class="badge" style="background:#e0f2fe;color:#0369a1;">${c.bureauCode || 'AICTE'}</span></td>
                    <td style="font-size:0.82rem;color:var(--color-text-muted);">${dateStr}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="viewComplaintTimeline(${c.id})">
                            Track &rarr;
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:24px;color:#ef4444;">
                    Failed to load complaints: ${Common.escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

function setPermId(id) {
    const input = document.getElementById('instPermIdInput');
    if (input) {
        input.value = id;
        verifyInstitutionId();
    }
}

async function verifyInstitutionId() {
    const permId = document.getElementById('instPermIdInput').value.trim();
    const card = document.getElementById('verifiedInstCard');
    const nameEl = document.getElementById('vInstName');
    const regionEl = document.getElementById('vInstRegion');
    const badgeEl = document.getElementById('vInstBadge');

    if (!permId) {
        Common.showToast('Please enter an AICTE Permanent ID', 'warning');
        return;
    }

    try {
        const inst = await Api.get(CONFIG.ENDPOINTS.INSTITUTION_BY_PERMANENT_ID(permId));
        card.style.display = 'block';
        nameEl.textContent = inst.name;
        regionEl.textContent = `Region: ${inst.region} | City: ${inst.city}, ${inst.state} | Type: ${inst.institutionType || 'Engineering'}`;
        badgeEl.textContent = inst.isVerified ? '✓ Verified AICTE Approved' : 'Under Review';
        Common.showToast(`Institution verified: ${inst.name}`, 'success');
    } catch (error) {
        card.style.display = 'block';
        nameEl.textContent = 'Institution Not Found';
        regionEl.textContent = `Permanent ID '${permId}' could not be matched with AICTE accredited registers.`;
        badgeEl.textContent = 'Invalid ID';
        badgeEl.className = 'badge badge-danger';
        Common.showToast('Institution not found. Please verify the ID.', 'error');
    }
}

async function handleFileComplaintSubmit(event) {
    event.preventDefault();

    const permId = document.getElementById('instPermIdInput').value.trim();
    const category = document.getElementById('complaintCategory').value;
    const priority = document.getElementById('complaintPriority').value;
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDescription').value.trim();
    const documentName = document.getElementById('complaintDocName').value.trim();
    const btn = document.getElementById('btnSubmitGrievance');

    if (!permId || !category || !title || !description) {
        Common.showToast('Please fill all mandatory fields.', 'warning');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Submitting to AICTE...`;

        const result = await Api.post(CONFIG.ENDPOINTS.FILE_COMPLAINT, {
            institutionPermanentId: permId,
            category,
            priority,
            title,
            description,
            documentName
        });

        btn.disabled = false;
        btn.innerHTML = `<span>📄</span> Submit Grievance to AICTE &rarr;`;

        Common.showToast(`Complaint filed successfully! Case Reference: ${result.caseNumber}`, 'success');
        document.getElementById('fileComplaintForm').reset();
        document.getElementById('verifiedInstCard').style.display = 'none';

        switchPortalTab('my-complaints');

    } catch (error) {
        btn.disabled = false;
        btn.innerHTML = `<span>📄</span> Submit Grievance to AICTE &rarr;`;
        Common.showToast(error.message || 'Failed to submit complaint. Please try again.', 'error');
    }
}

async function viewComplaintTimeline(caseId) {
    const modal = document.getElementById('caseDetailModal');
    const body = document.getElementById('modalCaseBody');
    const title = document.getElementById('modalCaseNumber');

    modal.classList.add('active');
    body.innerHTML = `<div style="text-align:center;padding:24px;"><div class="spinner"></div><p style="margin-top:8px;">Fetching case dossier...</p></div>`;

    try {
        const c = await Api.get(CONFIG.ENDPOINTS.CASE_DETAIL(caseId));
        const history = await Api.get(CONFIG.ENDPOINTS.CASE_HISTORY(caseId));

        title.textContent = `Complaint Dossier: ${c.caseNumber}`;

        body.innerHTML = `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:14px;margin-bottom:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:1.05rem;font-weight:700;color:var(--color-primary-navy);">${Common.escapeHtml(c.title)}</span>
                    ${Common.getStatusBadge(c.status)}
                </div>
                <div style="font-size:0.85rem;color:#334155;margin-bottom:4px;">
                    <strong>Institution:</strong> ${c.institutionName} (${c.permanentId})
                </div>
                <div style="font-size:0.82rem;color:#64748b;">
                    Assigned Bureau: <strong>${c.bureauName} (${c.bureauCode})</strong> &bull; Category: ${c.category} &bull; Filed: ${new Date(c.receiptDate).toLocaleDateString()}
                </div>
            </div>

            <h4 style="font-size:0.95rem;color:var(--color-primary-navy);margin:16px 0 8px;">Chronological Action Timeline</h4>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${history && history.length > 0 ? history.map(h => `
                    <div style="display:flex;gap:12px;background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;padding:12px;">
                        <div style="font-size:1.2rem;color:var(--color-gov-blue);">●</div>
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <strong style="font-size:0.85rem;color:var(--color-primary-navy);">${h.actionType.replace('_', ' ')}</strong>
                                <span style="font-size:0.75rem;color:#94a3b8;">${new Date(h.createdAt).toLocaleString()}</span>
                            </div>
                            <p style="font-size:0.82rem;color:#475569;margin:4px 0 0;">${Common.escapeHtml(h.remarks)}</p>
                            ${h.nextAction ? `<div style="font-size:0.75rem;color:#0369a1;margin-top:4px;">Next Action: ${Common.escapeHtml(h.nextAction)}</div>` : ''}
                        </div>
                    </div>
                `).join('') : '<p style="color:#64748b;font-size:0.85rem;">No action history logged yet.</p>'}
            </div>
        `;
    } catch (error) {
        body.innerHTML = `<div style="color:#ef4444;padding:16px;">Failed to load details: ${error.message}</div>`;
    }
}

function closeCaseDetailModal() {
    document.getElementById('caseDetailModal').classList.remove('active');
}

async function handlePortalTrackSubmit(event) {
    event.preventDefault();
    const ref = document.getElementById('portalTrackInput').value.trim();
    const btn = document.getElementById('btnPortalTrackSubmit');
    const resultBox = document.getElementById('portalTrackResult');

    if (!ref) return;

    try {
        btn.disabled = true;
        btn.textContent = 'Searching...';
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<div class="spinner"></div>`;

        const tracking = await Api.get(CONFIG.ENDPOINTS.TRACK_COMPLAINT_PUBLIC(ref));
        btn.disabled = false;
        btn.textContent = 'Track Case';

        resultBox.innerHTML = `
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:18px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <span style="font-size:1.1rem;font-weight:700;color:var(--color-primary-navy);">${tracking.caseNumber}</span>
                    <span class="badge badge-info">${tracking.status}</span>
                </div>
                <div style="font-size:0.85rem;color:#334155;margin-bottom:6px;">
                    <strong>Institution:</strong> ${tracking.institutionName} (${tracking.institutionPermanentId || 'AICTE Verified'})
                </div>
                <div style="font-size:0.85rem;color:#334155;margin-bottom:6px;">
                    <strong>Subject:</strong> ${tracking.title}
                </div>
                <div style="font-size:0.82rem;color:#64748b;margin-bottom:14px;">
                    Bureau Assigned: <strong>${tracking.bureauName}</strong> &bull; Filed: ${new Date(tracking.receiptDate).toLocaleDateString()}
                </div>

                <h4 style="font-size:0.9rem;color:var(--color-primary-navy);margin:14px 0 8px;">Action Milestones:</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${tracking.milestones.map(m => `
                        <div style="display:flex;gap:10px;font-size:0.82rem;background:#ffffff;padding:8px 12px;border-radius:4px;border:1px solid #e2e8f0;">
                            <span style="color:#0284c7;font-weight:700;">●</span>
                            <div style="flex:1;">
                                <div style="font-weight:600;color:#0b2545;">${m.stage}</div>
                                <div style="color:#475569;">${m.description}</div>
                            </div>
                            <span style="color:#94a3b8;font-size:0.75rem;">${new Date(m.timestamp).toLocaleDateString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Track Case';
        resultBox.innerHTML = `<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:4px;font-size:0.85rem;">${error.message || 'Complaint not found.'}</div>`;
    }
}
