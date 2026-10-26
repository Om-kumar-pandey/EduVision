/**
 * ============================================================================
 * EDUVISION — REGIONAL INSTITUTIONS CONTROLLER
 * AICTE Integrated Institution Complaint Monitoring and Status Dashboard
 * ============================================================================
 * Handles reactive directory table filtering, search, dynamic summary cards,
 * institution detail view routing, and overlap alert presentations.
 * ============================================================================
 */

// State Management
const STATE = {
  activeView: "list", // 'list' | 'detail'
  selectedInstitutionId: null,
  filters: {
    query: "",
    type: "All",
    status: "All",
    bureau: "All",
    overlap: "All"
  }
};

// Initialization on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initSummaryCards();
  initFilterControls();
  initSidebarToggle();
  initRegionSelector();
  initGlobalHeaderSearch();
  initRoutingFromHash();

  // Listen to hash changes for deep linking (e.g. #detail?id=INST-NR-001)
  window.addEventListener("hashchange", initRoutingFromHash);
});

/**
 * Calculates and updates the 4 Summary Cards on the Regional Institutions page.
 * Uses exact dynamic computation from REGIONAL_INSTITUTIONS_DATA.
 */
function initSummaryCards() {
  const summary = calculateRegionalSummary(REGIONAL_INSTITUTIONS_DATA);

  const totalEl = document.getElementById("summaryTotalInstitutions");
  const pendingEl = document.getElementById("summaryPendingInstitutions");
  const overdueEl = document.getElementById("summaryOverdueInstitutions");
  const overlapEl = document.getElementById("summaryOverlapInstitutions");

  if (totalEl) totalEl.textContent = summary.totalInstitutions;
  if (pendingEl) pendingEl.textContent = summary.pendingInstitutions;
  if (overdueEl) overdueEl.textContent = summary.overdueInstitutions;
  if (overlapEl) overlapEl.textContent = summary.overlapInstitutions;
}

/**
 * Routing logic based on URL hash (e.g. #detail?id=INST-NR-001 or #list)
 */
function initRoutingFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith("#detail")) {
    const params = new URLSearchParams(hash.replace("#detail?", ""));
    const instId = params.get("id");
    if (instId) {
      showInstitutionDetail(instId, false);
      return;
    }
  }
  showInstitutionsList(false);
}

/**
 * Filter controls and search listeners
 */
function initFilterControls() {
  const searchInput = document.getElementById("instSearchInput");
  const typeSelect = document.getElementById("filterTypeSelect");
  const statusSelect = document.getElementById("filterStatusSelect");
  const bureauSelect = document.getElementById("filterBureauSelect");
  const overlapSelect = document.getElementById("filterOverlapSelect");
  const clearBtn = document.getElementById("btnClearFilters");

  function onFilterChange() {
    STATE.filters.query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    STATE.filters.type = typeSelect ? typeSelect.value : "All";
    STATE.filters.status = statusSelect ? statusSelect.value : "All";
    STATE.filters.bureau = bureauSelect ? bureauSelect.value : "All";
    STATE.filters.overlap = overlapSelect ? overlapSelect.value : "All";

    renderInstitutionsTable();
  }

  if (searchInput) searchInput.addEventListener("input", onFilterChange);
  if (typeSelect) typeSelect.addEventListener("change", onFilterChange);
  if (statusSelect) statusSelect.addEventListener("change", onFilterChange);
  if (bureauSelect) bureauSelect.addEventListener("change", onFilterChange);
  if (overlapSelect) overlapSelect.addEventListener("change", onFilterChange);

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetAllFilters();
    });
  }

  // Initial render
  renderInstitutionsTable();
}

/**
 * Resets all search and filter dropdowns to initial state
 */
