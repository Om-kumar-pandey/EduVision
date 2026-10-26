/**
 * ============================================================================
 * EDUVISION — REGIONAL CASE TRACKING CONTROLLER
 * AICTE Integrated Institution Complaint Monitoring and Status Dashboard
 * ============================================================================
 * Controls reactive case list filtering, multi-criteria search, sorting,
 * pagination, regional authorization enforcement, and case detail timeline view.
 * ============================================================================
 */

// Application State
const STATE = {
  activeView: "list", // 'list' | 'detail'
  selectedCaseId: null,
  currentRegion: "North Region",
  filters: {
    query: "",
    bureau: "All",
    status: "All",
    category: "All",
    dateFrom: "",
    dateTo: "",
    sortBy: "created_desc",
    page: 1,
    pageSize: 10
  },
  lastQueryResult: null
};

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", () => {
  initFilterControls();
  initSidebarToggle();
  initRegionSelector();
  initGlobalHeaderSearch();
  initRoutingFromHash();

  // Listen to hash changes for deep linking (e.g., #case?id=CASE-2026-0001 or #list)
  window.addEventListener("hashchange", initRoutingFromHash);
});

/**
 * URL Hash Router
 * Supports deep linking: #case?id=CASE-2026-0001 or #list
 */
function initRoutingFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith("#case")) {
    const params = new URLSearchParams(hash.replace("#case?", ""));
    const caseId = params.get("id");
    if (caseId) {
      showCaseDetail(caseId, false);
      return;
    }
  }
  showCaseList(false);
}

/**
 * Filter Controls & Listeners Initialization
 */
function initFilterControls() {
  const searchInput = document.getElementById("caseSearchInput");
  const bureauSelect = document.getElementById("filterBureauSelect");
  const statusSelect = document.getElementById("filterStatusSelect");
  const categorySelect = document.getElementById("filterCategorySelect");
  const dateFromInput = document.getElementById("filterDateFrom");
  const dateToInput = document.getElementById("filterDateTo");
  const sortSelect = document.getElementById("sortCasesSelect");
  const clearBtn = document.getElementById("btnClearFilters");
  const pageSizeSelect = document.getElementById("pageSizeSelect");

  function onFilterChange(resetPage = true) {
    if (resetPage) STATE.filters.page = 1;

    STATE.filters.query = searchInput ? searchInput.value.trim() : "";
    STATE.filters.bureau = bureauSelect ? bureauSelect.value : "All";
    STATE.filters.status = statusSelect ? statusSelect.value : "All";
    STATE.filters.category = categorySelect ? categorySelect.value : "All";
    STATE.filters.dateFrom = dateFromInput ? dateFromInput.value : "";
    STATE.filters.dateTo = dateToInput ? dateToInput.value : "";
    STATE.filters.sortBy = sortSelect ? sortSelect.value : "created_desc";
    if (pageSizeSelect) STATE.filters.pageSize = parseInt(pageSizeSelect.value, 10) || 10;

    renderCaseTrackingTable();
  }

  // Debounced search input
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => onFilterChange(true), 200);
    });
  }

  if (bureauSelect) bureauSelect.addEventListener("change", () => onFilterChange(true));
  if (statusSelect) statusSelect.addEventListener("change", () => onFilterChange(true));
  if (categorySelect) categorySelect.addEventListener("change", () => onFilterChange(true));
  if (dateFromInput) dateFromInput.addEventListener("change", () => onFilterChange(true));
  if (dateToInput) dateToInput.addEventListener("change", () => onFilterChange(true));
  if (sortSelect) sortSelect.addEventListener("change", () => onFilterChange(false));
  if (pageSizeSelect) pageSizeSelect.addEventListener("change", () => onFilterChange(true));

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetAllFilters();
    });
  }

  // Initial table render
  renderCaseTrackingTable();
}

/**
 * Resets all search and filter dropdowns to baseline
 */
