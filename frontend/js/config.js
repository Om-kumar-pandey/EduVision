/**
 * EduVision – Configuration and Constants
 */
const CONFIG = {
  // Base backend API URL
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api/v1'
    : '/api/v1',

  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',

    // Dashboard
    DASHBOARD_SUMMARY: '/dashboard/summary',
    RECENT_COMPLAINTS: '/dashboard/recent-complaints',

    // Complaints
    COMPLAINTS: '/complaints',
    MY_COMPLAINTS: '/complaints/my',
    TRACK: '/complaints/track',
    ATTACHMENTS: '/complaints/{id}/attachments',

    // Notifications
    NOTIFICATIONS: '/notifications',
    MARK_NOTIFICATION_READ: '/notifications/{id}/read',
    MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',

    // Profile
    PROFILE: '/profile',

    // Support & Guidelines
    GUIDELINES: '/guidelines',
    SUPPORT_REQUEST: '/support-requests',

    // Admin & Officers
    ADMIN_COMPLAINTS: '/admin/complaints',
    ADMIN_UPDATE_STATUS: '/admin/complaints/{id}/status',
    ADMIN_ASSIGN: '/admin/complaints/{id}/assignment',
    ADMIN_NOTES: '/admin/complaints/{id}/notes',
    ADMIN_EXPORT_CSV: '/admin/reports/complaints',
    ADMIN_USERS: '/admin/users'
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'eduvision_jwt_token',
    USER_DATA: 'eduvision_user_profile',
    THEME: 'eduvision_theme'
  },

  // Complaint Categories
  CATEGORIES: [
    'Academic Issues',
    'Admission Related',
    'Examination',
    'Result & Evaluation',
    'Fee Related',
    'Fee Refund',
    'Scholarship',
    'Attendance Related',
    'Faculty Related',
    'Infrastructure',
    'Hostel & Accommodation',
    'Transport & Parking',
    'Library & Laboratory',
    'Placement & Internship',
    'Harassment or Misconduct',
    'Ragging & Bullying',
    'Discrimination',
    'Student Welfare',
    'Certificate & Documents',
    'Rules & Policy Violation',
    'Other'
  ],

  // Institution Types
  INSTITUTION_TYPES: [
    'Central University',
    'State University',
    'Deemed University',
    'Private University',
    'Autonomous College',
    'Affiliated Engineering College',
    'Polytechnic Institute',
    'Management Institute',
    'Other'
  ],

  // Complaint Statuses
  STATUSES: {
    SUBMITTED: { label: 'Submitted', class: 'submitted' },
    UNDER_REVIEW: { label: 'Under Review', class: 'under-review' },
    IN_PROCESS: { label: 'In Process', class: 'in-process' },
    RESOLVED: { label: 'Resolved', class: 'resolved' },
    REJECTED: { label: 'Rejected', class: 'rejected' },
    CLOSED: { label: 'Closed', class: 'closed' }
  },

  // Fallback Reference Data matching screenshot
  FALLBACK_DATA: {
    user: {
      id: 1,
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@eduvision.in',
      role: 'STUDENT',
      institutionName: 'ABC Institute of Technology (UP)'
    },
    stats: {
      total: 3,
      inProcess: 1,
      resolved: 1,
      rejected: 0,
      underReview: 1,
      inProcessPercent: '33%',
      resolvedPercent: '33%',
      rejectedPercent: '0%',
      underReviewPercent: '33%',
      lastUpdated: '24 Oct 2026, 10:42 AM'
    },
    recentComplaints: [
      {
        id: 'CMP-2026-000103',
        date: '22 Oct 2026',
        institution: 'ABC Institute of Technology (UP)',
        category: 'Academic Issues',
        status: 'IN_PROCESS',
        statusLabel: 'In Process',
        subject: 'Delayed mid-term semester examination schedule publication'
      },
      {
        id: 'CMP-2026-000102',
        date: '18 Oct 2026',
        institution: 'Global Engineering College (MH)',
        category: 'Infrastructure',
        status: 'UNDER_REVIEW',
        statusLabel: 'Under Review',
        subject: 'Malfunctioning laboratory equipment in Computer Science dept'
      },
      {
        id: 'CMP-2026-000101',
        date: '12 Oct 2026',
        institution: 'Sunrise College of Engineering (KA)',
        category: 'Fee Related',
        status: 'RESOLVED',
        statusLabel: 'Resolved',
        subject: 'Discrepancy in tuition fee receipt and late penalty reversal'
      },
      {
        id: 'CMP-2026-000100',
        date: '05 Oct 2026',
        institution: 'Techno Institute of Technology (Delhi)',
        category: 'Faculty Related',
        status: 'RESOLVED',
        statusLabel: 'Resolved',
        subject: 'Unavailability of designated mentor for final year thesis'
      },
      {
        id: 'CMP-2026-000099',
        date: '28 Sep 2026',
        institution: 'Rohan Institute of Technology (BR)',
        category: 'Examination',
        status: 'IN_PROCESS',
        statusLabel: 'In Process',
        subject: 'Evaluation dispute regarding third semester practical grades'
      }
    ],
    notifications: [
      {
        id: 1,
        title: 'Complaint In Process',
        message: 'Your complaint CMP-2026-000103 is now being reviewed by AICTE Officer.',
        read: false,
        time: '2 hours ago'
      },
      {
        id: 2,
        title: 'Complaint Resolved',
        message: 'Complaint CMP-2026-000101 has been resolved with remarks from the institution.',
        read: false,
        time: '1 day ago'
      },
      {
        id: 3,
        title: 'New Policy Update',
        message: 'AICTE has revised the grievance resolution timeline to 15 business days.',
        read: false,
        time: '3 days ago'
      }
    ]
  }
};
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