window.resetAllFilters = function() {
  const searchInput = document.getElementById("instSearchInput");
  const globalSearchInput = document.getElementById("globalSearchInput");
  const typeSelect = document.getElementById("filterTypeSelect");
  const statusSelect = document.getElementById("filterStatusSelect");
  const bureauSelect = document.getElementById("filterBureauSelect");
  const overlapSelect = document.getElementById("filterOverlapSelect");

  if (searchInput) searchInput.value = "";
  if (globalSearchInput) globalSearchInput.value = "";
  if (typeSelect) typeSelect.value = "All";
  if (statusSelect) statusSelect.value = "All";
  if (bureauSelect) bureauSelect.value = "All";
  if (overlapSelect) overlapSelect.value = "All";

  STATE.filters = {
    query: "",
    type: "All",
    status: "All",
    bureau: "All",
    overlap: "All"
  };

  renderInstitutionsTable();
  showToast("All filters cleared. Displaying all institutions.");
};

/**
 * Filters the mock dataset according to active filter criteria
 */
function getFilteredInstitutions() {
  const { query, type, status, bureau, overlap } = STATE.filters;

  return REGIONAL_INSTITUTIONS_DATA.filter((inst) => {
    // 1. Search Query (Name, Institution ID, AICTE ID, AISHE Code, District)
    if (query) {
      const q = query.toLowerCase();
      const matchesName = inst.name.toLowerCase().includes(q);
      const matchesId = inst.institutionId.toLowerCase().includes(q);
      const matchesAicte = inst.aicteId.toLowerCase().includes(q);
      const matchesAishe = (inst.aisheCode || "").toLowerCase().includes(q);
      const matchesDistrict = (inst.district || "").toLowerCase().includes(q);
      const matchesState = (inst.state || "").toLowerCase().includes(q);

      if (!matchesName && !matchesId && !matchesAicte && !matchesAishe && !matchesDistrict && !matchesState) {
        return false;
      }
    }

    // 2. Institution Type Filter
    if (type !== "All") {
      if (inst.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }
    }

    // 3. Complaint Status Filter
    if (status !== "All") {
      const hasPending = inst.associatedCases.some((c) => c.status === "Pending");
      const hasOverdue = inst.associatedCases.some((c) => c.status === "Overdue");
      const allResolved = inst.associatedCases.length > 0 && inst.associatedCases.every((c) => c.status === "Resolved");

      if (status === "Pending" && !hasPending) return false;
      if (status === "Overdue" && !hasOverdue) return false;
      if (status === "Resolved" && !allResolved) return false;
    }

    // 4. Bureau / Cell Filter
    if (bureau !== "All") {
      const matchesBureau = inst.associatedCases.some((c) => {
        if (bureau === "RB") return c.bureauCode === "RB";
        if (bureau === "PGRC") return c.bureauCode === "PGRC";
        if (bureau === "Specialized Cells") return c.bureauCode === "Specialized Cells";
        return false;
      });
      if (!matchesBureau) return false;
    }

    // 5. Overlap Status Filter
    if (overlap !== "All") {
      const hasOverlap = inst.overlapAlert !== null;
      if (overlap === "Flagged" && !hasOverlap) return false;
      if (overlap === "Clean" && hasOverlap) return false;
    }

    return true;
  });
}

/**
 * Renders the table of filtered institutions or displays the empty state
 */
