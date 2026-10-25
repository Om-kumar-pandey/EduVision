/**
 * EduVision – My Complaints List & Filtering Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initMyComplaints();
});

let allComplaints = [];
let filteredComplaints = [];
let currentPage = 1;
const pageSize = 5;

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

  // Populate Categories
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
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;"><span class="spinner spinner-blue"></span> Loading complaints...</td></tr>`;
  }

  try {
    const response = await api.get(CONFIG.ENDPOINTS.MY_COMPLAINTS);
    if (Array.isArray(response) && response.length > 0) {
      allComplaints = response;
    } else {
      allComplaints = CONFIG.FALLBACK_DATA.recentComplaints;
    }
  } catch (error) {
    console.warn('Backend unavailable, using fallback complaints:', error);
    allComplaints = CONFIG.FALLBACK_DATA.recentComplaints;
  }

  filteredComplaints = [...allComplaints];
  currentPage = 1;
  renderTable();
}

function applyFilters() {
  const searchVal = (document.getElementById('search-complaint-input')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('status-filter')?.value || 'ALL';
  const categoryVal = document.getElementById('category-filter')?.value || 'ALL';
  const sortVal = document.getElementById('sort-filter')?.value || 'NEWEST';

  filteredComplaints = allComplaints.filter(c => {
    const trackingId = (c.trackingId || c.id || '').toLowerCase();
    const subject = (c.subject || '').toLowerCase();
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
    filteredComplaints.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  } else if (sortVal === 'OLDEST') {
    filteredComplaints.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
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
        <td colspan="7" style="text-align:center; padding: 36px; color: #64748b;">
          No matching complaints found. Try clearing your filters or <a href="file-complaint.html" style="color:var(--primary-blue); font-weight:600;">file a new grievance</a>.
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
    const statusMeta = getStatusBadgeInfo(c.status);
    const trackingId = c.trackingId || c.id;
    const formattedDate = c.createdAt ? formatDateString(c.createdAt) : (c.date || '22 Oct 2026');
    const institution = c.institutionName || c.institution || 'AICTE Affiliated Institution';
    const subject = c.subject || 'Complaint regarding educational facilities';

    return `
      <tr>
        <td>
          <a href="complaint-details.html?id=${encodeURIComponent(trackingId)}" class="complaint-id-link">
            ${escapeHtml(trackingId)}
          </a>
        </td>
        <td>${escapeHtml(formattedDate)}</td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${escapeHtml(subject)}</div>
          <div style="font-size:11.5px; color:#64748b;">${escapeHtml(institution)}</div>
        </td>
        <td>${escapeHtml(c.category || 'General')}</td>
        <td>
          <span class="status-badge ${statusMeta.cssClass}">
            ${statusMeta.label}
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
  
  html += `<button class="btn-secondary" style="padding:6px 12px; font-size:12px;" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    const activeStyle = i === currentPage ? 'background:var(--primary-blue); color:#fff; border-color:var(--primary-blue);' : '';
    html += `<button class="btn-secondary" style="padding:6px 12px; font-size:12px; ${activeStyle}" onclick="changePage(${i})">${i}</button>`;
  }

  html += `<button class="btn-secondary" style="padding:6px 12px; font-size:12px;" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next <i class="fas fa-chevron-right"></i></button>`;

  html += `</div>`;
  pagContainer.innerHTML = html;
}

window.changePage = function(page) {
  currentPage = page;
  renderTable();
};
