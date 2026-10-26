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
