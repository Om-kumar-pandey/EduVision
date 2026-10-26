/**
 * EDUVISION — REGIONAL OFFICER DASHBOARD
 * Core Frontend JavaScript Logic
 * Static demonstration data, reactive table filtering, chart rendering, and interactive modals.
 */

// --- STATIC DEMONSTRATION DATA ---
const DASHBOARD_DATA = {
  officer: {
    name: "Ananya Sharma",
    designation: "Regional Officer",
    region: "North Region",
    lastLogin: "24 Oct 2026, 10:42 AM"
  },
  
  summary: {
    totalInstitutions: 124,
    totalCases: 386,
    pendingCases: 142,
    overdueCases: 28
  },

  caseStatus: [
    { label: "Pending", count: 142, percentage: "36.8%", color: "#1d6bf3", class: "blue" },
    { label: "In Progress", count: 118, percentage: "30.6%", color: "#f59e0b", class: "orange" },
    { label: "Resolved", count: 98, percentage: "25.4%", color: "#10b981", class: "green" },
    { label: "Overdue", count: 28, percentage: "7.3%", color: "#ef4444", class: "red" }
  ],

  bureauDistribution: [
    { bureau: "Regulation Bureau (RB)", count: 168, color: "#1d6bf3" },
    { bureau: "PGRC", count: 132, color: "#f59e0b" },
    { bureau: "Other Cells", count: 86, color: "#10b981" }
  ],

  monitoringCases: [
    {
      caseId: "CASE-2026-0143",
      institutionName: "ABC Institute of Technology",
      aicteId: "1-563728",
      bureau: "RB",
      category: "Regulation",
      assignedOfficer: "RB-03",
      status: "Pending",
      statusClass: "pending",
      expectedDisposalDate: "28 Oct 2026",
      details: "Compliance verification regarding statutory infrastructure norms and faculty roster validation."
    },
    {
      caseId: "CASE-2026-0178",
      institutionName: "Global Institute of Engineering",
      aicteId: "1-672934",
      bureau: "PGRC",
      category: "Student Grievance",
      assignedOfficer: "PGRC-02",
      status: "In Progress",
      statusClass: "in-progress",
      expectedDisposalDate: "02 Nov 2026",
      details: "Grievance received regarding examination fee structure and student scholarship disbursement."
    },
    {
      caseId: "CASE-2026-0210",
      institutionName: "Sunrise College of Engineering",
      aicteId: "1-774582",
      bureau: "RB",
      category: "Academic",
      assignedOfficer: "RB-01",
      status: "Resolved",
      statusClass: "resolved",
      expectedDisposalDate: "18 Oct 2026",
      details: "Academic syllabus alignment and accreditation document submission completed satisfactorily."
    },
    {
      caseId: "CASE-2026-0247",
      institutionName: "Techno Institute of Management",
      aicteId: "1-886421",
      bureau: "PGRC",
      category: "Infrastructure",
      assignedOfficer: "PGRC-03",
      status: "Overdue",
      statusClass: "overdue",
      expectedDisposalDate: "20 Oct 2026",
      details: "Inspection report on laboratory equipment safety standards overdue by 6 days. Escalation flagged."
    },
    {
      caseId: "CASE-2026-0281",
      institutionName: "National College of Pharmacy",
      aicteId: "1-992145",
      bureau: "Other Cells",
      category: "Other",
      assignedOfficer: "OC-01",
      status: "Transferred",
      statusClass: "transferred",
      expectedDisposalDate: "30 Oct 2026",
      details: "Case transferred to Specialized Pharmacy Cell for cross-statutory jurisdiction review."
    }
  ],

  institutions: [
    {
      institutionName: "ABC Institute of Tech",
      aicteId: "1-563728",
      district: "Noida",
      totalCases: 42,
      pending: 16,
      overdue: 5,
      status: "Pending Cases"
    },
    {
      institutionName: "Global Institute",
      aicteId: "1-672934",
      district: "Ghaziabad",
      totalCases: 36,
      pending: 12,
      overdue: 3,
      status: "Pending Cases"
    },
    {
      institutionName: "Sunrise College",
      aicteId: "1-774582",
      district: "Lucknow",
      totalCases: 28,
      pending: 9,
      overdue: 2,
      status: "Pending Cases"
    },
    {
      institutionName: "Techno Institute",
      aicteId: "1-886421",
      district: "Delhi",
      totalCases: 24,
      pending: 7,
      overdue: 1,
      status: "Pending Cases"
    },
    {
      institutionName: "National College",
      aicteId: "1-992145",
      district: "Kanpur",
      totalCases: 18,
      pending: 6,
      overdue: 0,
      status: "Active"
    }
  ],

  recentActivities: [
    {
      type: "building",
      colorClass: "blue",
      title: "Institution profile updated",
      subtitle: "ABES Engineering College",
      time: "2 hours ago"
    },
    {
      type: "sync",
      colorClass: "cyan",
      title: "Case status changed",
      subtitle: "CASE-2026-0143 → In Progress",
      time: "3 hours ago"
    },
    {
      type: "alert",
      colorClass: "red",
      title: "Overlap alert raised",
      subtitle: "ABC Institute of Technology",
      time: "4 hours ago"
    },
    {
      type: "user",
      colorClass: "teal",
      title: "Bureau assignment updated",
      subtitle: "CASE-2026-0078 → RB",
      time: "5 hours ago"
    },
    {
      type: "report",
      colorClass: "indigo",
      title: "Regional report generated",
      subtitle: "North Region - Monthly Report",
      time: "6 hours ago"
    }
  ],

  overlappingCaseDemo: {
    institution: "ABC Institute of Technology",
    instId: "INST-001",
    region: "North Region",
    case1: { id: "CASE-2026-001", bureau: "Regulation Bureau (RB)", category: "Affiliation Compliance", officer: "RB-03" },
    case2: { id: "CASE-2026-014", bureau: "Public Grievance Redressal Cell (PGRC)", category: "Faculty Representation", officer: "PGRC-02" },
    alertDate: "22 Oct 2026",
    status: "In Review"
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initDoughnutChart();
  initBarChart();
  initMonitoringTable();
  initInstitutionsTable();
  initFilterControls();
  initSidebarToggle();
  initRegionSelector();
  initGlobalSearch();
  initModals();
  initQuickActions();
});