window.resetAllFilters = function () {
  const searchInput = document.getElementById("caseSearchInput");
  const bureauSelect = document.getElementById("filterBureauSelect");
  const statusSelect = document.getElementById("filterStatusSelect");
  const categorySelect = document.getElementById("filterCategorySelect");
  const dateFromInput = document.getElementById("filterDateFrom");
  const dateToInput = document.getElementById("filterDateTo");
  const sortSelect = document.getElementById("sortCasesSelect");
  const globalSearchInput = document.getElementById("globalSearchInput");

  if (searchInput) searchInput.value = "";
  if (globalSearchInput) globalSearchInput.value = "";
  if (bureauSelect) bureauSelect.value = "All";
  if (statusSelect) statusSelect.value = "All";
  if (categorySelect) categorySelect.value = "All";
  if (dateFromInput) dateFromInput.value = "";
  if (dateToInput) dateToInput.value = "";
  if (sortSelect) sortSelect.value = "created_desc";

  STATE.filters = {
    query: "",
    bureau: "All",
    status: "All",
    category: "All",
    dateFrom: "",
    dateTo: "",
    sortBy: "created_desc",
    page: 1,
    pageSize: STATE.filters.pageSize || 10
  };

  renderCaseTrackingTable();
  showToast("All filters cleared. Showing all authorized cases.");
};

/**
 * Renders the Case Tracking Table using RegionalCaseTrackingAPI
 */
