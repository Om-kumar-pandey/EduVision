/**
 * EduVision – Public Complaint Tracking & Status Timeline Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initTracking();
});

function initTracking() {
  const form = document.getElementById('tracking-search-form');
  const input = document.getElementById('tracking-id-input');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = input.value.trim();
      if (!id) {
        showToast('Please enter a valid Complaint ID.', 'warning');
        return;
      }
      performTrack(id);
    });
  }

  // Check URL parameters for direct deep-link
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (idParam) {
    if (input) input.value = idParam;
    performTrack(idParam);
  }
}

async function performTrack(trackingId) {
  const resultCard = document.getElementById('tracking-result-card');
  const loader = document.getElementById('tracking-loader');
  const emptyState = document.getElementById('tracking-empty-state');

  if (emptyState) emptyState.style.display = 'none';
  if (resultCard) resultCard.style.display = 'none';
  if (loader) loader.style.display = 'block';

  try {
    let data = null;
    try {
      data = await api.get(`${CONFIG.ENDPOINTS.TRACK}/${encodeURIComponent(trackingId)}`);
    } catch (err) {
      console.warn('Backend tracking endpoint failed, using local lookup:', err);
      // Fallback search inside sample data
      const match = CONFIG.FALLBACK_DATA.recentComplaints.find(c => c.id.toUpperCase() === trackingId.toUpperCase());
      if (match) {
        data = {
          trackingId: match.id,
          date: match.date,
          institution: match.institution,
          category: match.category,
          subject: match.subject,
          status: match.status,
          history: [
            {
              status: 'SUBMITTED',
              title: 'Complaint Submitted',
              timestamp: '22 Oct 2026, 09:30 AM',
              remarks: 'Grievance received and cataloged in AICTE National Grievance Repository.'
            },
            {
              status: 'UNDER_REVIEW',
              title: 'Under Initial Assessment',
              timestamp: '22 Oct 2026, 11:15 AM',
              remarks: 'Assigned to AICTE Regional Monitoring Officer for preliminary verification.'
            },
            {
              status: match.status,
              title: match.status === 'RESOLVED' ? 'Resolution Provided' : 'In Active Investigation',
              timestamp: '23 Oct 2026, 02:40 PM',
              remarks: match.status === 'RESOLVED' 
                ? 'Issue formally addressed. Redressal notice dispatched to complainant and institution.' 
                : 'Notice sent to Institution Registrar. Awaiting formal institutional clarification.'
            }
          ]
        };
      } else {
        throw new Error(`Complaint ID "${trackingId}" was not found or is still being indexed.`);
      }
    }

    renderTrackingResult(data);
  } catch (error) {
    showToast(error.message || 'Complaint not found.', 'danger');
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div style="text-align:center; padding:40px; color:#64748b;">
          <i class="fas fa-search-minus" style="font-size:36px; color:#94a3b8; margin-bottom:12px;"></i>
          <h4 style="font-size:16px; color:#1e293b; margin-bottom:6px;">No Records Found</h4>
          <p style="font-size:13px; max-width:400px; margin:0 auto;">No grievance was found matching "<strong>${escapeHtml(trackingId)}</strong>". Please check your Complaint ID and try again.</p>
        </div>
      `;
    }
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

function renderTrackingResult(c) {
  const resultCard = document.getElementById('tracking-result-card');
  if (!resultCard) return;

  const statusMeta = getStatusBadgeInfo(c.status);

  // Bind Fields
  const idEl = document.getElementById('result-tracking-id');
  const statusBadgeEl = document.getElementById('result-status-badge');
  const dateEl = document.getElementById('result-submission-date');
  const instEl = document.getElementById('result-institution');
  const catEl = document.getElementById('result-category');
  const subjectEl = document.getElementById('result-subject');

  if (idEl) idEl.textContent = c.trackingId || c.id;
  if (statusBadgeEl) {
    statusBadgeEl.className = `status-badge ${statusMeta.cssClass}`;
    statusBadgeEl.textContent = statusMeta.label;
  }
  if (dateEl) dateEl.textContent = c.createdAt ? formatDateString(c.createdAt) : (c.date || '22 Oct 2026');
  if (instEl) instEl.textContent = c.institutionName || c.institution || 'AICTE Affiliated Institution';
  if (catEl) catEl.textContent = c.category || 'General';
  if (subjectEl) subjectEl.textContent = c.subject || 'Complaint details';

  // Render Status Timeline
  const timelineContainer = document.getElementById('result-timeline');
  if (timelineContainer) {
    const history = c.history || [
      {
        status: 'SUBMITTED',
        title: 'Complaint Registered',
        timestamp: c.createdAt ? formatDateString(c.createdAt) : '22 Oct 2026',
        remarks: 'Registered via EduVision online grievance submission.'
      }
    ];

    timelineContainer.innerHTML = history.map((event, idx) => {
      let dotType = '';
      if (event.status === 'RESOLVED') dotType = 'success';
      else if (event.status === 'REJECTED') dotType = 'danger';
      else if (event.status === 'IN_PROCESS') dotType = 'warning';

      return `
        <div class="timeline-event-item">
          <div class="timeline-dot ${dotType}">
            <i class="fas ${event.status === 'RESOLVED' ? 'fa-check' : 'fa-circle'}"></i>
          </div>
          <div class="timeline-content-card">
            <div class="timeline-title-row">
              <span class="timeline-title">${escapeHtml(event.title || event.status)}</span>
              <span class="timeline-time">${escapeHtml(event.timestamp || '')}</span>
            </div>
            <div class="timeline-remarks">${escapeHtml(event.remarks || 'Status updated.')}</div>
            ${event.officer ? `<span class="timeline-officer"><i class="fas fa-user-shield"></i> Handled by: ${escapeHtml(event.officer)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  resultCard.style.display = 'block';
  resultCard.scrollIntoView({ behavior: 'smooth' });
}