// --- DOUGHNUT CHART RENDERING (WITH EXACT INNER PERCENTAGES MATCHING REFERENCE) ---
function initDoughnutChart() {
  const svg = document.getElementById("caseStatusDoughnut");
  if (!svg) return;

  const total = DASHBOARD_DATA.summary.totalCases; // 386
  const radius = 45;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~282.74
  
  let accumulatedOffset = 0;
  let currentStartFraction = 0;
  
  // Clear any existing content
  svg.innerHTML = "";

  // Slices layer
  const slicesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  slicesGroup.setAttribute("transform", "rotate(-90 60 60)");

  // Labels layer
  const labelsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  DASHBOARD_DATA.caseStatus.forEach((item) => {
    const fraction = item.count / total;
    const dashLength = fraction * circumference;
    const gapLength = circumference - dashLength;

    // Segment Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "60");
    circle.setAttribute("cy", "60");
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", item.color);
    circle.setAttribute("stroke-width", strokeWidth.toString());
    circle.setAttribute("stroke-dasharray", `${dashLength} ${gapLength}`);
    circle.setAttribute("stroke-dashoffset", (-accumulatedOffset).toString());
    circle.setAttribute("style", "transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;");

    // Interactive tooltip / hover on slices
    circle.addEventListener("mouseenter", () => {
      circle.setAttribute("stroke-width", (strokeWidth + 3).toString());
      showToast(`${item.label}: ${item.count} cases (${item.percentage})`);
    });
    circle.addEventListener("mouseleave", () => {
      circle.setAttribute("stroke-width", strokeWidth.toString());
    });

    slicesGroup.appendChild(circle);

    // Calculate percentage text placement inside slice
    const midFraction = currentStartFraction + fraction / 2;
    // Angle in degrees where -90 is 12 o'clock
    const midAngleDeg = -90 + midFraction * 360;
    const midAngleRad = (midAngleDeg * Math.PI) / 180;
    const labelX = 60 + radius * Math.cos(midAngleRad);
    const labelY = 60 + radius * Math.sin(midAngleRad);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", labelX.toFixed(1));
    text.setAttribute("y", labelY.toFixed(1));
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", item.count < 30 ? "6.8" : "7.2");
    text.setAttribute("font-weight", "700");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-family", "Inter, sans-serif");
    text.setAttribute("style", "pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);");
    text.textContent = item.percentage;

    labelsGroup.appendChild(text);

    accumulatedOffset += dashLength;
    currentStartFraction += fraction;
  });

  svg.appendChild(slicesGroup);
  svg.appendChild(labelsGroup);
}

