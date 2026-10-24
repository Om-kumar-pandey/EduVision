/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Frontend Configuration
 */

const CONFIG = {
    // API Base URL - Configurable for local Spring Boot development
    // Auto-detects if frontend is served by Spring Boot on port 8080 or standalone static server
    API_BASE_URL: (function() {
        if (window.location.port === '8080') {
            return window.location.origin + '/api/v1';
        }
        return 'http://localhost:8080/api/v1';
    })(),

    // Authentication token storage key
    TOKEN_KEY: 'aicte_auth_token',
    USER_KEY: 'aicte_user_profile',

    // Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',

        // Central Monitoring (Dashboard 1)
        CENTRAL_KPIS: '/dashboard/central-kpis',
        BUREAU_WORKLOAD: '/dashboard/bureau-workload',
        MONTHLY_TRENDS: '/dashboard/monthly-trends',
        ALERTS: '/dashboard/alerts',

        // Cases & Bureau Workspace (Dashboard 2)
        CASES_QUEUE: '/cases/queue',
        CASE_DETAIL: (id) => `/cases/${id}`,
        CREATE_CASE: '/cases',
        UPDATE_STATUS: (id) => `/cases/${id}/status`,
        ADD_ACTION: (id) => `/cases/${id}/actions`,
        CASE_HISTORY: (id) => `/cases/${id}/history`,
        TRANSFER_REQUEST: (id) => `/cases/${id}/transfer-requests`,

        // Institution Tracking (Dashboard 3)
        INSTITUTIONS: '/institutions',
        INSTITUTION_DETAIL: (id) => `/institutions/${id}`,
        INSTITUTION_BY_PERMANENT_ID: (permId) => `/institutions/permanent-id/${encodeURIComponent(permId)}`,
        INSTITUTION_HISTORY: (id) => `/institutions/${id}/history`,
        INSTITUTION_OVERLAPS: (id) => `/institutions/${id}/overlaps`,
        INSTITUTION_STATS: (id) => `/institutions/${id}/stats`,

        // Overlaps
        OVERLAPS: '/overlaps',
        OVERLAP_DETAIL: (id) => `/overlaps/${id}`,
        REVIEW_OVERLAP: (id) => `/overlaps/${id}/review`,

        // Admin & CSV Import (Dashboard 4)
        ADMIN_USERS: '/admin/users',
        ADMIN_USER_UPDATE: (id) => `/admin/users/${id}`,
        ADMIN_BUREAUS: '/admin/bureaus',
        CSV_PREVIEW: '/admin/import-csv/preview',
        CSV_IMPORT: '/admin/import-csv',
        IMPORT_BATCHES: '/admin/import-batches',
        IMPORT_BATCH_DETAIL: (id) => `/admin/import-batches/${id}`,
        AUDIT_LOGS: '/admin/audit-logs',
        TRANSFER_REQUESTS: '/admin/transfer-requests',
        TRANSFER_DECISION: (id) => `/admin/transfer-requests/${id}/decision`
    },

    // UI Pagination defaults
    DEFAULT_PAGE_SIZE: 10,

    // Project Meta
    PROJECT_NAME: 'AICTE Integrated Institution Complaint Monitoring & Status Dashboard',
    PROBLEM_ID: '26264',
    VERSION: '1.0.0-SIH2026'
};

// Prevent modifications
Object.freeze(CONFIG);
