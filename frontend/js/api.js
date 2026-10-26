/**
 * EduVision – Centralized REST API Service
 */
const api = {
  /**
   * Get JWT auth token from localStorage
   */
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Set JWT auth token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  /**
   * Build complete request headers
   */
  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Generic request dispatcher
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config = {
      method: options.method || 'GET',
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {})
      }
    };

    if (options.body) {
      config.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        // Only redirect if not already on login or register page
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
          window.location.href = 'login.html';
        }
        throw new Error('Session expired or unauthorized. Please log in.');
      }

      // Check if response is empty (e.g. 204 No Content)
      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg = (data && data.message) || response.statusText || 'Request failed';
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.warn(`[API] Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  },

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  },

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'POST', body, headers });
  },

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  },

  patch(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'PATCH', body, headers });
  },

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  },

  upload(endpoint, formData) {
    return this.request(endpoint, { method: 'POST', body: formData });
  }
};
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Reusable HTTP API Client (Vanilla JavaScript Fetch API)
 */

const Api = (function() {
    'use strict';

    /**
     * Build full URL with query parameters
     */
    function buildUrl(endpoint, params) {
        const base = CONFIG.API_BASE_URL.replace(/\/+$/, '');
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        let url = base + path;

        if (params && typeof params === 'object') {
            const queryParts = [];
            for (const key in params) {
                if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }
            if (queryParts.length > 0) {
                url += (url.includes('?') ? '&' : '?') + queryParts.join('&');
            }
        }
        return url;
    }

    /**
     * Get authorization headers
     */
    function getHeaders(customHeaders = {}) {
        const headers = {
            'Accept': 'application/json',
            ...customHeaders
        };

        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        return headers;
    }

    /**
     * Handle HTTP response parsing and standard errors
     */
    async function handleResponse(response) {
        const contentType = response.headers.get('content-type');
        let data = null;

        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
        } else {
            try {
                data = await response.text();
            } catch (e) {
                data = null;
            }
        }

        if (!response.ok) {
            // Handle HTTP 401 Unauthorized
            if (response.status === 401) {
                if (!window.location.search.includes('demo=true')) {
                    localStorage.removeItem(CONFIG.TOKEN_KEY);
                    localStorage.removeItem(CONFIG.USER_KEY);
                    if (!window.location.pathname.endsWith('login.html')) {
                        window.location.href = 'login.html?expired=true';
                    }
                }
            }

            let errorMessage = 'An unexpected error occurred.';
            if (data && typeof data === 'object') {
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                }
                if (data.validationErrors && Array.isArray(data.validationErrors)) {
                    errorMessage += ' (' + data.validationErrors.join(', ') + ')';
                }
            } else if (typeof data === 'string' && data.length > 0) {
                errorMessage = data;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        // Return extracted data payload or raw response
        if (data && typeof data === 'object' && data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
            return data.data;
        }
        return data;
    }

    return {
        /**
         * HTTP GET Request
         */
        async get(endpoint, params = {}) {
            const url = buildUrl(endpoint, params);
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(response);
        },

        /**
         * HTTP POST Request
         */
        async post(endpoint, body = {}) {
            const url = buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },

        /**
         * HTTP PATCH Request
         */
        async patch(endpoint, body = {}) {
            const url = buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'PATCH',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },

        /**
         * HTTP File Upload using FormData
         */
        async uploadFile(endpoint, formData) {
            const url = buildUrl(endpoint);
            // Note: Don't set Content-Type header manually for FormData, browser sets multipart boundary
            const headers = getHeaders();
            delete headers['Content-Type'];

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            return handleResponse(response);
        }
    };
})();