// --- VERTICAL BAR CHART RENDERING (SVG BASED) ---
function initBarChart() {
  const container = document.getElementById("bureauBarChart");
  if (!container) return;

  const maxVal = 200;
  const chartHeight = 90;
  const chartWidth = 280;
  
  // 3 Bars configuration
  const bars = DASHBOARD_DATA.bureauDistribution;
  const barWidth = 36;
  const barPositions = [45, 140, 235];

  let svgHtml = `
    <svg viewBox="0 0 ${chartWidth} 125" class="barchart-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Horizontal Grid Lines -->
      <line x1="26" y1="10" x2="${chartWidth}" y2="10" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="32.5" x2="${chartWidth}" y2="32.5" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="55" x2="${chartWidth}" y2="55" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="77.5" x2="${chartWidth}" y2="77.5" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="100" x2="${chartWidth}" y2="100" stroke="#e2e8f0" stroke-width="1.2" />

      <!-- Y Axis Values -->
      <text x="20" y="13" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">200</text>
      <text x="20" y="35.5" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">150</text>
      <text x="20" y="58" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">100</text>
      <text x="20" y="80.5" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">50</text>
      <text x="20" y="103" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">0</text>
  `;

  bars.forEach((item, index) => {
    const xPos = barPositions[index];
    const bHeight = (item.count / maxVal) * chartHeight;
    const yPos = 100 - bHeight;

    svgHtml += `
      <!-- Bar ${index + 1} -->
      <g class="bar-group" style="cursor: pointer;" data-bureau="${item.bureau}" data-count="${item.count}">
        <!-- Value Label Above Bar -->
        <text x="${xPos + barWidth / 2}" y="${yPos - 4}" font-size="9.5" font-weight="700" fill="#0f172a" text-anchor="middle" font-family="Inter, sans-serif">${item.count}</text>
        <!-- Bar Rect with Flat Top -->
        <rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${bHeight}" fill="${item.color}" rx="2" ry="2" />
        <!-- X Axis Label -->
        <text x="${xPos + barWidth / 2}" y="115" font-size="8" font-weight="600" fill="#475569" text-anchor="middle" font-family="Inter, sans-serif">
          ${item.bureau}
        </text>
      </g>
    `;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;

  // Add event listeners for bar hover
  container.querySelectorAll(".bar-group").forEach((group) => {
    group.addEventListener("mouseenter", () => {
      const bureau = group.getAttribute("data-bureau");
      const count = group.getAttribute("data-count");
      showToast(`${bureau}: ${count} active regional cases`);
    });
  });
}

// --- CASES MONITORING TABLE RENDERING ---
function initMonitoringTable(cases = DASHBOARD_DATA.monitoringCases) {
  const tbody = document.getElementById("monitoringTableBody");
  if (!tbody) return;

  if (cases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: #94a3b8;">No matching cases found in your region.</td></tr>`;
    return;
  }

  tbody.innerHTML = cases.map((c) => `
    <tr>
      <td class="cell-code">${escapeHtml(c.caseId)}</td>
      <td class="cell-bold">${escapeHtml(c.institutionName)}</td>
      <td class="cell-muted">${escapeHtml(c.aicteId)}</td>
      <td><span class="cell-badge">${escapeHtml(c.bureau)}</span></td>
      <td>${escapeHtml(c.category)}</td>
      <td><span class="cell-code">${escapeHtml(c.assignedOfficer)}</span></td>
      <td><span class="status-badge ${c.statusClass}">${escapeHtml(c.status)}</span></td>
      <td class="cell-muted">${escapeHtml(c.expectedDisposalDate)}</td>
      <td>
        <button class="btn-action-outline" onclick="openCaseModal('${c.caseId}')" aria-label="View details for ${c.caseId}">
          View Details
        </button>
      </td>
    </tr>
  `).join("");
}

// --- INSTITUTIONS TABLE RENDERING ---
function initInstitutionsTable(institutions = DASHBOARD_DATA.institutions) {
  const tbody = document.getElementById("institutionsTableBody");
  if (!tbody) return;

  if (institutions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94a3b8;">No institutions match the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = institutions.map((inst) => `
    <tr>
      <td class="cell-bold">${escapeHtml(inst.institutionName)}</td>
      <td class="cell-muted">${escapeHtml(inst.aicteId)}</td>
      <td>${escapeHtml(inst.district)}</td>
      <td class="cell-num-bold">${inst.totalCases}</td>
      <td>${inst.pending}</td>
      <td><span class="${inst.overdue > 0 ? 'cell-urgent-red' : ''}">${inst.overdue}</span></td>
      <td>
        <button class="btn-action-view" onclick="openInstitutionModal('${inst.aicteId}')" aria-label="View institution ${inst.institutionName}">
          View
        </button>
      </td>
    </tr>
  `).join("");
}

// --- FILTER CONTROLS FOR INSTITUTIONS ---
function initFilterControls() {
  const searchInput = document.getElementById("instSearchInput");
  const districtSelect = document.getElementById("instDistrictSelect");
  const statusSelect = document.getElementById("instStatusSelect");

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const district = districtSelect ? districtSelect.value : "All";
    const status = statusSelect ? statusSelect.value : "All";

    const filtered = DASHBOARD_DATA.institutions.filter((item) => {
      const matchesQuery = !query || 
        item.institutionName.toLowerCase().includes(query) || 
        item.aicteId.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query);

      const matchesDistrict = district === "All" || item.district.toLowerCase() === district.toLowerCase();

      let matchesStatus = true;
      if (status === "Pending Cases") {
        matchesStatus = item.pending > 0;
      } else if (status === "Overdue Cases") {
        matchesStatus = item.overdue > 0;
      } else if (status === "Active") {
        matchesStatus = true;
      }

      return matchesQuery && matchesDistrict && matchesStatus;
    });

    initInstitutionsTable(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (districtSelect) districtSelect.addEventListener("change", applyFilters);
  if (statusSelect) statusSelect.addEventListener("change", applyFilters);
}

// --- GLOBAL SEARCH ---
function initGlobalSearch() {
  const globalSearch = document.getElementById("globalSearchInput");
  if (!globalSearch) return;

  globalSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      initMonitoringTable();
      initInstitutionsTable();
      return;
    }

    const filteredCases = DASHBOARD_DATA.monitoringCases.filter((c) =>
      c.caseId.toLowerCase().includes(query) ||
      c.institutionName.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.bureau.toLowerCase().includes(query)
    );

    const filteredInstitutions = DASHBOARD_DATA.institutions.filter((i) =>
      i.institutionName.toLowerCase().includes(query) ||
      i.aicteId.toLowerCase().includes(query) ||
      i.district.toLowerCase().includes(query)
    );

    initMonitoringTable(filteredCases);
    initInstitutionsTable(filteredInstitutions);
  });
}

// --- SIDEBAR TOGGLE ---
function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const sidebar = document.getElementById("appSidebar");
  const overlay = document.getElementById("sidebarBackdrop");

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener("click", () => {
    if (window.innerWidth <= 1024) {
      sidebar.classList.toggle("mobile-open");
      if (overlay) overlay.classList.toggle("active");
    } else {
      document.body.classList.toggle("sidebar-collapsed");
    }
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      overlay.classList.remove("active");
    });
  }
}

// --- REGION SELECTOR DROPDOWN ---
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
      const bannerBadge = document.getElementById("bannerRegionBadge");

      if (currentRegionLabel) currentRegionLabel.textContent = newRegion;
      if (bannerBadge) {
        bannerBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg> ${newRegion}`;
      }

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

// --- MODAL DIALOGS ---
function initModals() {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function openModal(title, contentHtml) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");

  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Modal View Details for Case
window.openCaseModal = function(caseId) {
  const c = DASHBOARD_DATA.monitoringCases.find((item) => item.caseId === caseId);
  if (!c) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">CASE RECORD</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(c.caseId)}</h3>
        </div>
        <span class="status-badge ${c.statusClass}" style="font-size: 0.78rem; padding: 4px 10px;">${escapeHtml(c.status)}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 12px; border-radius: 8px;">
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Institution Name</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.institutionName)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">AICTE / EduVision ID</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.aicteId)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Bureau / Cell</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1d6bf3;">${escapeHtml(c.bureau)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Assigned Officer</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.assignedOfficer)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Complaint Category</span>
          <p style="font-size: 0.82rem; font-weight: 600; color: #334155;">${escapeHtml(c.category)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Expected Disposal</span>
          <p style="font-size: 0.82rem; font-weight: 600; color: #334155;">${escapeHtml(c.expectedDisposalDate)}</p>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 5px;">Case Summary & Notes</h4>
        <p style="font-size: 0.8rem; color: #475569; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
          ${escapeHtml(c.details)}
        </p>
      </div>

      <div style="font-size: 0.7rem; color: #94a3b8; font-style: italic;">
        Demonstration data for Regional Officer monitoring. Backend integration ready.
      </div>
    </div>
  `;

  openModal(`Case Details — ${c.caseId}`, content);
};

// Modal View Institution
window.openInstitutionModal = function(aicteId) {
  const inst = DASHBOARD_DATA.institutions.find((i) => i.aicteId === aicteId);
  if (!inst) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">INSTITUTION PROFILE</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">${escapeHtml(inst.institutionName)}</h3>
        </div>
        <span class="status-badge ${inst.overdue > 0 ? 'overdue' : 'resolved'}" style="font-size: 0.78rem; padding: 4px 10px;">
          ${inst.overdue > 0 ? 'Needs Attention' : 'Compliant'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Total Cases</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">${inst.totalCases}</div>
        </div>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Pending</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #1d6bf3;">${inst.pending}</div>
        </div>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Overdue</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444;">${inst.overdue}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
        <div><strong>District / City:</strong> ${escapeHtml(inst.district)}</div>
        <div><strong>AICTE / Affiliation Code:</strong> ${escapeHtml(inst.aicteId)}</div>
        <div><strong>Regional Jurisdiction:</strong> North Region Office</div>
      </div>
    </div>
  `;

  openModal(`Institution Summary — ${inst.institutionName}`, content);
};

// Modal Review Cases (Overlap alert)
window.openOverlapReviewModal = function() {
  const overlap = DASHBOARD_DATA.overlappingCaseDemo;
  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px;">
        <h4 style="font-size: 0.88rem; font-weight: 700; color: #9f1239; display: flex; align-items: center; gap: 6px;">
          <svg width="17" height="17" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          Potential Overlapping Cases — Human Coordination Required
        </h4>
        <p style="font-size: 0.76rem; color: #881337; margin-top: 4px; line-height: 1.4;">
          The system detected two separate active cases associated with <strong>${escapeHtml(overlap.institution)}</strong>.
          As per governance guidelines, complaints are not automatically merged. Human verification is required.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <!-- Case 1 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #1d6bf3;">CASE 1</span>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(overlap.case1.id)}</h4>
          <div style="margin-top: 8px; font-size: 0.76rem; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Bureau:</strong> ${escapeHtml(overlap.case1.bureau)}</div>
            <div><strong>Subject:</strong> ${escapeHtml(overlap.case1.category)}</div>
            <div><strong>Assigned Officer:</strong> ${escapeHtml(overlap.case1.officer)}</div>
          </div>
        </div>

        <!-- Case 2 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #f59e0b;">CASE 2</span>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(overlap.case2.id)}</h4>
          <div style="margin-top: 8px; font-size: 0.76rem; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Bureau:</strong> ${escapeHtml(overlap.case2.bureau)}</div>
            <div><strong>Subject:</strong> ${escapeHtml(overlap.case2.category)}</div>
            <div><strong>Assigned Officer:</strong> ${escapeHtml(overlap.case2.officer)}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;">
        <button class="btn-action-outline" onclick="closeModal()">Close Review</button>
        <button class="btn-review-cases" onclick="showToast('Coordination notice dispatched to Bureaus RB & PGRC'); closeModal();">
          Dispatch Coordination Notice
        </button>
      </div>
    </div>
  `;

  openModal("Case Overlap Review & Coordination", content);
};

// Modal View Reports
window.openReportsModal = function() {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <p style="font-size: 0.8rem; color: #64748b;">
        Select a regional report template to preview aggregated complaint monitoring statistics for North Region:
      </p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Institution-wise Case Summary</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Breakdown of 386 complaints across 124 regional colleges.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Institution-wise summary generated')">View</button>
        </div>

        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Bureau/Cell-wise Distribution</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Workload distribution: Regulation Bureau, PGRC, and specialized cells.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Bureau distribution report generated')">View</button>
        </div>

        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Pending & Overdue Case Report</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Detailed audit of 142 pending and 28 overdue institutional cases.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Pending & Overdue report generated')">View</button>
        </div>
      </div>
    </div>
  `;

  openModal("Regional Reports Catalog", content);
};

// --- QUICK ACTIONS HANDLERS ---
function initQuickActions() {
  const actions = {
    viewInstitutions: () => {
      const el = document.getElementById("institutionsSection");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      showToast("Scrolled to Regional Institutions table");
    },
    viewPending: () => {
      const el = document.getElementById("monitoringTableSection");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      showToast("Displaying pending cases requiring regional monitoring");
    },
    reviewOverlap: () => {
      window.openOverlapReviewModal();
    },
    generateReport: () => {
      window.openReportsModal();
    }
  };

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actionName = btn.getAttribute("data-action");
      if (actions[actionName]) actions[actionName]();
    });
  });
}

// --- NON-INTRUSIVE TOAST SYSTEM ---
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

// Utility to escape HTML and prevent injection
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
