/**
 * EduVision – Main Dashboard Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

/**
 * Fetch and render summary statistics and recent complaints
 */
async function loadDashboardData() {
  const statsContainer = document.getElementById('stats-cards-container');
  const tableBody = document.getElementById('recent-complaints-tbody');

  try {
    // Attempt parallel REST API calls
    const [statsResponse, complaintsResponse] = await Promise.allSettled([
      api.get(CONFIG.ENDPOINTS.DASHBOARD_SUMMARY),
      api.get(CONFIG.ENDPOINTS.RECENT_COMPLAINTS)
    ]);

    // Handle Statistics
    if (statsResponse.status === 'fulfilled' && statsResponse.value) {
      renderStats(statsResponse.value);
    } else {
      console.info('Backend stats unavailable, rendering baseline metrics.');
      renderStats(CONFIG.FALLBACK_DATA.stats);
    }

    // Handle Recent Complaints
    if (complaintsResponse.status === 'fulfilled' && Array.isArray(complaintsResponse.value) && complaintsResponse.value.length > 0) {
      renderRecentComplaints(complaintsResponse.value);
    } else {
      console.info('Backend complaints unavailable, rendering baseline complaints.');
      renderRecentComplaints(CONFIG.FALLBACK_DATA.recentComplaints);
    }
  } catch (error) {
    console.warn('Dashboard loading fallback:', error);
    renderStats(CONFIG.FALLBACK_DATA.stats);
    renderRecentComplaints(CONFIG.FALLBACK_DATA.recentComplaints);
  }
}

/**
 * Render 5 statistic cards
 */
function renderStats(stats) {
  const total = stats.total ?? 3;
  const inProcess = stats.inProcess ?? 1;
  const resolved = stats.resolved ?? 1;
  const rejected = stats.rejected ?? 0;
  const underReview = stats.underReview ?? 1;

  // Calculate percentages safely if not provided
  const inProcessPct = stats.inProcessPercent || (total > 0 ? `${Math.round((inProcess / total) * 100)}%` : '0%');
  const resolvedPct = stats.resolvedPercent || (total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%');
  const rejectedPct = stats.rejectedPercent || (total > 0 ? `${Math.round((rejected / total) * 100)}%` : '0%');
  const underReviewPct = stats.underReviewPercent || (total > 0 ? `${Math.round((underReview / total) * 100)}%` : '0%');

  const container = document.getElementById('stats-cards-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Card 1: Total Complaints -->
    <div class="stat-pill-card stat-card-total">
      <div class="stat-pill-top">
        <div class="stat-pill-icon"><i class="fas fa-folder-open"></i></div>
      </div>
      <div class="stat-pill-title">Total Complaints</div>
      <div class="stat-pill-number">${total}</div>
      <div class="stat-pill-subtext">(All time)</div>
    </div>

    <!-- Card 2: In Process -->
    <div class="stat-pill-card stat-card-process">
      <div class="stat-pill-top">
        <div class="stat-pill-icon"><i class="far fa-clock"></i></div>
      </div>
      <div class="stat-pill-title">In Process</div>
      <div class="stat-pill-number">${inProcess}</div>
      <div class="stat-pill-subtext">(${inProcessPct})</div>
    </div>

    <!-- Card 3: Resolved -->
    <div class="stat-pill-card stat-card-resolved">
      <div class="stat-pill-top">
        <div class="stat-pill-icon"><i class="far fa-check-circle"></i></div>
      </div>
      <div class="stat-pill-title">Resolved</div>
      <div class="stat-pill-number">${resolved}</div>
      <div class="stat-pill-subtext">(${resolvedPct})</div>
    </div>

    <!-- Card 4: Rejected -->
    <div class="stat-pill-card stat-card-rejected">
      <div class="stat-pill-top">
        <div class="stat-pill-icon"><i class="fas fa-ban"></i></div>
      </div>
      <div class="stat-pill-title">Rejected</div>
      <div class="stat-pill-number">${rejected}</div>
      <div class="stat-pill-subtext">(${rejectedPct})</div>
    </div>

    <!-- Card 5: Under Review -->
    <div class="stat-pill-card stat-card-review">
      <div class="stat-pill-top">
        <div class="stat-pill-icon"><i class="fas fa-search"></i></div>
      </div>
      <div class="stat-pill-title">Under Review</div>
      <div class="stat-pill-number">${underReview}</div>
      <div class="stat-pill-subtext">(${underReviewPct})</div>
    </div>
  `;

  // Update Last Updated Timestamp
  const lastUpdatedEl = document.getElementById('dashboard-last-updated');
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = stats.lastUpdated || formatCurrentTimestamp();
  }
}

/**
 * Format timestamp nicely
 */
function formatCurrentTimestamp() {
  const now = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  return now.toLocaleDateString('en-GB', options);
}

/**
 * Render recent complaints table matching screenshot
 */
function renderRecentComplaints(complaints) {
  const tbody = document.getElementById('recent-complaints-tbody');
  if (!tbody) return;

  if (!complaints || complaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 24px; color: #64748b;">
          No recent complaints found. <a href="file-complaint.html" style="color:var(--primary-blue); font-weight:600;">File a new complaint</a>.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    const statusMeta = getStatusBadgeInfo(c.status);
    const trackingId = c.trackingId || c.id;
    const formattedDate = c.createdAt ? formatDateString(c.createdAt) : (c.date || '22 Oct 2026');
    const institution = c.institutionName || c.institution || 'AICTE Affiliated Institute';

    return `
      <tr>
        <td>
          <a href="complaint-details.html?id=${encodeURIComponent(trackingId)}" class="complaint-id-link">
            ${escapeHtml(trackingId)}
          </a>
        </td>
        <td>${escapeHtml(formattedDate)}</td>
        <td>${escapeHtml(institution)}</td>
        <td>${escapeHtml(c.category || 'General')}</td>
        <td>
          <span class="status-badge ${statusMeta.cssClass}">
            ${statusMeta.label}
          </span>
        </td>
        <td>
          <a href="complaint-details.html?id=${encodeURIComponent(trackingId)}" class="action-view-btn">
            View
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Map status code to human readable label & badge css class
 */
function getStatusBadgeInfo(status) {
  if (!status) return { label: 'In Process', cssClass: 'in-process' };
  const s = status.toUpperCase().replace(/\s+/g, '_');
  switch (s) {
    case 'IN_PROCESS':
      return { label: 'In Process', cssClass: 'in-process' };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', cssClass: 'under-review' };
    case 'RESOLVED':
      return { label: 'Resolved', cssClass: 'resolved' };
    case 'REJECTED':
      return { label: 'Rejected', cssClass: 'rejected' };
    case 'SUBMITTED':
      return { label: 'Submitted', cssClass: 'submitted' };
    case 'CLOSED':
      return { label: 'Closed', cssClass: 'closed' };
    default:
      return { label: status, cssClass: 'in-process' };
  }
}

/**
 * Format ISO date string into '22 Oct 2026' format
 */
function formatDateString(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return iso;
  }
}

/**
 * XSS escaping helper
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
