/**
 * EduVision – Authentication Service & Role Guard
 */
const auth = {
  /**
   * Get currently logged-in user profile from storage
   */
  getUser() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  /**
   * Save user profile in storage
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!api.getToken();
  },

  /**
   * Perform login with email and password
   */
  async login(email, password) {
    try {
      const response = await api.post(CONFIG.ENDPOINTS.LOGIN, { email, password });
      if (response && response.token) {
        api.setToken(response.token);
        this.setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      // If backend is offline or returns error in demo mode, provide seamless demo fallback for Rahul Sharma or Admin
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('Backend unavailable. Using demo authentication session.');
        let demoUser = { ...CONFIG.FALLBACK_DATA.user };
        if (email.includes('admin') || email.includes('officer')) {
          demoUser = {
            id: 99,
            fullName: 'Dr. S. K. Verma',
            email: email,
            role: email.includes('admin') ? 'ADMIN' : 'AICTE_OFFICER',
            institutionName: 'AICTE Headquarters, New Delhi'
          };
        }
        api.setToken('demo-jwt-token-' + Date.now());
        this.setUser(demoUser);
        return { success: true, user: demoUser, isDemo: true };
      }
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(registrationData) {
    try {
      const response = await api.post(CONFIG.ENDPOINTS.REGISTER, registrationData);
      if (response && response.token) {
        api.setToken(response.token);
        this.setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: true };
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const demoUser = {
          id: Date.now(),
          fullName: registrationData.fullName,
          email: registrationData.email,
          role: registrationData.role || 'STUDENT',
          institutionName: registrationData.institutionName || 'Demo Institute'
        };
        api.setToken('demo-jwt-token-' + Date.now());
        this.setUser(demoUser);
        return { success: true, user: demoUser, isDemo: true };
      }
      throw error;
    }
  },

  /**
   * Fetch latest profile from backend /auth/me
   */
  async fetchProfile() {
    try {
      const user = await api.get(CONFIG.ENDPOINTS.ME);
      if (user) {
        this.setUser(user);
        return user;
      }
    } catch (error) {
      console.warn('Failed to refresh profile from backend:', error.message);
    }
    return this.getUser() || CONFIG.FALLBACK_DATA.user;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post(CONFIG.ENDPOINTS.LOGOUT, {});
    } catch (e) {
      // ignore
    } finally {
      api.setToken(null);
      this.setUser(null);
      window.location.href = 'login.html';
    }
  },

  /**
   * Format role string for display (e.g., AICTE_OFFICER -> "AICTE Officer")
   */
  formatRole(role) {
    if (!role) return 'Student';
    switch (role.toUpperCase()) {
      case 'STUDENT': return 'Student';
      case 'TEACHER': return 'Teacher';
      case 'HOD': return 'Head of Dept.';
      case 'INSTITUTION_HEAD': return 'Institution Head';
      case 'AICTE_OFFICER': return 'AICTE Officer';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  },

  /**
   * Guard a page for authorized roles
   */
  requireAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      // For presentation ease, seed the default user if unauthenticated
      this.setUser(CONFIG.FALLBACK_DATA.user);
      api.setToken('demo-active-token');
    }

    const user = this.getUser();
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      alert('Access restricted: Your role does not have permission to view this page.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * EduVision — Integrated Institution Complaint Monitoring and Status Dashboard
 * Authentication & Role Management Module
 */

const Auth = (function() {
    'use strict';

    return {
        /**
         * Get stored auth token
         */
        getToken() {
            return localStorage.getItem(CONFIG.TOKEN_KEY);
        },

        /**
         * Get stored user profile
         */
        getUser() {
            try {
                const userJson = localStorage.getItem(CONFIG.USER_KEY);
                return userJson ? JSON.parse(userJson) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Check if a user is currently authenticated
         */
        isAuthenticated() {
            return !!this.getToken();
        },

        /**
         * Execute login with backend API
         */
        async login(email, password) {
            const result = await Api.post(CONFIG.ENDPOINTS.LOGIN, { email, password });
            if (result && result.token) {
                localStorage.setItem(CONFIG.TOKEN_KEY, result.token);
                if (result.user) {
                    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(result.user));
                }
                return result;
            }
            throw new Error('Invalid authentication response from server.');
        },

        /**
         * Register a new public complainant account
         */
        async registerComplainant(formData) {
            const result = await Api.post(CONFIG.ENDPOINTS.REGISTER_COMPLAINANT, formData);
            if (result && result.token) {
                localStorage.setItem(CONFIG.TOKEN_KEY, result.token);
                if (result.user) {
                    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(result.user));
                }
                return result;
            }
            throw new Error('Registration failed. Please check your information and try again.');
        },

        /**
         * Request official access for Senior Authority, Regional Office, or Bureaus/Cells
         */
        async requestOfficialAccess(formData) {
            return await Api.post(CONFIG.ENDPOINTS.REQUEST_OFFICIAL_ACCESS, formData);
        },

        /**
         * Submit Bureau / Cell Officer Registration Request
         */
        async requestOfficerAccess(formData) {
            return await Api.post(CONFIG.ENDPOINTS.REQUEST_OFFICER_ACCESS, formData);
        },

        /**
         * Activate officer account with one-time security token
         */
        async activateAccount(payload) {
            const result = await Api.post(CONFIG.ENDPOINTS.ACTIVATE_ACCOUNT, payload);
            if (result && result.token) {
                localStorage.setItem(CONFIG.TOKEN_KEY, result.token);
                if (result.user) {
                    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(result.user));
                }
            }
            return result;
        },

        /**
         * Logout user and clear tokens
         */
        async logout() {
            try {
                await Api.post(CONFIG.ENDPOINTS.LOGOUT);
            } catch (e) {
                // Ignore API failure on logout
            } finally {
                localStorage.removeItem(CONFIG.TOKEN_KEY);
                localStorage.removeItem(CONFIG.USER_KEY);
                window.location.href = 'index.html';
            }
        },

        /**
         * Fetch fresh user profile from backend
         */
        async fetchCurrentUser() {
            try {
                const user = await Api.get(CONFIG.ENDPOINTS.ME);
                if (user) {
                    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
                }
                return user;
            } catch (e) {
                return this.getUser();
            }
        },

        /**
         * Determine redirect URL based on user role
         */
        getDefaultDashboardUrl(role) {
            switch (role) {
                case 'COMPLAINANT':
                    return 'complaint-portal.html';
                case 'REGIONAL_OFFICER':
                    return 'regional-dashboard.html';
                case 'CENTRAL_MONITOR':
                case 'SENIOR_AUTHORITY':
                    return 'central-dashboard.html';
                case 'BUREAU_OFFICER':
                    return 'bureau-workspace.html';
                case 'SYS_ADMIN':
                    return 'admin-dashboard.html';
                default:
                    return 'index.html';
            }
        },

        /**
         * Format user-friendly role label
         */
        formatRoleLabel(user) {
            if (!user) return 'Guest';
            switch (user.role) {
                case 'COMPLAINANT':
                    return 'Complainant';
                case 'REGIONAL_OFFICER':
                    return `Regional Officer (${user.region || 'RO'})`;
                case 'CENTRAL_MONITOR':
                case 'SENIOR_AUTHORITY':
                    return 'Senior Authority';
                case 'BUREAU_OFFICER':
                    return `Bureau Officer (${user.bureauCode || 'Bureau'})`;
                case 'SYS_ADMIN':
                    return 'Super Admin';
                default:
                    return user.role.replace('_', ' ');
            }
        },

        /**
         * Enforce route protection and role-based navigation on page load
         */
        checkPageAccess(allowedRoles = []) {
            if (!this.isAuthenticated()) {
                window.location.href = 'login.html';
                return false;
            }

            const user = this.getUser();
            if (!user) {
                window.location.href = 'login.html';
                return false;
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                // Redirect user to their own designated dashboard
                window.location.href = this.getDefaultDashboardUrl(user.role);
                return false;
            }

            // Update user badge in UI
            this.updateHeaderUI(user);
            this.filterSidebarNav(user);
            return true;
        },

        /**
         * Update top navbar user details
         */
        updateHeaderUI(user) {
            const userNameEl = document.getElementById('headerUserName');
            const userRoleEl = document.getElementById('headerUserRole');
            const userBureauEl = document.getElementById('headerUserBureau');
            const userAvatarEl = document.getElementById('headerUserAvatar');

            if (userNameEl && user.fullName) {
                userNameEl.textContent = user.fullName;
            }
            if (userRoleEl && user.role) {
                userRoleEl.textContent = this.formatRoleLabel(user);
            }
            if (userBureauEl) {
                if (user.bureauCode) {
                    userBureauEl.textContent = user.bureauCode;
                    userBureauEl.style.display = 'inline-block';
                } else if (user.region) {
                    userBureauEl.textContent = user.region + ' Region';
                    userBureauEl.style.display = 'inline-block';
                } else {
                    userBureauEl.style.display = 'none';
                }
            }
            if (userAvatarEl && user.fullName) {
                userAvatarEl.textContent = user.fullName.charAt(0).toUpperCase();
            }

            // Bind logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Common.confirm('Are you sure you want to log out of the EduVision Platform?', () => {
                        this.logout();
                    });
                });
            }
        },

        /**
         * Filter sidebar navigation according to user role
         */
        filterSidebarNav(user) {
            const centralLink = document.getElementById('navCentral');
            const bureauLink = document.getElementById('navBureau');
            const instLink = document.getElementById('navInstitution');
            const regionalLink = document.getElementById('navRegional');
            const adminLink = document.getElementById('navAdmin');
            const portalLink = document.getElementById('navPortal');

            if (user.role === 'BUREAU_OFFICER') {
                if (centralLink) centralLink.style.display = 'none';
                if (adminLink) adminLink.style.display = 'none';
                if (regionalLink) regionalLink.style.display = 'none';
                if (portalLink) portalLink.style.display = 'none';
            } else if (user.role === 'REGIONAL_OFFICER') {
                if (adminLink) adminLink.style.display = 'none';
                if (bureauLink) bureauLink.style.display = 'none';
                if (portalLink) portalLink.style.display = 'none';
            } else if (user.role === 'CENTRAL_MONITOR') {
                if (adminLink) adminLink.style.display = 'none';
                if (bureauLink) bureauLink.style.display = 'none';
                if (portalLink) portalLink.style.display = 'none';
            } else if (user.role === 'COMPLAINANT') {
                if (centralLink) centralLink.style.display = 'none';
                if (adminLink) adminLink.style.display = 'none';
                if (bureauLink) bureauLink.style.display = 'none';
                if (regionalLink) regionalLink.style.display = 'none';
                if (instLink) instLink.style.display = 'none';
            }
            // SYS_ADMIN has access to all views
        }
    };
})();