async function renderCaseTrackingTable() {
  const tbody = document.getElementById("caseTrackingTableBody");
  const countEl = document.getElementById("filteredCountLabel");
  const chipsContainer = document.getElementById("activeFilterChips");
  const paginationControls = document.getElementById("paginationControls");
  const paginationRange = document.getElementById("paginationRangeText");

  if (!tbody) return;

  // Render Loading Skeleton
  tbody.innerHTML = `
    <tr>
      <td colspan="11" style="padding: 0; border: none;">
        <div class="loading-skeleton-row"></div>
      </td>
    </tr>
  `;

  // Fetch authorized data from API
  const response = await window.RegionalCaseTrackingAPI.getCases({
    region: STATE.currentRegion,
    ...STATE.filters
  });

  // Handle 403 Forbidden Regional Authorization
  if (!response.success && response.statusCode === 403) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="padding: 0; border: none;">
          <div class="unauthorized-state-box">
            <div class="unauthorized-state-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 class="unauthorized-state-title">Regional Access Restricted (403)</h3>
            <p class="unauthorized-state-desc">
              ${escapeHtml(response.message)}
            </p>
            <button class="unauthorized-state-btn" onclick="switchToAuthorizedRegion()">
              Switch to North Region (Authorized Jurisdiction)
            </button>
          </div>
        </td>
      </tr>
    `;
    if (countEl) countEl.textContent = "0 cases accessible";
    if (chipsContainer) chipsContainer.innerHTML = "";
    if (paginationControls) paginationControls.innerHTML = "";
    if (paginationRange) paginationRange.textContent = "Showing 0 cases";
    updateMetricCards(0, 0, 0, 0);
    return;
  }

  // Handle generic error
  if (!response.success) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="padding: 0; border: none;">
          <div class="empty-state-box">
            <h3 class="empty-state-title">Unable to Load Cases</h3>
            <p class="empty-state-desc">${escapeHtml(response.error || "An error occurred while loading regional cases.")}</p>
            <button class="empty-state-btn" onclick="renderCaseTrackingTable()">Retry</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const { cases, totalCount, page, totalPages, pageSize } = response.data;
  STATE.lastQueryResult = response.data;

  // Update Metric Strip
  computeAndRenderMetrics();

  // Update Count Badge & Chips
  if (countEl) {
    countEl.textContent = `Showing ${cases.length} of ${totalCount} authorized cases`;
  }
  if (chipsContainer) {
    renderFilterChips(chipsContainer);
  }

  // Empty State
  if (cases.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="padding: 0; border: none;">
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 class="empty-state-title">No Regional Cases Found</h3>
            <p class="empty-state-desc">
              No complaint cases under ${escapeHtml(STATE.currentRegion)} match your active search and filter criteria.
              Try adjusting the filters or resetting to view all authorized cases.
            </p>
            <button class="empty-state-btn" onclick="resetAllFilters()">
              Clear All Filters
            </button>
          </div>
        </td>
      </tr>
    `;
    if (paginationControls) paginationControls.innerHTML = "";
    if (paginationRange) paginationRange.textContent = "Showing 0 of 0 cases";
    return;
  }

  // Render Rows
  tbody.innerHTML = cases.map((c) => {
    const statusBadgeHtml = getStatusBadgeHtml(c.currentStatus);
    const bureauBadgeHtml = getBureauBadgeHtml(c.bureauCode, c.currentBureau);
    const officerText = c.assignedOfficer ? escapeHtml(c.assignedOfficer) : '<span class="cell-not-available">Not Assigned</span>';
    const resolutionDate = c.expectedResolutionDate ? escapeHtml(formatDateDisplay(c.expectedResolutionDate)) : '<span class="cell-not-available">Not Available</span>';

    return `
      <tr data-case-id="${escapeHtml(c.caseId)}">
        <!-- 1. Case ID -->
        <td>
          <a 
            href="#case?id=${encodeURIComponent(c.caseId)}" 
            class="cell-case-id" 
            onclick="event.preventDefault(); showCaseDetail('${escapeHtml(c.caseId)}');"
            title="Click to view full case tracking details"
          >
            ${escapeHtml(c.caseId)}
          </a>
        </td>

        <!-- 2. Institution ID -->
        <td>
          <span class="cell-institution-id">${escapeHtml(c.institutionId)}</span>
        </td>

        <!-- 3. Institution Name -->
        <td>
          <div class="cell-institution-name">${escapeHtml(c.institutionName)}</div>
        </td>

        <!-- 4. Complaint Category -->
        <td>
          <span class="cell-category">${escapeHtml(c.complaintCategory)}</span>
        </td>

        <!-- 5. Current Bureau/Cell -->
        <td>
          ${bureauBadgeHtml}
        </td>

        <!-- 6. Assigned Officer -->
        <td>
          <span class="cell-officer">${officerText}</span>
        </td>

        <!-- 7. Current Status -->
        <td>
          ${statusBadgeHtml}
        </td>

        <!-- 8. Created Date -->
        <td>
          <span class="cell-date">${escapeHtml(formatDateDisplay(c.createdDate))}</span>
        </td>

        <!-- 9. Last Updated -->
        <td>
          <span class="cell-date">${escapeHtml(formatDateDisplay(c.lastUpdated))}</span>
        </td>

        <!-- 10. Expected Resolution Date -->
        <td>
          <span class="cell-date">${resolutionDate}</span>
        </td>

        <!-- 11. Action: View Details -->
        <td style="text-align: center;">
          <button 
            type="button" 
            class="btn-view-details" 
            onclick="showCaseDetail('${escapeHtml(c.caseId)}')"
            title="View complete case trajectory and audit history"
            aria-label="View Details for case ${escapeHtml(c.caseId)}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>View Details</span>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Render Pagination
  renderPagination(totalCount, page, totalPages, pageSize);
}

/**
 * Calculates and updates metric overview strip
 */
function computeAndRenderMetrics() {
  const allAuthorizedCases = window.REGIONAL_CASES_MASTER_DATA || [];
  const total = allAuthorizedCases.length;

  const active = allAuthorizedCases.filter((c) =>
    ["Pending", "In Progress", "Under Review", "Awaiting Institution Response"].includes(c.currentStatus)
  ).length;

  const transferred = allAuthorizedCases.filter((c) => c.currentStatus === "Transferred").length;
  const resolvedClosed = allAuthorizedCases.filter((c) => ["Resolved", "Closed"].includes(c.currentStatus)).length;

  updateMetricCards(total, active, transferred, resolvedClosed);
}

function updateMetricCards(total, active, transferred, resolvedClosed) {
  const elTotal = document.getElementById("metricTotalCases");
  const elActive = document.getElementById("metricActiveCases");
  const elTransferred = document.getElementById("metricTransferredCases");
  const elResolved = document.getElementById("metricResolvedCases");

  if (elTotal) elTotal.textContent = total;
  if (elActive) elActive.textContent = active;
  if (elTransferred) elTransferred.textContent = transferred;
  if (elResolved) elResolved.textContent = resolvedClosed;
}

/**
 * Renders pagination controls
 */
function renderPagination(totalCount, currentPage, totalPages, pageSize) {
  const paginationControls = document.getElementById("paginationControls");
  const paginationRange = document.getElementById("paginationRangeText");

  if (!paginationControls || !paginationRange) return;

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);
  paginationRange.textContent = `Showing ${startRecord}–${endRecord} of ${totalCount} cases`;

  let buttonsHtml = "";

  // Previous Button
  buttonsHtml += `
    <button 
      class="btn-page-nav" 
      ${currentPage <= 1 ? "disabled" : ""} 
      onclick="goToPage(${currentPage - 1})"
      aria-label="Previous Page"
    >
      &larr; Prev
    </button>
  `;

  // Numbered Pages
  for (let p = 1; p <= totalPages; p++) {
    // Show first, last, and window around current
    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
      buttonsHtml += `
        <button 
          class="btn-page-nav ${p === currentPage ? "active" : ""}" 
          onclick="goToPage(${p})"
          aria-label="Page ${p}"
          ${p === currentPage ? 'aria-current="page"' : ""}
        >
          ${p}
        </button>
      `;
    } else if (p === currentPage - 2 || p === currentPage + 2) {
      buttonsHtml += `<span style="padding: 0 4px; color: #94a3b8;">...</span>`;
    }
  }

  // Next Button
  buttonsHtml += `
    <button 
      class="btn-page-nav" 
      ${currentPage >= totalPages ? "disabled" : ""} 
      onclick="goToPage(${currentPage + 1})"
      aria-label="Next Page"
    >
      Next &rarr;
    </button>
  `;

  paginationControls.innerHTML = buttonsHtml;
}

window.goToPage = function (pageNum) {
  STATE.filters.page = pageNum;
  renderCaseTrackingTable();
  const tableTop = document.querySelector(".case-table-card");
  if (tableTop) {
    tableTop.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

/**
 * Renders active filter chips with removal capability
 */
function renderFilterChips(container) {
  const chips = [];

  if (STATE.filters.query) {
    chips.push({
      label: `Search: "${STATE.filters.query}"`,
      onRemove: () => {
        document.getElementById("caseSearchInput").value = "";
        STATE.filters.query = "";
        STATE.filters.page = 1;
        renderCaseTrackingTable();
      }
    });
  }

  if (STATE.filters.bureau !== "All") {
    chips.push({
      label: `Bureau: ${STATE.filters.bureau}`,
      onRemove: () => {
        document.getElementById("filterBureauSelect").value = "All";
        STATE.filters.bureau = "All";
        STATE.filters.page = 1;
        renderCaseTrackingTable();
      }
    });
  }

  if (STATE.filters.status !== "All") {
    chips.push({
      label: `Status: ${STATE.filters.status}`,
      onRemove: () => {
        document.getElementById("filterStatusSelect").value = "All";
        STATE.filters.status = "All";
        STATE.filters.page = 1;
        renderCaseTrackingTable();
      }
    });
  }

  if (STATE.filters.category !== "All") {
    chips.push({
      label: `Category: ${STATE.filters.category}`,
      onRemove: () => {
        document.getElementById("filterCategorySelect").value = "All";
        STATE.filters.category = "All";
        STATE.filters.page = 1;
        renderCaseTrackingTable();
      }
    });
  }

  if (STATE.filters.dateFrom || STATE.filters.dateTo) {
    chips.push({
      label: `Date: ${STATE.filters.dateFrom || "Start"} to ${STATE.filters.dateTo || "Today"}`,
      onRemove: () => {
        if (document.getElementById("filterDateFrom")) document.getElementById("filterDateFrom").value = "";
        if (document.getElementById("filterDateTo")) document.getElementById("filterDateTo").value = "";
        STATE.filters.dateFrom = "";
        STATE.filters.dateTo = "";
        STATE.filters.page = 1;
        renderCaseTrackingTable();
      }
    });
  }

  if (chips.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = chips
    .map(
      (chip, idx) => `
      <span class="filter-chip">
        <span>${escapeHtml(chip.label)}</span>
        <button 
          type="button" 
          class="filter-chip-remove" 
          onclick="removeFilterChip(${idx})"
          aria-label="Remove filter ${escapeHtml(chip.label)}"
        >
          &times;
        </button>
      </span>
    `
    )
    .join("");

  window._activeChipRemovers = chips.map((c) => c.onRemove);
}

window.removeFilterChip = function (index) {
  if (window._activeChipRemovers && window._activeChipRemovers[index]) {
    window._activeChipRemovers[index]();
  }
};

/**
 * CASE DETAILS VIEW CONTROLLER
 */
window.showCaseDetail = async function (caseId, updateHash = true) {
  STATE.selectedCaseId = caseId;
  STATE.activeView = "detail";

  if (updateHash) {
    window.location.hash = `#case?id=${encodeURIComponent(caseId)}`;
  }

  const listView = document.getElementById("caseTrackingListView");
  const detailView = document.getElementById("caseDetailView");

  if (listView) listView.style.display = "none";
  if (detailView) {
    detailView.style.display = "flex";
    detailView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Fetch case details from API
  const response = await window.RegionalCaseTrackingAPI.getCaseById(caseId, STATE.currentRegion);

  if (!response.success) {
    renderCaseDetailError(response.error, response.message);
    return;
  }

  renderCaseDetailContent(response.data);
};

window.showCaseList = function (updateHash = true) {
  STATE.activeView = "list";
  STATE.selectedCaseId = null;

  if (updateHash) {
    window.location.hash = "#list";
  }

  const listView = document.getElementById("caseTrackingListView");
  const detailView = document.getElementById("caseDetailView");

  if (detailView) detailView.style.display = "none";
  if (listView) {
    listView.style.display = "block";
  }

  // Re-render table preserving filter parameters
  renderCaseTrackingTable();
};

/**
 * Renders the complete Case Details Page
 */
function renderCaseDetailContent(c) {
  const container = document.getElementById("caseDetailContentArea");
  if (!container) return;

  const statusBadgeHtml = getStatusBadgeHtml(c.currentStatus);
  const bureauBadgeHtml = getBureauBadgeHtml(c.bureauCode, c.currentBureau);
  const officerName = c.assignedOfficer || "Not Assigned";
  const officerDesig = c.assignedOfficerDesignation || "Awaiting Bureau Allocation";
  const resolutionDate = c.expectedResolutionDate ? formatDateDisplay(c.expectedResolutionDate) : "Not Available";

  // Movement timeline entries
  const timelineEntriesHtml = (c.movementTimeline || [])
    .map((evt) => {
      const stageBadge = getStatusBadgeHtml(evt.statusBadge || c.currentStatus);
      return `
        <div class="timeline-event-item">
          <div class="timeline-node-dot"></div>
          <div class="timeline-event-header">
            <span class="timeline-event-title">${escapeHtml(evt.title)}</span>
            <span class="timeline-event-date">${escapeHtml(evt.displayDate || evt.date)}</span>
          </div>
          <div class="timeline-event-authority">
            ${escapeHtml(evt.handlingAuthority)} &bull; ${escapeHtml(evt.actor || "Authorized Official")}
          </div>
          <div class="timeline-event-desc">
            ${escapeHtml(evt.description)}
          </div>
        </div>
      `;
    })
    .join("");

  // Status history audit rows
  const statusHistoryRows = (c.statusHistory || [])
    .map((sh) => `
      <tr>
        <td><strong>${escapeHtml(sh.fromStatus)} &rarr; ${escapeHtml(sh.toStatus)}</strong></td>
        <td>${escapeHtml(sh.changedDate)}</td>
        <td>${escapeHtml(sh.changedBy)}</td>
        <td>${escapeHtml(sh.authorityOrder || "Standard Circular")}</td>
      </tr>
    `)
    .join("");

  // Document references list
  const docsHtml = (c.documents && c.documents.length > 0)
    ? c.documents
        .map((doc) => `
        <div class="document-item">
          <div class="document-info-left">
            <div class="doc-icon-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div class="doc-text-wrap">
              <span class="doc-title">${escapeHtml(doc.title)}</span>
              <span class="doc-meta">${escapeHtml(doc.type)} &bull; ${escapeHtml(doc.size)} &bull; Uploaded ${escapeHtml(doc.uploadedDate)} &bull; ${escapeHtml(doc.accessLevel)}</span>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-view-doc" 
            onclick="showToast('Accessing authorized document: ${escapeHtml(doc.title)}')"
          >
            Download / View
          </button>
        </div>
      `)
        .join("")
    : `<div class="cell-not-available" style="padding: 10px 0;">No attached external documents recorded for this case.</div>`;

  // Related cases section
  const relatedCasesHtml = (c.relatedCaseIds && c.relatedCaseIds.length > 0)
    ? `
      <div class="related-cases-box">
        <div class="related-cases-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Linked &amp; Cross-Referenced Cases
        </div>
        <p style="font-size: 0.8125rem; color: #1e3a8a; margin-bottom: 8px;">
          This case has verified cross-Bureau correlations or overlap alerts logged in the central governance register.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${c.relatedCaseIds
            .map(
              (rcId) => `
            <a 
              href="#case?id=${encodeURIComponent(rcId)}" 
              class="related-case-link-pill" 
              onclick="event.preventDefault(); showCaseDetail('${escapeHtml(rcId)}');"
            >
              <span>${escapeHtml(rcId)}</span>
              <span>&rarr;</span>
            </a>
          `
            )
            .join("")}
        </div>
      </div>
    `
    : "";

  container.innerHTML = `
    <!-- Top Case Profile Hero Card -->
    <div class="detail-case-hero-card">
      <div class="hero-case-header">
        <div class="hero-case-id-group">
          <span class="hero-case-id">${escapeHtml(c.caseId)}</span>
          <span class="hero-complaint-ref">Ref: ${escapeHtml(c.complaintRef || "Not Available")}</span>
        </div>
        <div class="hero-badges-group">
          ${bureauBadgeHtml}
          ${statusBadgeHtml}
          <span class="badge-status" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #334155;">
            Priority: <strong>${escapeHtml(c.priority || "Normal")}</strong>
          </span>
        </div>
      </div>

      <!-- Complaint Subject -->
      <div class="hero-case-subject">
        ${escapeHtml(c.subject || "No formal subject description recorded.")}
      </div>

      <!-- Associated Institution Mini Banner -->
      <div class="associated-institution-banner">
        <div class="inst-banner-info">
          <div class="inst-banner-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-5-7L2 7v2h19V7l-10-4z"/>
            </svg>
          </div>
          <div class="inst-banner-text">
            <span class="inst-banner-name">${escapeHtml(c.institutionName)}</span>
            <div class="inst-banner-meta">
              <span>Inst ID: <strong>${escapeHtml(c.institutionId)}</strong></span>
              <span>&bull;</span>
              <span>AICTE ID: <strong>${escapeHtml(c.aicteId || "N/A")}</strong></span>
              <span>&bull;</span>
              <span>${escapeHtml(c.location || "N/A")}</span>
              <span>&bull;</span>
              <span>${escapeHtml(c.institutionType || "Technical")}</span>
            </div>
          </div>
        </div>

        <a 
          href="regional-institutions.html#detail?id=${encodeURIComponent(c.institutionId)}" 
          class="inst-banner-link"
          title="Open complete institution profile in Regional Institutions directory"
        >
          <span>View Institution Profile</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- 4-Column Metadata Grid -->
    <div class="detail-metadata-grid">
      <div class="metadata-card">
        <span class="metadata-label">Handling Authority</span>
        <span class="metadata-value">${escapeHtml(c.currentBureau)}</span>
        <span class="metadata-sub">Assigned Bureau / Cell</span>
      </div>

      <div class="metadata-card">
        <span class="metadata-label">Assigned Officer</span>
        <span class="metadata-value">${escapeHtml(officerName)}</span>
        <span class="metadata-sub">${escapeHtml(officerDesig)}</span>
      </div>

      <div class="metadata-card">
        <span class="metadata-label">Key Dates</span>
        <span class="metadata-value">Filed: ${escapeHtml(formatDateDisplay(c.createdDate))}</span>
        <span class="metadata-sub">Updated: ${escapeHtml(formatDateDisplay(c.lastUpdated))} &bull; Expected: ${escapeHtml(resolutionDate)}</span>
      </div>

      <div class="metadata-card">
        <span class="metadata-label">Complaint Source</span>
        <span class="metadata-value">${escapeHtml(c.source || "Direct Filing")}</span>
        <span class="metadata-sub">${escapeHtml(c.jurisdictionScope || "Statutory Regulation")}</span>
      </div>
    </div>

    <!-- Split View: Timeline (Left) & Audit / Docs (Right) -->
    <div class="detail-content-split">
      <!-- Left: Recorded Case Movement Timeline -->
      <div class="detail-panel-card">
        <div class="detail-panel-header">
          <div class="detail-panel-title-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3 class="detail-panel-title">Case Movement Timeline</h3>
          </div>
          <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
            ${c.movementTimeline ? c.movementTimeline.length : 0} Chronological Milestones
          </span>
        </div>

        <div class="detail-panel-body">
          <div class="timeline-container">
            <div class="timeline-track-line"></div>
            ${timelineEntriesHtml}
          </div>
        </div>
      </div>

      <!-- Right: Authorized Status Changes & Documents -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Status Change History Card -->
        <div class="detail-panel-card">
          <div class="detail-panel-header">
            <div class="detail-panel-title-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <h3 class="detail-panel-title">Status Transition Audit Log</h3>
            </div>
          </div>
          <div class="detail-panel-body" style="padding: 0;">
            <div class="table-responsive">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Transition</th>
                    <th>Date / Time</th>
                    <th>Changed By</th>
                    <th>Authority Order</th>
                  </tr>
                </thead>
                <tbody>
                  ${statusHistoryRows || '<tr><td colspan="4" class="cell-not-available" style="padding: 12px;">No historical status transitions recorded. Initial state active.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Official Document References Card -->
        <div class="detail-panel-card">
          <div class="detail-panel-header">
            <div class="detail-panel-title-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <h3 class="detail-panel-title">Authorized Document References</h3>
            </div>
          </div>
          <div class="detail-panel-body">
            <div class="document-list">
              ${docsHtml}
            </div>
          </div>
        </div>

        <!-- Related Cases & Overlaps Card (if any) -->
        ${relatedCasesHtml}

        <!-- Jurisdictional Guard Notice -->
        <div class="jurisdiction-guard-banner">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div>
            <strong>AICTE Governance Role Guard:</strong> Regional Officers may inspect records, review movement history, and request priority Bureau follow-up. Case reassignment, legal determinations, and formal closure remain restricted to authorized Bureau Heads and Grievance Ombudsmen.
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders error in case detail view
 */
function renderCaseDetailError(errorTitle, errorDesc) {
  const container = document.getElementById("caseDetailContentArea");
  if (!container) return;

  container.innerHTML = `
    <div class="unauthorized-state-box" style="border: 1px solid var(--border-color); border-radius: var(--radius-md);">
      <div class="unauthorized-state-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <h3 class="unauthorized-state-title">${escapeHtml(errorTitle || "Record Unavailable")}</h3>
      <p class="unauthorized-state-desc">${escapeHtml(errorDesc || "Could not retrieve the requested regional case.")}</p>
      <button class="empty-state-btn" onclick="showCaseList()">
        &larr; Return to Case Tracking List
      </button>
    </div>
  `;
}

/**
 * Follow-up Inquiry Modal Controllers
 */
window.openFollowUpModal = function () {
  const modal = document.getElementById("followUpModal");
  const caseIdSpan = document.getElementById("modalCaseIdSpan");
  if (modal) {
    if (caseIdSpan && STATE.selectedCaseId) {
      caseIdSpan.textContent = STATE.selectedCaseId;
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
};

window.closeFollowUpModal = function () {
  const modal = document.getElementById("followUpModal");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
};

window.submitFollowUpInquiry = async function () {
  const subjectInput = document.getElementById("followUpSubject");
  const remarksInput = document.getElementById("followUpRemarks");

  const subject = subjectInput ? subjectInput.value.trim() : "";
  const remarks = remarksInput ? remarksInput.value.trim() : "";

  if (!subject) {
    showToast("Please enter an inquiry subject before submitting.");
    if (subjectInput) subjectInput.focus();
    return;
  }

  if (!STATE.selectedCaseId) return;

  const response = await window.RegionalCaseTrackingAPI.submitFollowUpRequest(STATE.selectedCaseId, {
    subject,
    remarks
  });

  if (response.success) {
    closeFollowUpModal();
    if (subjectInput) subjectInput.value = "";
    if (remarksInput) remarksInput.value = "";
    showToast("Official follow-up inquiry submitted to handling Bureau.");
    // Re-render detail view with updated timeline
    showCaseDetail(STATE.selectedCaseId, false);
  } else {
    showToast("Failed to submit follow-up inquiry: " + response.message);
  }
};

/**
 * Switching back to North Region if user clicked an unauthorized region
 */
window.switchToAuthorizedRegion = function () {
  STATE.currentRegion = "North Region";
  const regionLabel = document.getElementById("currentRegionLabel");
  if (regionLabel) regionLabel.textContent = "North Region";

  const dropdownItems = document.querySelectorAll(".region-dropdown-item");
  dropdownItems.forEach((item) => {
    if (item.dataset.region === "North Region") {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  renderCaseTrackingTable();
  showToast("Switched back to North Region (Authorized Jurisdiction)");
};

/**
 * Region Selector Dropdown Initialization
 */
function initRegionSelector() {
  const selectorBtn = document.getElementById("regionSelectorBtn");
  const dropdown = document.querySelector(".region-dropdown-menu");
  const dropdownItems = document.querySelectorAll(".region-dropdown-item");
  const regionLabel = document.getElementById("currentRegionLabel");

  if (!selectorBtn || !dropdown) return;

  selectorBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("show");
    dropdown.classList.toggle("show");
    selectorBtn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!selectorBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
      selectorBtn.setAttribute("aria-expanded", "false");
    }
  });

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selected = item.dataset.region;
      STATE.currentRegion = selected;
      if (regionLabel) regionLabel.textContent = selected;

      dropdownItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      dropdown.classList.remove("show");
      selectorBtn.setAttribute("aria-expanded", "false");

      // Reset to page 1 and render
      STATE.filters.page = 1;
      renderCaseTrackingTable();
    });
  });
}

/**
 * Global Header Search
 */
function initGlobalHeaderSearch() {
  const globalInput = document.getElementById("globalSearchInput");
  const caseSearchInput = document.getElementById("caseSearchInput");

  if (!globalInput) return;

  globalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = globalInput.value.trim();
      if (caseSearchInput) {
        caseSearchInput.value = q;
        STATE.filters.query = q;
        STATE.filters.page = 1;
        if (STATE.activeView === "detail") {
          showCaseList(true);
        } else {
          renderCaseTrackingTable();
        }
      }
    }
  });
}

/**
 * Sidebar Navigation & Collapse Controller
 */
function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const sidebar = document.getElementById("appSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (!sidebar) return;

  const isMobile = () => window.innerWidth <= 1024;

  const isSidebarOpen = () => {
    if (isMobile()) {
      return document.body.classList.contains("sidebar-open") || sidebar.classList.contains("mobile-open");
    } else {
      return !document.body.classList.contains("sidebar-collapsed") && !document.documentElement.classList.contains("sidebar-init-collapsed");
    }
  };

  const updateAriaState = (isOpen) => {
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.setAttribute("aria-label", isOpen ? "Close navigation sidebar" : "Open navigation sidebar");
    }
  };

  const openSidebar = () => {
    document.documentElement.classList.remove("sidebar-init-collapsed");
    document.documentElement.classList.remove("sidebar-collapsed");
    document.body.classList.remove("sidebar-collapsed");

    if (isMobile()) {
      document.body.classList.add("sidebar-open");
      sidebar.classList.add("mobile-open");
      if (backdrop) backdrop.classList.add("open");
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "expanded");
    } catch (e) {}
    updateAriaState(true);
  };

  const closeSidebar = () => {
    document.documentElement.classList.remove("sidebar-init-collapsed");

    if (isMobile()) {
      document.body.classList.remove("sidebar-open");
      sidebar.classList.remove("mobile-open");
      if (backdrop) backdrop.classList.remove("open");
    } else {
      document.body.classList.add("sidebar-collapsed");
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "collapsed");
    } catch (e) {}
    updateAriaState(false);
  };

  const toggleSidebar = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSidebarOpen()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (backdrop) backdrop.addEventListener("click", closeSidebar);

  // Restore saved state
  try {
    const savedState = sessionStorage.getItem("eduvision_sidebar_state");
    if (savedState === "collapsed") {
      closeSidebar();
    } else if (savedState === "expanded") {
      openSidebar();
    }
  } catch (e) {}
}

/**
 * Helpers for Badges and Formatting
 */
function getStatusBadgeHtml(status) {
  const norm = (status || "").toLowerCase().replace(/\s+/g, "-");
  return `
    <span class="badge-status status-${norm}">
      <span class="badge-status-dot"></span>
      <span>${escapeHtml(status || "Unknown")}</span>
    </span>
  `;
}

function getBureauBadgeHtml(code, fullName) {
  let badgeClass = "badge-bureau-rb";
  if (code === "PGRC" || (fullName && fullName.includes("PGRC"))) {
    badgeClass = "badge-bureau-pgrc";
  } else if (code === "Specialized Cells" || (fullName && fullName.includes("Specialized"))) {
    badgeClass = "badge-bureau-sc";
  }
  return `<span class="badge-bureau ${badgeClass}" title="${escapeHtml(fullName || code)}">${escapeHtml(code || "RB")}</span>`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "Not Available";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Toast Notification System
 */
window.showToast = function (message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.style.cssText = `
    background: #0f172a;
    color: #ffffff;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.2s ease;
  `;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};