function renderInstitutionsTable() {
  const tbody = document.getElementById("regionalInstitutionsTableBody");
  const countEl = document.getElementById("filteredCountLabel");
  const activeChipsContainer = document.getElementById("activeFilterChips");

  if (!tbody) return;

  const filtered = getFilteredInstitutions();

  // Update count badge
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${REGIONAL_INSTITUTIONS_DATA.length} institutions`;
  }

  // Render active filter chips
  if (activeChipsContainer) {
    renderFilterChips(activeChipsContainer);
  }

  // Handle empty state
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="padding: 0; border: none;">
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 class="empty-state-title">No Institutions Found</h3>
            <p class="empty-state-desc">
              No regional institutions match the selected filter criteria or search query.
              Try adjusting the filters or clearing search terms.
            </p>
            <button class="empty-state-btn" onclick="resetAllFilters()">
              Clear All Filters
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Render rows
  tbody.innerHTML = filtered.map((inst) => {
    // Compute case metrics for this institution
    const totalCases = inst.associatedCases.length;
    const pendingCases = inst.associatedCases.filter((c) => c.status === "Pending").length;
    const overdueCases = inst.associatedCases.filter((c) => c.status === "Overdue").length;

    // Bureau summary badges
    const bureausSet = new Set(inst.associatedCases.map((c) => c.bureauCode));
    let bureauBadgesHtml = "";
    if (bureausSet.has("RB")) bureauBadgesHtml += `<span class="bureau-badge rb" title="Regulation Bureau">RB</span>`;
    if (bureausSet.has("PGRC")) bureauBadgesHtml += `<span class="bureau-badge pgrc" title="Public Grievance Redressal Cell">PGRC</span>`;
    if (bureausSet.has("Specialized Cells")) bureauBadgesHtml += `<span class="bureau-badge cells" title="Specialized Cells">Cells</span>`;
    if (bureausSet.size === 0) bureauBadgesHtml = `<span class="bureau-badge none">None</span>`;

    // Overlap badge
    const overlapBadgeHtml = inst.overlapAlert
      ? `<span class="overlap-indicator-badge flagged" title="${escapeHtml(inst.overlapAlert.matchReason)}">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
          Overlap Alert
        </span>`
      : `<span class="overlap-indicator-badge clean">None</span>`;

    return `
      <tr>
        <td class="inst-id-cell">${escapeHtml(inst.institutionId)}</td>
        <td>
          <div class="inst-name-cell">
            <span class="inst-name-title">${escapeHtml(inst.name)}</span>
            <span class="inst-meta-subtitle">
              <span>AICTE: ${escapeHtml(inst.aicteId)}</span>
              <span class="inst-meta-dot">&bull;</span>
              <span>AISHE: ${escapeHtml(inst.aisheCode || "N/A")}</span>
            </span>
          </div>
        </td>
        <td>
          <span class="inst-type-badge">${escapeHtml(inst.type)}</span>
        </td>
        <td>
          <div class="inst-location-cell">
            ${escapeHtml(inst.location)}
          </div>
        </td>
        <td class="cell-num-bold">${totalCases}</td>
        <td>
          <span class="cell-pending-count ${pendingCases > 0 ? 'active' : 'zero'}">
            ${pendingCases}
          </span>
        </td>
        <td>
          <span class="${overdueCases > 0 ? 'cell-urgent-red' : 'cell-muted'}">
            ${overdueCases}
          </span>
        </td>
        <td>
          <div class="inst-bureau-badges">
            ${bureauBadgesHtml}
          </div>
        </td>
        <td>
          ${overlapBadgeHtml}
        </td>
        <td>
          <button 
            class="btn-table-details" 
            onclick="viewInstitutionDetail('${inst.institutionId}')"
            aria-label="View details for ${escapeHtml(inst.name)}"
          >
            <span>View Details</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * Render active filter chips
 */
function renderFilterChips(container) {
  const chips = [];

  if (STATE.filters.query) {
    chips.push({ label: `Search: "${STATE.filters.query}"`, key: "query" });
  }
  if (STATE.filters.type !== "All") {
    chips.push({ label: `Type: ${STATE.filters.type}`, key: "type" });
  }
  if (STATE.filters.status !== "All") {
    chips.push({ label: `Status: ${STATE.filters.status}`, key: "status" });
  }
  if (STATE.filters.bureau !== "All") {
    chips.push({ label: `Bureau: ${STATE.filters.bureau}`, key: "bureau" });
  }
  if (STATE.filters.overlap !== "All") {
    chips.push({ label: `Overlap: ${STATE.filters.overlap}`, key: "overlap" });
  }

  if (chips.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = chips.map((c) => `
    <span class="filter-chip">
      <span>${escapeHtml(c.label)}</span>
      <span class="filter-chip-remove" onclick="removeSingleFilter('${c.key}')" title="Remove filter">&times;</span>
    </span>
  `).join("");
}

/**
 * Removes a single filter from the filter chips
 */
window.removeSingleFilter = function(filterKey) {
  if (filterKey === "query") {
    const el = document.getElementById("instSearchInput");
    const gl = document.getElementById("globalSearchInput");
    if (el) el.value = "";
    if (gl) gl.value = "";
    STATE.filters.query = "";
  } else if (filterKey === "type") {
    const el = document.getElementById("filterTypeSelect");
    if (el) el.value = "All";
    STATE.filters.type = "All";
  } else if (filterKey === "status") {
    const el = document.getElementById("filterStatusSelect");
    if (el) el.value = "All";
    STATE.filters.status = "All";
  } else if (filterKey === "bureau") {
    const el = document.getElementById("filterBureauSelect");
    if (el) el.value = "All";
    STATE.filters.bureau = "All";
  } else if (filterKey === "overlap") {
    const el = document.getElementById("filterOverlapSelect");
    if (el) el.value = "All";
    STATE.filters.overlap = "All";
  }

  renderInstitutionsTable();
};

/**
 * Navigation to Institution Detail View
 */
window.viewInstitutionDetail = function(instId) {
  window.location.hash = `#detail?id=${encodeURIComponent(instId)}`;
};

/**
 * Navigation back to Institutions Directory list
 */
window.backToInstitutionsList = function() {
  window.location.hash = "#list";
};

/**
 * Activates and renders the Institution Detail View
 */
function showInstitutionDetail(instId, updateHash = true) {
  const inst = REGIONAL_INSTITUTIONS_DATA.find((item) => item.institutionId === instId);
  if (!inst) {
    showToast("Institution not found. Returning to directory.");
    showInstitutionsList();
    return;
  }

  STATE.activeView = "detail";
  STATE.selectedInstitutionId = instId;

  if (updateHash) {
    window.location.hash = `#detail?id=${encodeURIComponent(instId)}`;
  }

  const listView = document.getElementById("institutionsListView");
  const detailView = document.getElementById("institutionDetailView");

  if (listView) listView.style.display = "none";
  if (detailView) {
    detailView.style.display = "block";
    renderDetailContent(inst);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Restores and displays the Institutions Directory list
 */
function showInstitutionsList(updateHash = true) {
  STATE.activeView = "list";
  STATE.selectedInstitutionId = null;

  if (updateHash) {
    window.location.hash = "#list";
  }

  const listView = document.getElementById("institutionsListView");
  const detailView = document.getElementById("institutionDetailView");

  if (detailView) detailView.style.display = "none";
  if (listView) {
    listView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Renders the entire content of Institution Detail View
 */
function renderDetailContent(inst) {
  // Case counts
  const total = inst.associatedCases.length;
  const pending = inst.associatedCases.filter((c) => c.status === "Pending").length;
  const inProgress = inst.associatedCases.filter((c) => c.status === "In Progress").length;
  const resolved = inst.associatedCases.filter((c) => c.status === "Resolved").length;
  const overdue = inst.associatedCases.filter((c) => c.status === "Overdue").length;

  // A. Profile Section
  const profileContainer = document.getElementById("detailProfileSection");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="detail-profile-header-row">
        <div class="detail-profile-name-group">
          <span class="detail-institution-id-pill">${escapeHtml(inst.institutionId)}</span>
          <h2 class="detail-institution-name">${escapeHtml(inst.name)}</h2>
          <span class="detail-institution-tagline">
            Affiliated with ${escapeHtml(inst.affiliatedUniversity || "Recognized Board")} &bull; Est. ${inst.establishedYear || "N/A"}
          </span>
        </div>
        <div class="page-header-badges">
          <span class="badge-region-jurisdiction">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
            ${escapeHtml(inst.region)}
          </span>
          <span class="inst-type-badge detail-badge">${escapeHtml(inst.type)}</span>
        </div>
      </div>

      <div class="detail-metadata-grid">
        <div class="metadata-item">
          <span class="metadata-label">Institution ID</span>
          <span class="metadata-value code">${escapeHtml(inst.institutionId)}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">AICTE / Portal ID</span>
          <span class="metadata-value code">${escapeHtml(inst.aicteId)}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">AISHE Code</span>
          <span class="metadata-value code">${escapeHtml(inst.aisheCode || "N/A")}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Institution Type</span>
          <span class="metadata-value">${escapeHtml(inst.type)}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Location / State</span>
          <span class="metadata-value">${escapeHtml(inst.location)}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Regional Office</span>
          <span class="metadata-value">${escapeHtml(inst.region)}</span>
        </div>
      </div>
    `;
  }

  // B. Institution Case Summary (5 Metrics)
  const metricsContainer = document.getElementById("detailMetricsSection");
  if (metricsContainer) {
    metricsContainer.innerHTML = `
      <div class="detail-metric-card total">
        <span class="detail-metric-label">Total Cases</span>
        <span class="detail-metric-number">${total}</span>
      </div>
      <div class="detail-metric-card pending">
        <span class="detail-metric-label">Pending</span>
        <span class="detail-metric-number pending">${pending}</span>
      </div>
      <div class="detail-metric-card in-progress">
        <span class="detail-metric-label">In Progress</span>
        <span class="detail-metric-number in-progress">${inProgress}</span>
      </div>
      <div class="detail-metric-card resolved">
        <span class="detail-metric-label">Resolved</span>
        <span class="detail-metric-number resolved">${resolved}</span>
      </div>
      <div class="detail-metric-card overdue">
        <span class="detail-metric-label">Overdue</span>
        <span class="detail-metric-number overdue">${overdue}</span>
      </div>
    `;
  }

  // C. Associated Cases Table
  const casesTbody = document.getElementById("detailCasesTableBody");
  const casesCountEl = document.getElementById("detailCasesCount");
  if (casesCountEl) casesCountEl.textContent = `${inst.associatedCases.length} Cases`;

  if (casesTbody) {
    if (inst.associatedCases.length === 0) {
      casesTbody.innerHTML = `<tr><td colspan="7" class="empty-cases-cell">No associated cases found for this institution.</td></tr>`;
    } else {
      casesTbody.innerHTML = inst.associatedCases.map((c) => {
        const isOverdue = c.status === "Overdue";
        return `
          <tr>
            <td class="cell-code">${escapeHtml(c.caseId)}</td>
            <td class="cell-bold">${escapeHtml(c.category)}</td>
            <td>
              <span class="bureau-badge ${c.bureauCode === 'RB' ? 'rb' : c.bureauCode === 'PGRC' ? 'pgrc' : 'cells'}">
                ${escapeHtml(c.bureauCell)}
              </span>
            </td>
            <td>
              <span class="status-badge ${c.statusClass}">
                ${escapeHtml(c.status)}
              </span>
            </td>
            <td class="cell-muted">${escapeHtml(c.assignedOfficerLabel || "Pending Assignment")}</td>
            <td>
              <span class="${isOverdue ? 'cell-urgent-red' : 'cell-muted'}">
                ${escapeHtml(c.dueDate)}
                ${isOverdue ? '<span class="overdue-tag">(Overdue)</span>' : ''}
              </span>
            </td>
            <td>
              <a 
                href="regional-case-tracking.html#case?id=${encodeURIComponent(c.caseId)}" 
                class="btn-action-outline" 
                title="View in Regional Case Tracking module"
              >
                Track Case &rarr;
              </a>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // D. Potential Overlap Summary
  const overlapContainer = document.getElementById("detailOverlapSection");
  if (overlapContainer) {
    if (inst.overlapAlert) {
      const alert = inst.overlapAlert;
      overlapContainer.innerHTML = `
        <div class="overlap-flagged-box">
          <div class="overlap-flagged-header">
            <div class="overlap-flagged-title">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <span>Potential Overlap Alert Flagged &mdash; ${escapeHtml(alert.alertId)}</span>
            </div>
            <span class="overlap-status-pill">${escapeHtml(alert.reviewStatus)}</span>
          </div>

          <p class="overlap-notice-text">
            The monitoring platform flagged concurrent proceedings regarding this institution.
            Under standard governance guidelines, complaints are not automatically merged. Human verification and cross-bureau coordination are required.
          </p>

          <div class="overlap-cases-comparison">
            ${alert.relatedCaseIds.map((cId, idx) => {
              const matchedCase = inst.associatedCases.find((c) => c.caseId === cId);
              return `
                <div class="overlap-comparison-card">
                  <div class="overlap-card-top-row">
                    <span class="overlap-comparison-case-id">${escapeHtml(cId)}</span>
                    <span class="bureau-badge ${matchedCase && matchedCase.bureauCode === 'RB' ? 'rb' : 'pgrc'}">
                      ${matchedCase ? escapeHtml(matchedCase.bureauCode) : 'Bureau'}
                    </span>
                  </div>
                  <span class="overlap-comparison-bureau">${matchedCase ? escapeHtml(matchedCase.bureauCell) : ''}</span>
                  <p class="overlap-comparison-subject">${matchedCase ? escapeHtml(matchedCase.subject) : 'Associated case filing'}</p>
                </div>
              `;
            }).join("")}
          </div>

          <div class="overlap-explanation-callout">
            <strong>Coordination Reason:</strong> ${escapeHtml(alert.matchReason)}
          </div>

          <div class="overlap-action-row">
            <span class="overlap-action-note">
              Non-AI Governance Demonstration: Case relationship flagged for administrative review.
            </span>
            <a 
              href="regional-office-dashboard.html#overlapAlertSection" 
              class="btn-detail-secondary-link"
              title="Navigate to dedicated Overlap Alerts dashboard module"
            >
              Open Overlap Alerts Module &rarr;
            </a>
          </div>
        </div>
      `;
    } else {
      overlapContainer.innerHTML = `
        <div class="overlap-clean-box">
          <div class="overlap-clean-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="overlap-clean-text">
            <span class="overlap-clean-title">No Overlap Detected</span>
            <span class="overlap-clean-desc">
              All active complaints for this institution have distinct subject matter scopes and independent handling jurisdictions.
            </span>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Synchronize top global search with institution filter
 */
function initGlobalHeaderSearch() {
  const globalInput = document.getElementById("globalSearchInput");
  const localInput = document.getElementById("instSearchInput");

  if (!globalInput) return;

  globalInput.addEventListener("input", (e) => {
    const val = e.target.value;
    if (localInput) localInput.value = val;
    STATE.filters.query = val.trim().toLowerCase();

    // If on detail view, switch back to list view to show search matches
    if (STATE.activeView === "detail" && val.trim().length > 0) {
      showInstitutionsList();
    } else {
      renderInstitutionsTable();
    }
  });
}

/**
 * Sidebar Navigation & Collapse Controller
 */
function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const closeBtn = document.getElementById("sidebarCloseBtn");
  const sidebar = document.getElementById("appSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const navItems = document.querySelectorAll(".sidebar .nav-item");

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
      toggleBtn.setAttribute("title", isOpen ? "Close navigation sidebar (Esc)" : "Open navigation sidebar (Alt+S)");
    }
  };

  const openSidebar = () => {
    // Ensure early preload and collapsed classes are completely removed from root and body
    document.documentElement.classList.remove("sidebar-init-collapsed");
    document.documentElement.classList.remove("sidebar-collapsed");
    document.body.classList.remove("sidebar-collapsed");

    if (isMobile()) {
      document.body.classList.add("sidebar-open");
      sidebar.classList.add("mobile-open");
      if (backdrop) {
        backdrop.classList.add("active");
        backdrop.classList.add("open");
      }
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "expanded");
    } catch (e) {}
    updateAriaState(true);
  };

  const closeSidebar = () => {
    // Clean up early preload class so transitions and subsequent toggles work smoothly
    document.documentElement.classList.remove("sidebar-init-collapsed");

    if (isMobile()) {
      document.body.classList.remove("sidebar-open");
      sidebar.classList.remove("mobile-open");
      if (backdrop) {
        backdrop.classList.remove("active");
        backdrop.classList.remove("open");
      }
    } else {
      document.body.classList.add("sidebar-collapsed");
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "collapsed");
    } catch (e) {}
    updateAriaState(false);
  };

  const toggleSidebar = () => {
    if (isSidebarOpen()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  // Toggle button event
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // Close button inside sidebar header (if present)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Backdrop click to close on mobile
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeSidebar();
    });
  }

  // Auto-collapse sidebar when clicking any navigation item
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");

      // Slide sidebar completely away on every navigation click
      closeSidebar();

      // Handle page or section routing
      if (href && href !== "#") {
        if (href.startsWith("#")) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else if (href === "regional-institutions.html" || href.endsWith("/regional-institutions.html")) {
          // Stay on regional institutions page: reset to list view and scroll up
          if (STATE.activeView === "detail") {
            e.preventDefault();
            showInstitutionsList(true);
          } else {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else if (!href.startsWith("javascript")) {
          // External dashboard page navigation
          e.preventDefault();
          setTimeout(() => {
            window.location.href = href;
          }, 180);
        }
      } else if (href === "#") {
        if (item.id === "navInstitutions") {
          e.preventDefault();
          if (STATE.activeView === "detail") {
            showInstitutionsList(true);
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }

      // Highlight selected nav item if not an action popup
      if (item.id !== "navNotifications" && item.id !== "navHelp") {
        navItems.forEach((el) => {
          el.classList.remove("active");
          el.removeAttribute("aria-current");
        });
        item.classList.add("active");
        item.setAttribute("aria-current", "page");
      }
    });
  });

  // Keyboard accessibility: Escape key closes sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSidebarOpen()) {
      closeSidebar();
    } else if (e.key === "s" && e.altKey) {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Handle window resizing cleanly to prevent stuck backdrop / states
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        if (backdrop) {
          backdrop.classList.remove("active");
          backdrop.classList.remove("open");
        }
        document.body.classList.remove("sidebar-open");
        sidebar.classList.remove("mobile-open");
      }
      updateAriaState(isSidebarOpen());
    }, 100);
  });

  // Ensure the early preload class is cleaned up once the script takes control
  if (document.documentElement.classList.contains("sidebar-init-collapsed")) {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("sidebar-init-collapsed");
    });
  }

  // Initialize from sessionStorage state if previously collapsed
  try {
    const savedState = sessionStorage.getItem("eduvision_sidebar_state");
    if (savedState === "collapsed") {
      closeSidebar();
    } else if ((savedState === "expanded" || savedState === "open") && !isMobile()) {
      openSidebar();
    } else {
      updateAriaState(isSidebarOpen());
    }
  } catch (err) {
    updateAriaState(isSidebarOpen());
  }
}

/**
 * Region selector dropdown
 */
function initRegionSelector() {
  const selector = document.getElementById("regionSelector");
  const btn = document.getElementById("regionSelectorBtn");
  const items = document.querySelectorAll(".region-dropdown-item");

  if (!selector || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    selector.classList.toggle("open");
  });

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const newRegion = item.getAttribute("data-region");
      const currentRegionLabel = document.getElementById("currentRegionLabel");

      if (currentRegionLabel) currentRegionLabel.textContent = newRegion;

      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      selector.classList.remove("open");
      showToast(`Switched active region to ${newRegion}`);
    });
  });

  document.addEventListener("click", () => {
    selector.classList.remove("open");
  });
}

/**
 * Non-intrusive Toast Notifications
 */
function showToast(message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="14" height="14" fill="#38bdf8" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

/**
 * HTML Escaping utility
 */
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
