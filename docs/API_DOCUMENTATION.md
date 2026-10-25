# EduVision – REST API Documentation

This document specifies the REST APIs provided by the **EduVision – Complaint Monitoring Portal** backend.

- **Base URL**: `/api/v1` (Default: `http://localhost:8080/api/v1`)
- **Protocol**: HTTP / HTTPS
- **Data Format**: `application/json`
- **Swagger UI Interactive Console**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3 JSON Specification**: `http://localhost:8080/api-docs`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul.sharma@eduvision.in",
  "role": "STUDENT",
  "institutionName": "ABC Institute of Technology (UP)",
  "password": "Student@123",
  "phoneNumber": "+91 9876543210"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "email": "rahul.sharma@eduvision.in",
    "fullName": "Rahul Sharma",
    "phoneNumber": "+91 9876543210",
    "role": "STUDENT",
    "institutionName": "ABC Institute of Technology (UP)",
    "avatarUrl": "assets/images/avatar-rahul.svg"
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "rahul.sharma@eduvision.in",
  "password": "Student@123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "email": "rahul.sharma@eduvision.in",
    "fullName": "Rahul Sharma",
    "role": "STUDENT",
    "institutionName": "ABC Institute of Technology (UP)"
  }
}
```

### 1.3 User Logout
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Access**: Authenticated
- **Response** (`200 OK`):
```json
{
  "message": "Logged out successfully"
}
```

### 1.4 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Access**: Authenticated (`Bearer <token>`)

### 1.5 Change Password
- **Method**: `POST`
- **Path**: `/api/v1/auth/change-password`
- **Access**: Authenticated (`Bearer <token>`)
- **Request Body**:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

## 2. Complaint & Grievance Endpoints

### 2.1 File a Grievance
- **Method**: `POST`
- **Path**: `/api/v1/complaints`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "complainantName": "Rahul Sharma",
  "complainantEmail": "rahul.sharma@eduvision.in",
  "institutionName": "ABC Institute of Technology (UP)",
  "institutionType": "Autonomous College",
  "institutionState": "Uttar Pradesh",
  "category": "Academic Issues",
  "subject": "Delayed mid-term semester examination schedule publication",
  "description": "Examination timetable published with only 3 days advance notice conflicting with scheduled internships.",
  "incidentDate": "2026-10-20"
}
```
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "trackingId": "CMP-2026-000103",
  "institutionName": "ABC Institute of Technology (UP)",
  "category": "Academic Issues",
  "subject": "Delayed mid-term semester examination schedule publication",
  "status": "SUBMITTED",
  "statusLabel": "Submitted",
  "createdAt": "2026-10-22T09:30:00"
}
```

### 2.2 Get My Grievances
- **Method**: `GET`
- **Path**: `/api/v1/complaints/my`
- **Access**: Authenticated

### 2.3 Get Full Complaint Details
- **Method**: `GET`
- **Path**: `/api/v1/complaints/{trackingId}`
- **Access**: Authorized Owner or Staff

### 2.4 Public Tracking Endpoint (Safe View)
- **Method**: `GET`
- **Path**: `/api/v1/complaints/track/{trackingId}`
- **Access**: Public
- **Description**: Returns status, dates, and milestones without exposing complainant email, phone, or confidential details.

---

## 3. Dashboard Endpoints

### 3.1 Dashboard Statistics Summary
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/summary`
- **Access**: Public / Authenticated
- **Response** (`200 OK`):
```json
{
  "total": 3,
  "inProcess": 1,
  "resolved": 1,
  "rejected": 0,
  "underReview": 1,
  "submitted": 0,
  "closed": 0,
  "inProcessPercent": "33%",
  "resolvedPercent": "33%",
  "rejectedPercent": "0%",
  "underReviewPercent": "33%",
  "lastUpdated": "24 Oct 2026, 10:42 AM"
}
```

### 3.2 Recent Complaints
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/recent-complaints`
- **Access**: Public / Authenticated

---

## 4. Notifications Endpoints

### 4.1 Get User Notifications
- **Method**: `GET`
- **Path**: `/api/v1/notifications`
- **Access**: Authenticated

### 4.2 Mark Notification as Read
- **Method**: `PATCH`
- **Path**: `/api/v1/notifications/{id}/read`
- **Access**: Authenticated

### 4.3 Mark All Notifications as Read
- **Method**: `PATCH`
- **Path**: `/api/v1/notifications/read-all`
- **Access**: Authenticated

---

## 5. Support & Guidelines Endpoints

### 5.1 Get Guidelines
- **Method**: `GET`
- **Path**: `/api/v1/guidelines`
- **Access**: Public

### 5.2 Submit Help Desk Request
- **Method**: `POST`
- **Path**: `/api/v1/support-requests`
- **Access**: Public

---

## 6. Admin & Officer Endpoints

### 6.1 View All Complaints
- **Method**: `GET`
- **Path**: `/api/v1/admin/complaints`
- **Access**: `ADMIN`, `AICTE_OFFICER`, `INSTITUTION_HEAD`, `HOD`

### 6.2 Transition Complaint Status
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/complaints/{trackingId}/status`
- **Access**: `ADMIN`, `AICTE_OFFICER`
- **Request Body**:
```json
{
  "status": "REJECTED",
  "remarks": "Matter is currently sub-judice before High Court.",
  "rejectionReason": "Section 14(b) restriction: ongoing judicial proceedings.",
  "internalNote": "Verified court writ petition reference 4921/2026."
}
```

### 6.3 Assign Officer
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/complaints/{trackingId}/assignment`
- **Access**: `ADMIN`, `AICTE_OFFICER`

### 6.4 Export CSV Report
- **Method**: `GET`
- **Path**: `/api/v1/admin/reports/complaints`
- **Access**: `ADMIN`, `AICTE_OFFICER`
- **Response**: `text/csv` attachment.
