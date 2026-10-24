/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Dashboard 3: Institution & Case Tracking Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    if (!Auth.checkPageAccess()) {
        return;
    }

    // Elements
    const searchForm = document.getElementById('instSearchForm');
    const searchInput = document.getElementById('instSearchQuery');
    const regionFilter = document.getElementById('regionFilter');
    const btnSearch = document.getElementById('btnSearchInst');

    // Results & Profile Containers
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsList = document.getElementById('searchResultsList');
    const instProfileContainer = document.getElementById('instProfileContainer');

    // Profile Details Elements
    const profileName = document.getElementById('profileName');
    const profilePermanentId = document.getElementById('profilePermanentId');
    const profileRegion = document.getElementById('profileRegion');
    const profileAddress = document.getElementById('profileAddress');
    const profileContact = document.getElementById('profileContact');
    const profileType = document.getElementById('profileType');
    const profileApproval = document.getElementById('profileApproval');

    // Metric Elements
    const metricTotalCases = document.getElementById('metricTotalCases');
    const metricActiveCases = document.getElementById('metricActiveCases');
    const metricDisposedCases = document.getElementById('metricDisposedCases');
    const bureauDistributionBadges = document.getElementById('bureauDistributionBadges');

    // Overlap Banner
    const overlapBanner = document.getElementById('overlapBanner');
    const overlapBannerText = document.getElementById('overlapBannerText');

    // Case Timeline Container
    const caseTimelineList = document.getElementById('caseTimelineList');

    let currentInstitution = null;

    /**
     * Search Institutions
     */
    async function searchInstitutions() {
        const query = searchInput.value.trim();
        const region = regionFilter.value;

        if (!query && !region) {
            Common.showToast('Please enter a Permanent ID, institution name, or select a region.', 'warning');
            return;
        }

        try {
            searchResultsContainer.style.display = 'block';
            searchResultsList.innerHTML = `<div style="text-align:center;padding:20px;"><div class="spinner"></div><p style="margin-top:8px;">Searching AICTE registered institutions...</p></div>`;

            const result = await Api.get(CONFIG.ENDPOINTS.INSTITUTIONS, { query, region, page: 0, size: 10 });

            if (!result || !Array.isArray(result.content) || result.content.length === 0) {
                searchResultsList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h4>No Institutions Found</h4><p>No verified institution matches the search query.</p></div>`;
                return;
            }

            searchResultsList.innerHTML = `
                <div style="font-size:0.85rem;color:var(--color-text-muted);margin-bottom:8px;">Found ${result.totalElements} verified institution(s):</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${result.content.map(inst => `
                        <div class="card" style="margin-bottom:0;cursor:pointer;padding:12px;border:1px solid var(--color-border);transition:all 0.15s;" onclick="selectInstitution(${inst.id})">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <div>
                                    <h4 style="font-size:0.95rem;color:var(--color-primary-navy);margin-bottom:2px;">${Common.escapeHtml(inst.name)}</h4>
                                    <div style="font-size:0.75rem;color:var(--color-text-muted);">
                                        Permanent ID: <strong style="color:var(--color-gov-blue);font-family:var(--font-family-mono);">${Common.escapeHtml(inst.permanentId)}</strong> | Region: ${Common.escapeHtml(inst.region)} (${Common.escapeHtml(inst.city)}, ${Common.escapeHtml(inst.state)})
                                    </div>
                                </div>
                                <div style="display:flex;gap:6px;">
                                    <span class="badge" style="background:#e0f2fe;color:#0369a1;">${inst.totalCases} Total Case(s)</span>
                                    <span class="badge" style="background:${inst.activeCases > 0 ? '#fef3c7' : '#dcfce7'};color:${inst.activeCases > 0 ? '#92400e' : '#166534'};">
                                        ${inst.activeCases} Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // If only one match, auto-select it
            if (result.content.length === 1) {
                selectInstitution(result.content[0].id);
            }

        } catch (error) {
            searchResultsList.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px;">Search error: ${Common.escapeHtml(error.message)}</p>`;
        }
    }

    /**
     * Select & Inspect an Institution Profile
     */
    window.selectInstitution = async function(instId) {
        try {
            searchResultsContainer.style.display = 'none';
            instProfileContainer.style.display = 'block';

            currentInstitution = await Api.get(CONFIG.ENDPOINTS.INSTITUTION_DETAIL(instId));
            const history = await Api.get(CONFIG.ENDPOINTS.INSTITUTION_HISTORY(instId));
            const overlaps = await Api.get(CONFIG.ENDPOINTS.INSTITUTION_OVERLAPS(instId));
            const stats = await Api.get(CONFIG.ENDPOINTS.INSTITUTION_STATS(instId));

            // Populate Profile Data
            profileName.textContent = currentInstitution.name;
            profilePermanentId.textContent = currentInstitution.permanentId;
            profileRegion.textContent = currentInstitution.region + ' Region';
            profileAddress.textContent = currentInstitution.address || `${currentInstitution.city}, ${currentInstitution.state}`;
            profileContact.textContent = `${currentInstitution.contactEmail || 'N/A'} | ${currentInstitution.contactPhone || 'N/A'}`;
            profileType.textContent = currentInstitution.institutionType;
            profileApproval.textContent = currentInstitution.approvalStatus;

            // Stats
            metricTotalCases.textContent = stats.totalCases || 0;
            metricActiveCases.textContent = stats.activeCases || 0;
            metricDisposedCases.textContent = stats.disposedCases || 0;

            // Bureau Distribution Badges
            if (stats.bureauDistribution) {
                bureauDistributionBadges.innerHTML = Object.entries(stats.bureauDistribution).map(([bCode, count]) => `
                    <span class="badge" style="background:var(--color-bg-subtle);color:var(--color-primary-navy);border:1px solid var(--color-border);font-size:0.75rem;">
                        ${Common.escapeHtml(bCode)}: <strong>${count}</strong>
                    </span>
                `).join('');
            }

            // Cross-Bureau Overlap Callout Banner
            if (Array.isArray(overlaps) && overlaps.length > 0) {
                overlapBanner.style.display = 'flex';
                overlapBannerText.innerHTML = `
                    <h4>Potential Cross-Bureau Overlap Flagged!</h4>
                    <p>This institution has <strong>${overlaps.length} active multi-Bureau grievance overlap(s)</strong> across different Bureaus (e.g. RB and PGRC). Supervisory coordination recommended.</p>
                `;
            } else {
                overlapBanner.style.display = 'none';
            }

            // Render Chronological Multi-Case Timeline
            if (Array.isArray(history) && history.length > 0) {
                caseTimelineList.innerHTML = history.map(c => `
                    <div class="inst-case-card">
                        <div class="inst-case-card-top">
                            <div>
                                <span class="inst-case-number">${Common.escapeHtml(c.caseNumber)}</span>
                                <span style="font-size:0.8rem;color:var(--color-text-muted);margin-left:8px;">Source: ${Common.escapeHtml(c.sourceCaseId || 'N/A')}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span class="badge" style="background:#e0e7ff;color:#3730a3;font-weight:700;">Bureau: ${Common.escapeHtml(c.bureauCode)}</span>
                                ${Common.getPriorityBadge(c.priority)}
                                ${Common.getStatusBadge(c.status, c.overdue)}
                            </div>
                        </div>
                        <div class="inst-case-title">${Common.escapeHtml(c.title)}</div>
                        <div style="font-size:0.82rem;color:var(--color-text-secondary);">${Common.escapeHtml(c.description)}</div>
                        <div class="inst-case-meta">
                            <span>📂 Category: <strong>${Common.escapeHtml(c.category)}</strong></span>
                            <span>📅 Received: ${Common.formatDate(c.receiptDate)}</span>
                            <span>⏳ Expected Disposal: <strong style="${c.overdue ? 'color:#ef4444;' : ''}">${Common.formatDate(c.expectedDisposalDate)}</strong></span>
                            ${c.disposedDate ? `<span style="color:#10b981;">✅ Closed on: ${Common.formatDate(c.disposedDate)}</span>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                caseTimelineList.innerHTML = `<div class="empty-state"><p>No grievance cases registered against this institution.</p></div>`;
            }

            // Scroll down to profile
            instProfileContainer.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            Common.showToast('Failed to load institution details: ' + error.message, 'error');
        }
    };

    // Event Listeners
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            searchInstitutions();
        });
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            searchInstitutions();
        });
    }

    // Pre-populate search query if passed in URL hash or params
    const urlParams = new URLSearchParams(window.location.search);
    const permParam = urlParams.get('permId');
    if (permParam && searchInput) {
        searchInput.value = permParam;
        searchInstitutions();
    }
});
