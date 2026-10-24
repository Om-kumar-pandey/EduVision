/**
 * EduVision — Five-Option Role Selection & Authentication Controller
 * Reusable modal and page component for both Sign Up and Login flows.
 */

const RoleAuthModal = (function() {
    'use strict';

    // Role definitions matching requirements
    const ROLES = {
        COMPLAINANT: {
            id: 'COMPLAINANT',
            name: 'Complaint File',
            badge: 'Public Stakeholder',
            badgeClass: 'role-badge-public',
            icon: '📄',
            desc: 'For students, faculty, and other eligible stakeholders who want to submit a complaint, provide supporting documents, or track an existing complaint.',
            actionLogin: 'Sign In to Portal →',
            actionSignup: 'Create Complaint Account →',
            targetDashboard: 'complaint-portal.html',
            allowedRoles: ['COMPLAINANT', 'SYS_ADMIN'],
            demoAccounts: [
                { label: 'Demo Student (Rahul Sharma)', email: 'rahul.sharma@gmail.com', pass: 'Student@123' }
            ]
        },
        SENIOR_AUTHORITY: {
            id: 'SENIOR_AUTHORITY',
            name: 'Senior Authority',
            badge: 'AICTE Leadership',
            badgeClass: 'role-badge-official',
            icon: '🏛️',
            desc: 'For authorized senior officials who need to review escalated complaints, monitor institutional performance, make decisions, and oversee resolution.',
            actionLogin: 'Access Oversight Desk →',
            actionSignup: 'Request Authority Access →',
            targetDashboard: 'central-dashboard.html',
            allowedRoles: ['CENTRAL_MONITOR', 'SENIOR_AUTHORITY', 'SYS_ADMIN'],
            demoAccounts: [
                { label: 'Director Sunita Verma', email: 'monitor@aicte.gov.in', pass: 'Monitor@123' }
            ]
        },
        REGIONAL_OFFICER: {
            id: 'REGIONAL_OFFICER',
            name: 'Regional Office',
            badge: 'Regional Operations',
            badgeClass: 'role-badge-official',
            icon: '🌐',
            desc: 'For authorized regional officers who need to review assigned complaints, monitor institution-level issues, and coordinate regional resolution.',
            actionLogin: 'Access Regional Queue →',
            actionSignup: 'Request Regional Access →',
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
            badge: 'Investigation Unit',
            badgeClass: 'role-badge-official',
            icon: '⚖️',
            desc: 'For authorized bureau or cell officials who need to examine complaints, manage assigned cases, record actions, and coordinate with relevant departments.',
            actionLogin: 'Access Bureau Queue →',
            actionSignup: 'Request Bureau Access →',
            targetDashboard: 'bureau-workspace.html',
            allowedRoles: ['BUREAU_OFFICER', 'SYS_ADMIN'],
            demoAccounts: [
                { label: 'Regulation Bureau (RB)', email: 'rb_officer@aicte.gov.in', pass: 'Officer@123' },
                { label: 'Grievance Redressal (PGRC)', email: 'pgrc_officer@aicte.gov.in', pass: 'Officer@123' },
                { label: 'Approval Bureau (Scrutiny)', email: 'approval_officer@aicte.gov.in', pass: 'Officer@123' }
            ]
        },
        SYS_ADMIN: {
            id: 'SYS_ADMIN',
            name: 'Super Admin',
            badge: 'System Administrator',
            badgeClass: 'role-badge-admin',
            icon: '🛡️',
            desc: 'For the designated system administrator responsible for system configuration, authorized user management, role assignments, oversight, and audit monitoring.',
            actionLogin: 'Access System Console →',
            actionSignup: 'System Admin Restricted 🔒',
            targetDashboard: 'admin-dashboard.html',
            allowedRoles: ['SYS_ADMIN'],
            demoAccounts: [
                { label: 'CIO Dr. Ramesh Sharma', email: 'admin@aicte.gov.in', pass: 'Admin@123' }
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
                    <!-- Step 1: Five Role Selection Options -->
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
                                ← Back to Role Selection
                            </button>
                            <div class="role-form-role-indicator" id="roleFormIndicator"></div>
                        </div>

                        <div id="roleAlert" class="role-alert"></div>

                        <!-- Login Form -->
                        <div id="roleLoginFormContainer" style="display:none;">
                            <form id="roleLoginForm" onsubmit="RoleAuthModal.handleLoginSubmit(event)">
                                <div class="role-form-group">
                                    <label class="role-form-label" for="roleLoginEmail">Email Address</label>
                                    <input type="email" id="roleLoginEmail" class="role-form-input" required placeholder="name@domain.gov.in" autocomplete="email">
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="roleLoginPassword">Password</label>
                                    <input type="password" id="roleLoginPassword" class="role-form-input" required placeholder="••••••••" autocomplete="current-password">
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnRoleLoginSubmit">
                                    <span>Sign In</span> →
                                </button>
                            </form>

                            <!-- Evaluator Quick Fill Area -->
                            <div class="role-quickfill-box" id="roleLoginQuickFillBox">
                                <div class="role-quickfill-title">Evaluator Quick-Fill Credentials:</div>
                                <div id="roleLoginQuickFillButtons"></div>
                            </div>
                        </div>

                        <!-- Sign Up Form (Public Complainant) -->
                        <div id="roleSignupComplainantContainer" style="display:none;">
                            <form id="roleSignupComplainantForm" onsubmit="RoleAuthModal.handleComplainantSignupSubmit(event)">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compFullName">Full Name *</label>
                                        <input type="text" id="compFullName" class="role-form-input" required placeholder="e.g. Rahul Sharma">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compEmail">Email Address *</label>
                                        <input type="email" id="compEmail" class="role-form-input" required placeholder="name@example.com">
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compPhone">Mobile Number</label>
                                        <input type="tel" id="compPhone" class="role-form-input" placeholder="+91 98765 43210">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compType">I am a *</label>
                                        <select id="compType" class="role-form-select" required>
                                            <option value="Student">Student / Enrolled Scholar</option>
                                            <option value="Faculty">Faculty / Teacher / Researcher</option>
                                            <option value="Parent">Parent / Guardian</option>
                                            <option value="Stakeholder">General Citizen / Stakeholder</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compPassword">Password * (Min 6 chars)</label>
                                        <input type="password" id="compPassword" class="role-form-input" required minlength="6" placeholder="••••••••">
                                    </div>
                                    <div class="role-form-group">
                                        <label class="role-form-label" for="compConfirmPassword">Confirm Password *</label>
                                        <input type="password" id="compConfirmPassword" class="role-form-input" required minlength="6" placeholder="••••••••">
                                    </div>
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnRoleSignupSubmit">
                                    <span>Register & Access Complaint Portal</span> →
                                </button>
                            </form>
                        </div>

                        <!-- Sign Up Form (Official Access Request) -->
                        <div id="roleSignupOfficialContainer" style="display:none;">
                            <div class="role-notice-box">
                                <strong>Government Officer Access Policy:</strong> Official accounts for Senior Authority, Regional Offices, and AICTE Bureaus/Cells are provisioned exclusively through administrative verification. You may submit an access request below, or use the pre-configured evaluator test accounts for immediate inspection.
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
                                        <input type="text" id="offOrgUnit" class="role-form-input" required placeholder="e.g. Western Regional Office / RB Bureau">
                                    </div>
                                </div>
                                <div class="role-form-group">
                                    <label class="role-form-label" for="offJustification">Official Justification / Designatory Reference *</label>
                                    <textarea id="offJustification" class="role-form-textarea" rows="2" required placeholder="Specify your designation, employee ID, and official purpose for accessing the monitoring dashboard."></textarea>
                                </div>
                                <button type="submit" class="role-form-btn-submit" id="btnRoleAccessSubmit">
                                    <span>Submit Official Access Request</span> →
                                </button>
                            </form>

                            <div class="role-quickfill-box" style="margin-top:16px;">
                                <div class="role-quickfill-title">For Evaluators / Hackathon Testing:</div>
                                <p style="font-size:0.8rem;color:#475569;margin-bottom:8px;">Switch to the <strong>Sign In</strong> tab to immediately test this role using verified credentials.</p>
                                <button type="button" class="role-quickfill-btn" onclick="RoleAuthModal.switchMode('login')">Switch to Sign In →</button>
                            </div>
                        </div>

                        <!-- Super Admin Sign Up (Restricted) -->
                        <div id="roleSignupAdminContainer" style="display:none;">
                            <div class="role-notice-box warning">
                                <strong>Access Prohibited:</strong> Public self-registration for the <strong>Super Admin</strong> role is strictly disabled under AICTE security directives. Super Admin accounts are provisioned exclusively via secure server-level configuration.
                            </div>
                            <p style="font-size:0.85rem;color:#475569;">
                                If you are an evaluator inspecting system administration capabilities, please switch to <strong>Sign In</strong> and use the verified administrator credentials.
                            </p>
                            <div style="margin-top:16px;">
                                <button type="button" class="role-form-btn-submit" onclick="RoleAuthModal.switchMode('login')">
                                    Switch to Super Admin Sign In →
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
        document.getElementById('roleModalCloseBtn').addEventListener('click', () => RoleAuthModal.close());
        div.addEventListener('click', (e) => {
            if (e.target === div) {
                RoleAuthModal.close();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl && modalEl.classList.contains('active')) {
                RoleAuthModal.close();
            }
        });
    }

    /**
     * Render the 5 options list
     */
    function renderRoleOptions() {
        const grid = document.getElementById('roleCardsGrid');
        if (!grid) return;

        const roleKeys = ['COMPLAINANT', 'SENIOR_AUTHORITY', 'REGIONAL_OFFICER', 'BUREAU_OFFICER', 'SYS_ADMIN'];
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
         * @param {'login'|'signup'} mode
         * @param {string} preselectRoleId (optional)
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

        /**
         * Close modal
         */
        close() {
            if (modalEl) {
                modalEl.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        /**
         * Switch between Login and Sign Up
         */
        switchMode(mode, reRender = true) {
            currentMode = mode;
            const tabLogin = document.getElementById('tabModeLogin');
            const tabSignup = document.getElementById('tabModeSignup');
            const headerTitle = document.getElementById('roleModalHeaderTitle');
            const headerSubtitle = document.getElementById('roleModalHeaderSubtitle');

            if (mode === 'signup') {
                if (tabSignup) tabSignup.classList.add('active');
                if (tabLogin) tabLogin.classList.remove('active');
                if (headerTitle) headerTitle.textContent = 'EduVision — Create Account / Register';
                if (headerSubtitle) headerSubtitle.textContent = 'Select your role to view registration options';
            } else {
                if (tabLogin) tabLogin.classList.add('active');
                if (tabSignup) tabSignup.classList.remove('active');
                if (headerTitle) headerTitle.textContent = 'EduVision — Authorized Sign In';
                if (headerSubtitle) headerSubtitle.textContent = 'Select your role to access your designated workspace';
            }

            if (reRender) {
                if (selectedRoleId) {
                    this.selectRole(selectedRoleId);
                } else {
                    renderRoleOptions();
                }
            }
        },

        /**
         * Return to role selection screen
         */
        backToRoleSelection() {
            selectedRoleId = null;
            const selectionView = document.getElementById('roleSelectionView');
            const formView = document.getElementById('roleFormView');
            if (selectionView) selectionView.style.display = 'block';
            if (formView) formView.classList.remove('active');
            this.clearAlert();
            renderRoleOptions();
        },

        /**
         * Select one of the five roles
         */
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

            // Toggle form containers according to mode and role
            const loginContainer = document.getElementById('roleLoginFormContainer');
            const signupCompContainer = document.getElementById('roleSignupComplainantContainer');
            const signupOffContainer = document.getElementById('roleSignupOfficialContainer');
            const signupAdminContainer = document.getElementById('roleSignupAdminContainer');

            loginContainer.style.display = 'none';
            signupCompContainer.style.display = 'none';
            signupOffContainer.style.display = 'none';
            signupAdminContainer.style.display = 'none';

            if (currentMode === 'login') {
                loginContainer.style.display = 'block';
                this.renderQuickFills(role);
            } else {
                // Sign up mode
                if (roleId === 'COMPLAINANT') {
                    signupCompContainer.style.display = 'block';
                } else if (roleId === 'SYS_ADMIN') {
                    signupAdminContainer.style.display = 'block';
                } else {
                    signupOffContainer.style.display = 'block';
                }
            }
        },

        /**
         * Render evaluator quick-fill buttons
         */
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

            const role = ROLES[selectedRoleId];
            if (!role) return;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Signing in...`;

                const result = await Auth.login(email, password);

                // Role Authorization Guard: Verify user has permission for the chosen role
                const userRole = result.user ? result.user.role : null;
                if (!role.allowedRoles.includes(userRole)) {
                    // Unauthorized role mismatch
                    Auth.logout();
                    this.showAlert(`Unauthorized: Your account role (${userRole ? userRole.replace('_', ' ') : 'Unknown'}) is not authorized for the '${role.name}' workspace. Please choose the correct option.`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Sign In</span> →`;
                    return;
                }

                // Authorized! Redirect to role workspace
                this.showAlert('Authentication successful! Loading authorized dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = role.targetDashboard;
                }, 400);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Sign In</span> →`;
                this.showAlert(error.message || 'Authentication failed. Please check your credentials.', 'error');
            }
        },

        /**
         * Handle Complainant Registration Submission
         */
        async handleComplainantSignupSubmit(event) {
            event.preventDefault();
            this.clearAlert();

            const fullName = document.getElementById('compFullName').value.trim();
            const email = document.getElementById('compEmail').value.trim();
            const phone = document.getElementById('compPhone').value.trim();
            const complainantType = document.getElementById('compType').value;
            const password = document.getElementById('compPassword').value;
            const confirmPassword = document.getElementById('compConfirmPassword').value;
            const submitBtn = document.getElementById('btnRoleSignupSubmit');

            if (password !== confirmPassword) {
                this.showAlert('Passwords do not match. Please re-enter identical passwords.', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Creating Account...`;

                await Auth.registerComplainant({
                    fullName,
                    email,
                    phone,
                    complainantType,
                    password
                });

                this.showAlert('Account successfully registered! Redirecting to Complaint Portal...', 'success');
                setTimeout(() => {
                    window.location.href = 'complaint-portal.html';
                }, 500);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Register & Access Complaint Portal</span> →`;
                this.showAlert(error.message || 'Registration failed. Please check your details.', 'error');
            }
        },

        /**
         * Handle Official Access Request Submission
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
                submitBtn.innerHTML = `<span>Submit Official Access Request</span> →`;
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
