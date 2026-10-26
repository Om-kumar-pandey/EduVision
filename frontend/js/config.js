/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * EduVision — Integrated Institution Complaint Monitoring and Status Dashboard
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
        REGISTER_COMPLAINANT: '/auth/register-complainant',
        REQUEST_OFFICIAL_ACCESS: '/auth/request-official-access',
        REQUEST_OFFICER_ACCESS: '/auth/request-officer-access',
        VERIFY_ACTIVATION_TOKEN: (token) => `/auth/verify-activation-token?token=${encodeURIComponent(token)}`,
        ACTIVATE_ACCOUNT: '/auth/activate-account',
        OFFICER_REQUESTS: '/admin/officer-requests',
        APPROVE_OFFICER_REQUEST: (id) => `/admin/officer-requests/${id}/approve`,
        REJECT_OFFICER_REQUEST: (id) => `/admin/officer-requests/${id}/reject`,

        // Complainant & Public Tracking
        FILE_COMPLAINT: '/complainant/complaints',
        MY_COMPLAINTS: '/complainant/my-complaints',
        TRACK_COMPLAINT_PUBLIC: (ref) => `/complaints/track/${encodeURIComponent(ref)}`,

        // Regional Office
        REGIONAL_CASES: '/regional/cases',
        REGIONAL_STATS: '/regional/stats',
        REGIONAL_ESCALATE: (id) => `/regional/cases/${id}/escalate`,

        // Central Monitoring / Senior Authority (Dashboard 1)
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

        // Overlaps & Hybrid Matching
        OVERLAPS: '/overlaps',
        OVERLAPS_STATS: '/overlaps/stats',
        OVERLAP_DETAIL: (id) => `/overlaps/${id}`,
        REVIEW_OVERLAP: (id) => `/overlaps/${id}/review`,
        REOPEN_OVERLAP: (id) => `/overlaps/${id}/reopen`,
        REANALYZE_OVERLAPS: '/overlaps/reanalyze',
        COORDINATION_REQUESTS: '/coordination-requests',
        COORDINATION_RESPOND: (id) => `/coordination-requests/${id}/respond`,

        // Admin & Super Admin Management
        ADMIN_STATS: '/admin/dashboard/stats',
        ADMIN_USERS: '/admin/users',
        ADMIN_USER_UPDATE: (id) => `/admin/users/${id}`,
        ADMIN_INSTITUTIONS: '/admin/institutions',
        ADMIN_INSTITUTION_UPDATE: (id) => `/admin/institutions/${id}`,
        ADMIN_BUREAUS: '/admin/bureaus',
        ADMIN_REGIONS: '/admin/regions',
        ADMIN_CASES: '/admin/cases',
        ADMIN_CASE_ASSIGN: (id) => `/admin/cases/${id}/assign`,
        ADMIN_CASE_STATUS: (id) => `/admin/cases/${id}/status`,
        ADMIN_CASE_NOTE: (id) => `/admin/cases/${id}/notes`,
        ADMIN_CASE_REQUEST_RESPONSE: (id) => `/admin/cases/${id}/request-response`,
        ADMIN_CASE_INSTITUTION_RESPONSE: (id) => `/admin/cases/${id}/institution-response`,
        ADMIN_CASE_DUPLICATE_REVIEW: (id) => `/admin/cases/${id}/review-duplicate`,
        ADMIN_REPORTS: '/admin/reports',
        ADMIN_SETTINGS: '/admin/settings',
        ADMIN_SUPPORT_TICKETS: '/admin/support-tickets',
        GLOBAL_SEARCH: (q) => `/admin/global-search?query=${encodeURIComponent(q)}`,
        NOTIFICATIONS: '/admin/notifications',
        CSV_PREVIEW: '/admin/import-csv/preview',
        CSV_IMPORT: '/admin/import-csv',
        IMPORT_BATCHES: '/admin/import-batches',
        IMPORT_BATCH_DETAIL: (id) => `/admin/import-batches/${id}`,
        AUDIT_LOGS: '/admin/audit-logs',
        TRANSFER_REQUESTS: '/transfer-requests',
        TRANSFER_DECISION: (id) => `/transfer-requests/${id}/decision`,
        SUPERVISORY_TRANSFER_REQUESTS: '/transfer-requests',
        SUPERVISORY_TRANSFER_DECISION: (id) => `/transfer-requests/${id}/decision`,
        SUPERVISORY_ACTIVITY: '/dashboard/activity-history',
        SUPERVISORY_REPORTS: '/dashboard/reports',
        REGION_DISTRIBUTION: '/dashboard/region-distribution'
    },

    // UI Pagination defaults
    DEFAULT_PAGE_SIZE: 10,

    // Project Meta
    PROJECT_NAME: 'AICTE Integrated Institution Complaint Monitoring & Tracking System',
    SYSTEM_CODE: 'AICTE-CMS-2026',
    VERSION: '2.0.0'
};

// Prevent modifications
Object.freeze(CONFIG);
