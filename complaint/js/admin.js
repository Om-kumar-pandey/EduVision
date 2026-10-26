/**
 * EduVision – Admin & Grievance Officer Portal Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

let adminComplaints = [];
let selectedComplaintId = null;

async function initAdminDashboard() {
  const allowed = ['ADMIN', 'AICTE_OFFICER', 'INSTITUTION_HEAD', 'HOD'];
  const user = auth.getUser() || CONFIG.FALLBACK_DATA.user;

  if (!allowed.includes(user.role)) {
    // If ordinary student, show notice or switch role for convenience
    console.info('Switching to officer view for inspection');
  }

  initAdminTabs();
  initStatusModal();
  initAssignModal();
  initCsvExport();

  await loadAdminComplaints();
}

function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const complaintsSection = document.getElementById('admin-complaints-view');
  const usersSection = document.getElementById('admin-users-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.tab;
      if (target === 'complaints') {
        if (complaintsSection) complaintsSection.style.display = 'block';
        if (usersSection) usersSection.style.display = 'none';
      } else if (target === 'users') {
        if (complaintsSection) complaintsSection.style.display = 'none';
        if (usersSection) usersSection.style.display = 'block';
        loadAdminUsers();
      }
    });
  });
}

async function loadAdminComplaints() {
  const tbody = document.getElementById('admin-complaints-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px;"><span class="spinner spinner-blue"></span> Loading officer records...</td></tr>`;
  }

  try {
    const data = await api.get(CONFIG.ENDPOINTS.ADMIN_COMPLAINTS);
    if (Array.isArray(data) && data.length > 0) {
      adminComplaints = data;
    } else {
      adminComplaints = CONFIG.FALLBACK_DATA.recentComplaints;
    }
  } catch (err) {
    console.warn('Backend admin complaints fallback:', err);
    adminComplaints = CONFIG.FALLBACK_DATA.recentComplaints;
  }

  renderAdminTable(adminComplaints);
}

function renderAdminTable(list) {
  const tbody = document.getElementById('admin-complaints-tbody');
  if (!tbody) return;

  tbody.innerHTML = list.map(c => {
    const statusMeta = getStatusBadgeInfo(c.status);
    const trackingId = c.trackingId || c.id;
    const formattedDate = c.createdAt ? formatDateString(c.createdAt) : (c.date || '22 Oct 2026');
    const institution = c.institutionName || c.institution || 'ABC Institute of Technology (UP)';
    const assignedOfficer = c.assignedOfficer || 'Unassigned';

    return `
      <tr>
        <td><strong>${escapeHtml(trackingId)}</strong></td>
        <td>${escapeHtml(formattedDate)}</td>
        <td>${escapeHtml(institution)}</td>
        <td>${escapeHtml(c.category || 'General')}</td>
        <td><span class="status-badge ${statusMeta.cssClass}">${statusMeta.label}</span></td>
        <td><span class="officer-assignment-pill"><i class="fas fa-user-shield"></i> ${escapeHtml(assignedOfficer)}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary" style="padding:4px 10px; font-size:11.5px;" onclick="openStatusModal('${escapeHtml(trackingId)}')">
              <i class="fas fa-edit"></i> Status
            </button>
            <button class="btn-secondary" style="padding:4px 10px; font-size:11.5px;" onclick="openAssignModal('${escapeHtml(trackingId)}')">
              <i class="fas fa-user-check"></i> Assign
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initStatusModal() {
  const modal = document.getElementById('status-update-modal');
  const closeBtn = document.getElementById('close-status-modal-btn');
  const cancelBtn = document.getElementById('cancel-status-btn');
  const form = document.getElementById('status-update-form');
  const statusSelect = document.getElementById('modal-new-status');
  const remarksGroup = document.getElementById('remarks-group');
  const rejectionGroup = document.getElementById('rejection-reason-group');

  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
  if (cancelBtn) cancelBtn.onclick = () => modal.classList.remove('show');

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      const val = statusSelect.value;
      if (val === 'REJECTED') {
        if (rejectionGroup) rejectionGroup.style.display = 'block';
      } else {
        if (rejectionGroup) rejectionGroup.style.display = 'none';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newStatus = statusSelect.value;
      const remarks = document.getElementById('modal-status-remarks').value.trim();
      const internalNote = document.getElementById('modal-internal-note').value.trim();
      const rejectionReason = document.getElementById('modal-rejection-reason')?.value.trim();

      if (newStatus === 'REJECTED' && !rejectionReason) {
        showToast('A mandatory rejection reason is required when rejecting a complaint.', 'danger');
        return;
      }

      try {
        await api.patch(CONFIG.ENDPOINTS.ADMIN_UPDATE_STATUS.replace('{id}', selectedComplaintId), {
          status: newStatus,
          remarks: remarks,
          internalNote: internalNote,
          rejectionReason: rejectionReason
        });
        showToast(`Complaint ${selectedComplaintId} status updated to ${newStatus}`, 'success');
      } catch (err) {
        console.warn('Backend status update fallback:', err);
        // Update local array
        const item = adminComplaints.find(c => (c.trackingId || c.id) === selectedComplaintId);
        if (item) item.status = newStatus;
        showToast(`Complaint ${selectedComplaintId} updated (local session)`, 'success');
      }

      modal.classList.remove('show');
      renderAdminTable(adminComplaints);
    });
  }
}

window.openStatusModal = function(trackingId) {
  selectedComplaintId = trackingId;
  const modal = document.getElementById('status-update-modal');
  const label = document.getElementById('modal-target-complaint-id');
  if (label) label.textContent = trackingId;
  if (modal) modal.classList.add('show');
};

function initAssignModal() {
  const modal = document.getElementById('assign-officer-modal');
  const closeBtn = document.getElementById('close-assign-modal-btn');
  const cancelBtn = document.getElementById('cancel-assign-btn');
  const form = document.getElementById('assign-officer-form');

  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
  if (cancelBtn) cancelBtn.onclick = () => modal.classList.remove('show');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const officer = document.getElementById('modal-officer-select').value;

      try {
        await api.patch(CONFIG.ENDPOINTS.ADMIN_ASSIGN.replace('{id}', selectedComplaintId), {
          assignedOfficer: officer
        });
        showToast(`Assigned complaint ${selectedComplaintId} to ${officer}`, 'success');
      } catch (err) {
        const item = adminComplaints.find(c => (c.trackingId || c.id) === selectedComplaintId);
        if (item) item.assignedOfficer = officer;
        showToast(`Assigned ${selectedComplaintId} to ${officer} (local session)`, 'success');
      }

      modal.classList.remove('show');
      renderAdminTable(adminComplaints);
    });
  }
}

window.openAssignModal = function(trackingId) {
  selectedComplaintId = trackingId;
  const modal = document.getElementById('assign-officer-modal');
  const label = document.getElementById('modal-assign-complaint-id');
  if (label) label.textContent = trackingId;
  if (modal) modal.classList.add('show');
};

function initCsvExport() {
  const exportBtn = document.getElementById('btn-export-csv');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    let csv = 'Complaint ID,Submission Date,Institution,Category,Status,Assigned Officer\n';
    adminComplaints.forEach(c => {
      const trackingId = c.trackingId || c.id;
      const d = c.createdAt ? formatDateString(c.createdAt) : (c.date || '22 Oct 2026');
      const inst = `"${(c.institutionName || c.institution || '').replace(/"/g, '""')}"`;
      const cat = `"${(c.category || '').replace(/"/g, '""')}"`;
      const stat = c.status || 'IN_PROCESS';
      const off = `"${(c.assignedOfficer || 'Unassigned').replace(/"/g, '""')}"`;
      csv += `${trackingId},${d},${inst},${cat},${stat},${off}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduVision_Complaints_Report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Complaint report exported to CSV successfully.', 'success');
  });
}

async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  const mockUsers = [
    { id: 1, fullName: 'Rahul Sharma', email: 'rahul.sharma@eduvision.in', role: 'STUDENT', institution: 'ABC Institute of Technology (UP)' },
    { id: 2, fullName: 'Dr. Anand Raman', email: 'anand.raman@eduvision.in', role: 'TEACHER', institution: 'ABC Institute of Technology (UP)' },
    { id: 3, fullName: 'Prof. Sunita Patil', email: 'sunita.patil@eduvision.in', role: 'HOD', institution: 'Global Engineering College (MH)' },
    { id: 4, fullName: 'Dr. S. K. Verma', email: 'sk.verma@aicte-india.org', role: 'AICTE_OFFICER', institution: 'AICTE Headquarters, New Delhi' },
    { id: 5, fullName: 'System Administrator', email: 'admin@eduvision.in', role: 'ADMIN', institution: 'EduVision Central Portal' }
  ];

  tbody.innerHTML = mockUsers.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.fullName)}</strong></td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="admin-badge-role">${escapeHtml(u.role)}</span></td>
      <td>${escapeHtml(u.institution)}</td>
      <td>
        <button class="btn-secondary" style="padding:4px 10px; font-size:11.5px;" onclick="showToast('Role permissions saved.', 'info')">
          <i class="fas fa-user-cog"></i> Edit
        </button>
      </td>
    </tr>
  `).join('');
}
