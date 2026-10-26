/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Role Selection & Authentication Controller
 * Enforces role isolation, server-side verified authorization, and official request workflows.
 */

const RoleAuthModal = (function() {
    'use strict';

    // Role definitions
    const ROLES = {
        COMPLAINANT: {
            id: 'COMPLAINANT',
            name: 'Complaint File',
            badge: 'Public Stakeholder',
            badgeClass: 'role-badge-public',
            icon: '📄',
            desc: 'For students, faculty, and stakeholders to submit institution complaints, affidavits, and track redressal.',
            actionLogin: 'Sign In to Portal →',
            actionSignup: 'File a Complaint →',
            targetDashboard: 'complaint-portal.html',
            allowedRoles: ['COMPLAINANT', 'SYS_ADMIN'],
            demoAccounts: []
        },
        SENIOR_AUTHORITY: {
            id: 'SENIOR_AUTHORITY',
            name: 'Senior Authority',
            badge: 'AICTE Leadership Desk',
            badgeClass: 'role-badge-official',
            icon: '🏛️',
            desc: 'For authorized AICTE leadership and central monitoring officials overseeing escalated cases, regional operations, and nationwide redressal.',
            actionLogin: 'Access Oversight Desk →',
            actionSignup: 'Request Authority Access →',
            targetDashboard: 'central-dashboard.html',
            allowedRoles: ['CENTRAL_MONITOR', 'SENIOR_AUTHORITY', 'SYS_ADMIN'],
            demoAccounts: [
                { label: 'Director Sunita Verma (Central Monitor)', email: 'monitor@aicte.gov.in', pass: 'Monitor@123' }
            ]
        },
        REGIONAL_OFFICER: {
            id: 'REGIONAL_OFFICER',
            name: 'Regional Office',
            badge: 'Regional Coordination',
            badgeClass: 'role-badge-official',
            icon: '🌐',
            desc: 'For authorized regional officers monitoring institution-level compliance, hearings, inspections, and regional complaint resolution.',
            actionLogin: 'Access Regional Queue →',
            actionSignup: 'Submit RO Request →',
            targetDashboard: 'regional-dashboard.html',
            allowedRoles: ['REGIONAL_OFFICER', 'SYS_ADMIN', 'CENTRAL_MONITOR'],
            demoAccounts: [
                { label: 'Western RO (Dr. Sandeep Deshmukh)', email: 'western_ro@aicte.gov.in', pass: 'Officer@123' },
                { label: 'Northern RO (Shri Alok Kumar)', email: 'northern_ro@aicte.gov.in', pass: 'Officer@123' }
            ]
        },
        BUREAU_OFFICER: {
            id: 'BUREAU_OFFICER',
            name: 'Bureaus / Cells',
            badge: 'Investigation & Scrutiny',
            badgeClass: 'role-badge-official',
            icon: '⚖️',
            desc: 'For authorized officers of AICTE Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) examining case dossiers and recording actions.',
            actionLogin: 'Access Bureau Queue →',
            actionSignup: 'Submit Officer Request →',
            targetDashboard: 'bureau-workspace.html',
            allowedRoles: ['BUREAU_OFFICER', 'SYS_ADMIN'],
            demoAccounts: [
                { label: 'Regulation Bureau (RB) — Shri Rajesh Kulkarni', email: 'rb_officer@aicte.gov.in', pass: 'Officer@123' },
                { label: 'Grievance Redressal (PGRC) — Dr. Ananya Sen', email: 'pgrc_officer@aicte.gov.in', pass: 'Officer@123' }
            ]
        },
        SYS_ADMIN: {
            id: 'SYS_ADMIN',
            name: 'Super Admin',
            badge: 'System Administrator',
            badgeClass: 'role-badge-admin',
            icon: '🛡️',
            desc: 'Designated administrative controller responsible for system configuration, officer approval, and oversight.',
            actionLogin: 'Access System Console →',
            actionSignup: 'Restricted 🔒',
            targetDashboard: 'admin-dashboard.html',
            allowedRoles: ['SYS_ADMIN'],
            demoAccounts: [
                { label: 'CIO Dr. Ramesh Sharma (Super Admin)', email: 'admin@aicte.gov.in', pass: 'Admin@123' }
            ]
        }
    };

    let currentMode = 'login'; // 'login' or 'signup'
    let selectedRoleId = null;
    let modalEl = null;

    /**
     * Create and inject modal DOM
     */
    function initModalDOM() {
        if (document.getElementById('roleAuthModalOverlay')) {
            modalEl = document.getElementById('roleAuthModalOverlay');
            return;
        }

        const div = document.createElement('div');
        div.id = 'roleAuthModalOverlay';
        div.className = 'role-modal-overlay';
        div.setAttribute('role', 'dialog');
        div.setAttribute('aria-modal', 'true');
        div.innerHTML = `
            <div class="role-modal-container" id="roleModalContainer">
                <div class="role-modal-header">
                    <div class="role-modal-title-wrap">
                        <span style="font-size:1.4rem;">🏛️</span>
                        <div>
                            <h3 id="roleModalHeaderTitle">EduVision — Portal Access</h3>
                            <p id="roleModalHeaderSubtitle">Select your role to continue</p>
                        </div>
                    </div>
                    <button class="role-modal-close-btn" id="roleModalCloseBtn" aria-label="Close modal">&times;</button>
                </div>

                <div class="role-mode-switcher">
                    <button class="role-mode-tab active" id="tabModeLogin" onclick="RoleAuthModal.switchMode('login')">Sign In</button>
                    <button class="role-mode-tab" id="tabModeSignup" onclick="RoleAuthModal.switchMode('signup')">Sign Up / Register</button>
                </div>

                <div class="role-modal-body">
                    <!-- Step 1: Role Selection Options -->
                    <div id="roleSelectionView">
                        <p class="role-options-instruction" id="roleOptionsInstruction">
                            Please select the option that corresponds to your relationship with AICTE:
                        </p>
                        <div class="role-cards-grid" id="roleCardsGrid"></div>
                    </div>

                    <!-- Step 2: Role Specific Form View -->
                    <div id="roleFormView" class="role-form-view">
                        <div class="role-form-header">
                            <button class="role-form-back-btn" onclick="RoleAuthModal.backToRoleSelection()">
                                &larr; Back to Role Selection
                            </button>
                            <div class="role-form-role-indicator" id="roleFormIndicator"></div>
                        </div>

                        <div id="roleAlert" class="role-alert"></div>

                        <!-- Login Form -->
                        <div id="roleLoginFormContainer" style="display:none;">
                            <form id="roleLoginForm" onsubmit="RoleAuthModal.handleLoginSubmit(event)">
                                <div class="role-form-group">
                                    <label class="role-form-label" for="roleLoginEmail">Official Email Address *</label>
                                    <input type="email" id="roleLoginEmail" class="role-form-input" required placeholder="officer@aicte.gov.in" autocomplete="email">
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="roleLoginPassword">Password *</label>
                                    <input type="password" id="roleLoginPassword" class="role-form-input" required placeholder="••••••••" autocomplete="current-password">
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnRoleLoginSubmit">
                                    <span>Sign In to Designated Workspace</span> &rarr;
                                </button>
                            </form>

                            <div class="role-quickfill-box" id="roleLoginQuickFillBox">
                                <div class="role-quickfill-title">Evaluator Quick-Fill Credentials:</div>
                                <div id="roleLoginQuickFillButtons"></div>
                            </div>
                        </div>

                        <!-- Complainant Sign Up Notice -->
                        <div id="roleSignupComplainantContainer" style="display:none;">
                            <div class="role-notice-box">
                                <strong>Public Grievance Redressal:</strong> Grievance submission and public tracking do not require officer account registration. Please access the public complaint portal directly.
                            </div>
                            <div style="margin-top:16px;text-align:center;">
                                <a href="complaint-portal.html" class="role-form-btn-submit" style="display:inline-block;text-decoration:none;padding:12px 24px;">
                                    <span>📄 Go to Public Complaint Portal</span> &rarr;
                                </a>
                            </div>
                        </div>

                        <!-- Bureau Officer Registration Request -->
                        <div id="roleSignupBureauOfficerContainer" style="display:none;">
                            <div class="role-notice-box">
                                <strong>Bureau / Cell Officer Registration Protocol:</strong> Official accounts for AICTE Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) are provisioned exclusively via Super Admin review and verification. Upon approval, you will receive an official activation token to configure your credentials.
                            </div>
                            <form id="roleBureauOfficerForm" onsubmit="RoleAuthModal.handleOfficerRegistrationSubmit(event)">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerFullName">Full Name *</label>
                                        <input type="text" id="bureauOfficerFullName" class="role-form-input" required placeholder="e.g. Er. Vikram Mehta">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerEmail">Government / Official Email *</label>
                                        <input type="email" id="bureauOfficerEmail" class="role-form-input" required placeholder="officer@aicte.gov.in">
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerEmpId">Employee ID / Staff Code *</label>
                                        <input type="text" id="bureauOfficerEmpId" class="role-form-input" required placeholder="e.g. EMP-RB-9021">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerBureau">Designated Bureau / Cell *</label>
                                        <select id="bureauOfficerBureau" class="role-form-select" required>
                                            <option value="RB">Regulation Bureau (RB) — Case Scrutiny & Norms</option>
                                            <option value="PGRC">Public Grievance Redressal Cell (PGRC) — Grievances</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerDesignation">Official Designation *</label>
                                        <input type="text" id="bureauOfficerDesignation" class="role-form-input" required placeholder="e.g. Scrutiny Officer / Assistant Director">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="bureauOfficerDept">Department / Section</label>
                                        <input type="text" id="bureauOfficerDept" class="role-form-input" placeholder="e.g. Technical Norms Compliance">
                                    </div>
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="bureauOfficerPhone">Official Mobile / Intercom Phone</label>
                                    <input type="tel" id="bureauOfficerPhone" class="role-form-input" placeholder="+91 11 2958 1000">
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="bureauOfficerVerificationInfo">Official Purpose / Office Order Reference</label>
                                    <textarea id="bureauOfficerVerificationInfo" class="role-form-textarea" rows="2" placeholder="Specify your posting details, official appointment reference, or administrative remarks..."></textarea>
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnBureauOfficerSubmit">
                                    <span>Submit Officer Access Request</span> &rarr;
                                </button>
                            </form>
                        </div>

                        <!-- Regional Office Access Request -->
                        <div id="roleSignupOfficialContainer" style="display:none;">
                            <div class="role-notice-box">
                                <strong>Regional Office Access Protocol:</strong> Official accounts for Regional Offices are provisioned through administrative verification by the Super Admin. You may submit an access request below.
                            </div>
                            <form id="roleOfficialAccessForm" onsubmit="RoleAuthModal.handleOfficialAccessSubmit(event)">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="offFullName">Full Name *</label>
                                        <input type="text" id="offFullName" class="role-form-input" required placeholder="e.g. Dr. Ramesh Kumar">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="offEmail">Government / Official Email *</label>
                                        <input type="email" id="offEmail" class="role-form-input" required placeholder="officer@aicte.gov.in">
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="offPhone">Official Phone Number</label>
                                        <input type="tel" id="offPhone" class="role-form-input" placeholder="+91 11 2958 1000">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="offOrgUnit">Organization / Regional Unit *</label>
                                        <input type="text" id="offOrgUnit" class="role-form-input" required placeholder="e.g. Western Regional Office">
                                    </div>
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="offJustification">Official Justification / Designatory Reference *</label>
                                    <textarea id="offJustification" class="role-form-textarea" rows="2" required placeholder="Specify your designation, employee ID, and official purpose for accessing the monitoring dashboard."></textarea>
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnRoleAccessSubmit">
                                    <span>Submit Official Access Request</span> &rarr;
                                </button>
                            </form>
                        </div>

                        <!-- Super Admin Restricted Notice -->
                        <div id="roleSignupAdminContainer" style="display:none;">
                            <div class="role-notice-box warning">
                                <strong>Access Prohibited:</strong> Public self-registration for the <strong>Super Admin</strong> role is strictly disabled under AICTE security directives. Super Admin accounts are provisioned exclusively via secure server-level configuration.
                            </div>
                            <p style="font-size:0.85rem;color:#475569;">
                                If you are an administrator, please switch to <strong>Sign In</strong> and use your verified administrative credentials.
                            </p>
                            <div style="margin-top:16px;">
                                <button type="button" class="role-form-btn-submit" onclick="RoleAuthModal.switchMode('login')">
                                    Switch to Officer Sign In &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(div);
        modalEl = div;

        // Close handlers
        document.getElementById('roleModalCloseBtn')?.addEventListener('click', () => RoleAuthModal.close());
        div.addEventListener('click', (e) => {
            if (e.target === div) {
                RoleAuthModal.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl && modalEl.classList.contains('active')) {
                RoleAuthModal.close();
            }
        });
    }

    /**
     * Render the role selection cards
     * - In Sign-In mode: Removes "Complaint File" and "Super Admin" from publicly selectable options.
     * - In Sign-Up mode: Removes "Complaint File" and "Super Admin", showing only Bureaus/Cells & Regional Office requests.
     */
    function renderRoleOptions() {
        const grid = document.getElementById('roleCardsGrid');
        if (!grid) return;

        let roleKeys = [];
        if (currentMode === 'login') {
            // Legitimate sign-in flows: Senior Authority, Regional Office, Bureaus/Cells
            roleKeys = ['SENIOR_AUTHORITY', 'REGIONAL_OFFICER', 'BUREAU_OFFICER'];
        } else {
            // Official registration request flows
            roleKeys = ['BUREAU_OFFICER', 'REGIONAL_OFFICER'];
        }

        grid.innerHTML = roleKeys.map(key => {
            const r = ROLES[key];
            const actionText = (currentMode === 'login') ? r.actionLogin : r.actionSignup;
            return `
                <div class="role-option-card" tabindex="0" onclick="RoleAuthModal.selectRole('${r.id}')" onkeydown="if(event.key==='Enter')RoleAuthModal.selectRole('${r.id}')">
                    <div class="role-option-icon">${r.icon}</div>
                    <div class="role-option-text">
                        <div class="role-option-name">
                            <span>${r.name}</span>
                            <span class="role-badge-tag ${r.badgeClass}">${r.badge}</span>
                        </div>
                        <p class="role-option-desc">${r.desc}</p>
                    </div>
                    <div class="role-option-action">
                        <span>${actionText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    return {
        /**
         * Open the Role Selection modal
         */
        open(mode = 'login', preselectRoleId = null) {
            initModalDOM();
            currentMode = (mode === 'signup') ? 'signup' : 'login';
            this.switchMode(currentMode, false);

            if (preselectRoleId && ROLES[preselectRoleId]) {
                this.selectRole(preselectRoleId);
            } else {
                this.backToRoleSelection();
            }

            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (modalEl) {
                modalEl.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        switchMode(mode, reRender = true) {
            currentMode = mode;
            const tabLogin = document.getElementById('tabModeLogin');
            const tabSignup = document.getElementById('tabModeSignup');
            const headerTitle = document.getElementById('roleModalHeaderTitle');
            const headerSubtitle = document.getElementById('roleModalHeaderSubtitle');
            const pageHeading = document.getElementById('rolePageHeading');
            const instruction = document.getElementById('roleOptionsInstruction');

            if (mode === 'signup') {
                if (tabSignup) tabSignup.classList.add('active');
                if (tabLogin) tabLogin.classList.remove('active');
                if (headerTitle) headerTitle.textContent = 'EduVision — Official Registration Request';
                if (headerSubtitle) headerSubtitle.textContent = 'Select your designated office to request authorized access';
                if (pageHeading) pageHeading.textContent = 'Official Staff Access Request';
                if (instruction) instruction.textContent = 'Select your AICTE division to request verified officer credentials:';
            } else {
                if (tabLogin) tabLogin.classList.add('active');
                if (tabSignup) tabSignup.classList.remove('active');
                if (headerTitle) headerTitle.textContent = 'EduVision — Authorized Sign In';
                if (headerSubtitle) headerSubtitle.textContent = 'Select your role to access your designated workspace';
                if (pageHeading) pageHeading.textContent = 'Select Your Designated Role';
                if (instruction) instruction.textContent = 'Please select the option that corresponds to your relationship with AICTE:';
            }

            if (reRender) {
                if (selectedRoleId) {
                    this.selectRole(selectedRoleId);
                } else {
                    renderRoleOptions();
                }
            }
        },

        backToRoleSelection() {
            selectedRoleId = null;
            const selectionView = document.getElementById('roleSelectionView');
            const formView = document.getElementById('roleFormView');
            if (selectionView) selectionView.style.display = 'block';
            if (formView) formView.classList.remove('active');
            this.clearAlert();
            renderRoleOptions();
        },

        selectRole(roleId) {
            const role = ROLES[roleId];
            if (!role) return;

            selectedRoleId = roleId;
            const selectionView = document.getElementById('roleSelectionView');
            const formView = document.getElementById('roleFormView');
            const indicator = document.getElementById('roleFormIndicator');

            if (selectionView) selectionView.style.display = 'none';
            if (formView) formView.classList.add('active');

            if (indicator) {
                indicator.innerHTML = `
                    <span>${role.icon}</span>
                    <span>${role.name}</span>
                    <span class="role-badge-tag ${role.badgeClass}" style="margin-left:6px;">${role.badge}</span>
                `;
            }

            this.clearAlert();

            const loginContainer = document.getElementById('roleLoginFormContainer');
            const signupCompContainer = document.getElementById('roleSignupComplainantContainer');
            const signupBureauContainer = document.getElementById('roleSignupBureauOfficerContainer');
            const signupOffContainer = document.getElementById('roleSignupOfficialContainer');
            const signupAdminContainer = document.getElementById('roleSignupAdminContainer');

            if (loginContainer) loginContainer.style.display = 'none';
            if (signupCompContainer) signupCompContainer.style.display = 'none';
            if (signupBureauContainer) signupBureauContainer.style.display = 'none';
            if (signupOffContainer) signupOffContainer.style.display = 'none';
            if (signupAdminContainer) signupAdminContainer.style.display = 'none';

            if (currentMode === 'login') {
                if (loginContainer) loginContainer.style.display = 'block';
                this.renderQuickFills(role);
            } else {
                if (roleId === 'BUREAU_OFFICER') {
                    if (signupBureauContainer) signupBureauContainer.style.display = 'block';
                } else if (roleId === 'COMPLAINANT') {
                    if (signupCompContainer) signupCompContainer.style.display = 'block';
                } else if (roleId === 'SYS_ADMIN') {
                    if (signupAdminContainer) signupAdminContainer.style.display = 'block';
                } else {
                    if (signupOffContainer) signupOffContainer.style.display = 'block';
                }
            }
        },

        renderQuickFills(role) {
            const container = document.getElementById('roleLoginQuickFillButtons');
            if (!container) return;

            if (!role.demoAccounts || role.demoAccounts.length === 0) {
                container.innerHTML = `<span style="font-size:0.8rem;color:#64748b;">No demo credentials configured.</span>`;
                return;
            }

            container.innerHTML = role.demoAccounts.map(acc => `
                <button type="button" class="role-quickfill-btn" onclick="RoleAuthModal.fillCredentials('${acc.email}', '${acc.pass}')">
                    ${acc.label}
                </button>
            `).join('');
        },

        fillCredentials(email, pass) {
            const emailInput = document.getElementById('roleLoginEmail');
            const passInput = document.getElementById('roleLoginPassword');
            if (emailInput) emailInput.value = email;
            if (passInput) passInput.value = pass;
        },

        /**
         * Handle Sign In Submission
         * Identifies the user's actual authorized role from the backend account record.
         * Never trusts a role supplied by the frontend.
         */
        async handleLoginSubmit(event) {
            event.preventDefault();
            this.clearAlert();

            const email = document.getElementById('roleLoginEmail').value.trim();
            const password = document.getElementById('roleLoginPassword').value;
            const submitBtn = document.getElementById('btnRoleLoginSubmit');

            if (!email || !password) {
                this.showAlert('Please enter both your email address and password.', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Verifying with AICTE Security...`;

                const result = await Auth.login(email, password);
                const user = result.user;
                const actualRole = user ? user.role : null;

                // Server-determined target dashboard based strictly on actual authorized backend record
                let targetDashboard = 'bureau-workspace.html';
                if (actualRole === 'SYS_ADMIN') {
                    targetDashboard = 'admin-dashboard.html';
                } else if (actualRole === 'CENTRAL_MONITOR' || actualRole === 'SENIOR_AUTHORITY') {
                    targetDashboard = 'central-dashboard.html';
                } else if (actualRole === 'REGIONAL_OFFICER') {
                    targetDashboard = 'regional-dashboard.html';
                } else if (actualRole === 'BUREAU_OFFICER') {
                    targetDashboard = 'bureau-workspace.html';
                } else if (actualRole === 'COMPLAINANT') {
                    targetDashboard = 'complaint-portal.html';
                }

                this.showAlert(`Authentication verified! Welcome ${user.fullName || ''} (${Auth.formatRoleLabel(user)}). Loading authorized workspace...`, 'success');
                setTimeout(() => {
                    window.location.href = targetDashboard;
                }, 400);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Sign In to Designated Workspace</span> &rarr;`;
                this.showAlert(error.message || 'Authentication failed. Please check your credentials.', 'error');
            }
        },

        /**
         * Handle Bureau Officer Registration Request Submission
         */
        async handleOfficerRegistrationSubmit(event) {
            event.preventDefault();
            this.clearAlert();

            const fullName = document.getElementById('bureauOfficerFullName').value.trim();
            const email = document.getElementById('bureauOfficerEmail').value.trim();
            const employeeId = document.getElementById('bureauOfficerEmpId').value.trim();
            const requestedBureauCode = document.getElementById('bureauOfficerBureau').value;
            const designation = document.getElementById('bureauOfficerDesignation').value.trim();
            const department = (document.getElementById('bureauOfficerDept')?.value || '').trim();
            const phone = (document.getElementById('bureauOfficerPhone')?.value || '').trim();
            const verificationInfo = (document.getElementById('bureauOfficerVerificationInfo')?.value || '').trim();
            const submitBtn = document.getElementById('btnBureauOfficerSubmit');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Submitting request to AICTE...`;

                const result = await Api.post(CONFIG.ENDPOINTS.REQUEST_OFFICER_ACCESS, {
                    fullName,
                    email,
                    employeeId,
                    requestedBureauCode,
                    designation,
                    department,
                    phone,
                    verificationInfo
                });

                const reqId = result.requestId || 'REQ-2026-XXXX';
                this.showAlert(`Officer registration request submitted successfully! Request ID: ${reqId}. Your application is queued for Super Admin review and approval.`, 'success');

                const form = document.getElementById('roleBureauOfficerForm');
                if (form) {
                    form.innerHTML = `
                        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:6px;padding:24px;text-align:center;">
                            <div style="font-size:2.4rem;color:#16a34a;margin-bottom:8px;">✓</div>
                            <h3 style="color:#166534;margin:0 0 8px;font-size:1.25rem;">Registration Request Submitted</h3>
                            <div style="display:inline-block;background:#ffffff;border:1px dashed #16a34a;padding:8px 18px;border-radius:4px;font-family:monospace;font-size:1.15rem;font-weight:700;color:#166534;margin:10px 0;">
                                ${reqId}
                            </div>
                            <p style="font-size:0.9rem;color:#374151;margin:12px auto;max-width:480px;line-height:1.5;">
                                Your access request for <strong>${requestedBureauCode === 'RB' ? 'Regulation Bureau (RB)' : 'Public Grievance Redressal Cell (PGRC)'}</strong> has been logged in the AICTE Governance registry.
                            </p>
                            <div style="background:#ffffff;border:1px solid #d1fae5;border-radius:4px;padding:12px;margin:16px 0;text-align:left;font-size:0.83rem;color:#1f2937;">
                                <div><strong>Applicant:</strong> ${fullName} (${email})</div>
                                <div><strong>Staff Code:</strong> ${employeeId} &bull; <strong>Designation:</strong> ${designation}</div>
                                <div><strong>Status:</strong> <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-weight:700;font-size:0.75rem;">PENDING APPROVAL</span></div>
                            </div>
                            <p style="font-size:0.82rem;color:#6b7280;margin:0 0 16px;">
                                Once the Super Admin verifies and approves your request, an activation token will be issued to complete your account setup.
                            </p>
                            <button type="button" class="role-form-btn-submit" onclick="RoleAuthModal.switchMode('login')">
                                Return to Officer Sign In &rarr;
                            </button>
                        </div>
                    `;
                }
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Submit Officer Access Request</span> &rarr;`;
                this.showAlert(err.message || 'Failed to submit officer registration request.', 'error');
            }
        },

        /**
         * Handle Regional Official Access Request Submission
         */
        async handleOfficialAccessSubmit(event) {
            event.preventDefault();
            this.clearAlert();

            const fullName = document.getElementById('offFullName').value.trim();
            const email = document.getElementById('offEmail').value.trim();
            const phone = document.getElementById('offPhone').value.trim();
            const organizationUnit = document.getElementById('offOrgUnit').value.trim();
            const justification = document.getElementById('offJustification').value.trim();
            const submitBtn = document.getElementById('btnRoleAccessSubmit');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Submitting Request...`;

                const role = ROLES[selectedRoleId];
                await Auth.requestOfficialAccess({
                    fullName,
                    email,
                    phone,
                    requestedRole: role ? role.name : selectedRoleId,
                    organizationUnit,
                    justification
                });

                this.showAlert('Access request submitted successfully! An AICTE System Administrator will review your credentials and issue authorization.', 'success');
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Request Submitted</span> ✓`;

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Submit Official Access Request</span> &rarr;`;
                this.showAlert(error.message || 'Failed to submit access request.', 'error');
            }
        },

        showAlert(msg, type = 'error') {
            const el = document.getElementById('roleAlert');
            if (el) {
                el.className = `role-alert ${type}`;
                el.textContent = msg;
                el.style.display = 'block';
            }
        },

        clearAlert() {
            const el = document.getElementById('roleAlert');
            if (el) {
                el.style.display = 'none';
                el.textContent = '';
            }
        }
    };
})();
