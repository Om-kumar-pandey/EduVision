/**
 * EduVision – Your Complaints List & Filtering Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initMyComplaints();
});

let allComplaints = [];
let filteredComplaints = [];
let currentPage = 1;
const pageSize = 5;

// Fallback helper utilities in case called before main.js
function getStatusBadge(status) {
  if (typeof window.getStatusBadgeInfo === 'function') {
    return window.getStatusBadgeInfo(status);
  }
  const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
  switch (s) {
    case 'IN_PROCESS': return { label: 'In Process', cssClass: 'in-process' };
    case 'UNDER_REVIEW': return { label: 'Under Review', cssClass: 'under-review' };
    case 'RESOLVED': return { label: 'Resolved', cssClass: 'resolved' };
    case 'REJECTED': return { label: 'Rejected', cssClass: 'rejected' };
    case 'SUBMITTED': return { label: 'Submitted', cssClass: 'submitted' };
    case 'CLOSED': return { label: 'Closed', cssClass: 'closed' };
    default: return { label: status || 'Submitted', cssClass: 'in-process' };
  }
}

function formatDate(iso) {
  if (typeof window.formatDateString === 'function') {
    return window.formatDateString(iso);
  }
  return iso || 'Recently';
}

function escapeTxt(str) {
  if (typeof window.escapeHtml === 'function') {
    return window.escapeHtml(str);
  }
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function initMyComplaints() {
  initFilters();
  await loadMyComplaints();

  // Check if URL has a search query param
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    const searchInput = document.getElementById('search-complaint-input');
    if (searchInput) {
      searchInput.value = searchParam;
      applyFilters();
    }
  }
}

function initFilters() {
  const searchInput = document.getElementById('search-complaint-input');
  const statusFilter = document.getElementById('status-filter');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
  if (sortFilter) sortFilter.addEventListener('change', applyFilters);

  // Populate 20 Categories
  if (categoryFilter && categoryFilter.options.length <= 1) {
    CONFIG.CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }
}

async function loadMyComplaints() {
  const tbody = document.getElementById('my-complaints-tbody');
  const countEl = document.getElementById('results-count-label');

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 40px;">
          <span class="spinner spinner-blue" style="width:24px; height:24px; border-width:3px;"></span>
          <div style="margin-top:10px; font-size:13px; color:#64748b; font-weight:600;">Loading your complaints...</div>
        </td>
      </tr>
    `;
  }

  // Load locally saved user submissions if any
  let localSubmissions = [];
  try {
    const rawLocal = localStorage.getItem('eduvision_user_complaints');
    if (rawLocal) {
      localSubmissions = JSON.parse(rawLocal);
    }
  } catch (e) {
    localSubmissions = [];
  }

  try {
    const response = await api.get(CONFIG.ENDPOINTS.MY_COMPLAINTS);
    if (Array.isArray(response)) {
      // Merge unique local submissions with API complaints
      const map = new Map();
      localSubmissions.forEach(c => map.set(c.trackingId || c.id, c));
      response.forEach(c => map.set(c.trackingId || c.id, c));
      allComplaints = Array.from(map.values());
    } else {
      allComplaints = localSubmissions.length > 0 ? localSubmissions : CONFIG.FALLBACK_DATA.recentComplaints;
    }
  } catch (error) {
    console.warn('Backend unavailable, checking local or baseline records:', error.message);
    if (localSubmissions && localSubmissions.length > 0) {
      allComplaints = localSubmissions;
    } else {
      // If offline demo, use seeded baseline records for Rahul Sharma
      allComplaints = CONFIG.FALLBACK_DATA.recentComplaints;
    }
  }

  filteredComplaints = [...allComplaints];
  currentPage = 1;
  renderTable();
}
window.loadMyComplaints = loadMyComplaints;

function applyFilters() {
  const searchVal = (document.getElementById('search-complaint-input')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('status-filter')?.value || 'ALL';
  const categoryVal = document.getElementById('category-filter')?.value || 'ALL';
  const sortVal = document.getElementById('sort-filter')?.value || 'NEWEST';

  filteredComplaints = allComplaints.filter(c => {
    const trackingId = (c.trackingId || c.id || '').toLowerCase();
    const subject = (c.subject || c.description || '').toLowerCase();
    const inst = (c.institutionName || c.institution || '').toLowerCase();
    const cat = c.category || '';
    const stat = (c.status || '').toUpperCase();

    const matchesSearch = !searchVal || trackingId.includes(searchVal) || subject.includes(searchVal) || inst.includes(searchVal);
    const matchesStatus = statusVal === 'ALL' || stat === statusVal;
    const matchesCategory = categoryVal === 'ALL' || cat === categoryVal;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting
  if (sortVal === 'NEWEST') {
    filteredComplaints.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  } else if (sortVal === 'OLDEST') {
    filteredComplaints.sort((a, b) => new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0));
  } else if (sortVal === 'STATUS') {
    filteredComplaints.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
  }

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('my-complaints-tbody');
  const countEl = document.getElementById('results-count-label');
  if (!tbody) return;

  if (countEl) {
    countEl.textContent = `Showing ${filteredComplaints.length} complaint${filteredComplaints.length === 1 ? '' : 's'}`;
  }

  if (filteredComplaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 48px 24px;">
          <div style="max-width: 420px; margin: 0 auto; text-align: center;">
            <i class="far fa-folder-open" style="font-size: 42px; color: #94a3b8; margin-bottom: 14px; display: inline-block;"></i>
            <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Complaints Found</h4>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5;">
              ${allComplaints.length === 0 ? "You haven't filed any complaints yet. When you submit a complaint, it will appear here." : "No complaints match your current filter criteria."}
            </p>
            <a href="file-complaint.html" class="btn-primary" style="display: inline-flex; align-items:center; gap:8px;">
              <i class="fas fa-plus"></i> File a New Complaint
            </a>
          </div>
        </td>
      </tr>
    `;
    renderPagination(0);
    return;
  }

  // Pagination slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filteredComplaints.slice(startIndex, startIndex + pageSize);

  tbody.innerHTML = paginated.map(c => {
    const statusMeta = getStatusBadge(c.status);
    const trackingId = c.trackingId || c.id;
    const formattedDate = c.createdAt ? formatDate(c.createdAt) : (c.date || '22 Oct 2026');
    const institution = c.institutionName || c.institution || 'AICTE Affiliated Institution';
    const displaySubject = c.subject || (c.description ? (c.description.length > 70 ? c.description.substring(0, 67) + '...' : c.description) : 'Complaint details');

    return `
      <tr>
        <td>
          <a href="complaint-details.html?id=${encodeURIComponent(trackingId)}" class="complaint-id-link">
            ${escapeTxt(trackingId)}
          </a>
        </td>
        <td>${escapeTxt(formattedDate)}</td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${escapeTxt(displaySubject)}</div>
          <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${escapeTxt(institution)}</div>
        </td>
        <td>${escapeTxt(c.category || 'General')}</td>
        <td>
          <span class="status-badge ${statusMeta.cssClass}">
            ${escapeTxt(statusMeta.label)}
          </span>
        </td>
        <td>
          <a href="complaint-details.html?id=${encodeURIComponent(trackingId)}" class="action-view-btn">
            View Details
          </a>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination(filteredComplaints.length);
}

function renderPagination(totalItems) {
  const pagContainer = document.getElementById('complaints-pagination');
  if (!pagContainer) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) {
    pagContainer.innerHTML = '';
    return;
  }

  let html = `<div style="display:flex; align-items:center; gap:6px; justify-content:center; margin-top:20px;">`;

  html += `<button type="button" class="btn-secondary" style="padding:6px 12px; font-size:12px;" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    const activeStyle = i === currentPage ? 'background:var(--primary-blue); color:#fff; border-color:var(--primary-blue);' : '';
    html += `<button type="button" class="btn-secondary" style="padding:6px 12px; font-size:12px; ${activeStyle}" onclick="changePage(${i})">${i}</button>`;
  }

  html += `<button type="button" class="btn-secondary" style="padding:6px 12px; font-size:12px;" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next <i class="fas fa-chevron-right"></i></button>`;

  html += `</div>`;
  pagContainer.innerHTML = html;
}

window.changePage = function(page) {
  currentPage = page;
  renderTable();
};
