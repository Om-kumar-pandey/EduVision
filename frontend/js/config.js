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
    'Examination',
    'Fee Related',
    'Infrastructure',
    'Faculty Related',
    'Harassment or Misconduct',
    'Scholarship',
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
