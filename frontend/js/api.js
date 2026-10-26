/**
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
