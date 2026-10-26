# AICTE Integrated Institution Complaint Monitoring & Status Dashboard
## RESTful API Documentation & Endpoint Specification
**AICTE Integrated Institution Complaint Monitoring & Tracking System**
**Base URL:** `http://localhost:8080/api/v1`

---

### Authentication Headers
For all protected endpoints, pass the Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <jwt-token>
```

---

### 1. Authentication Endpoints

#### POST `/auth/login`
- **Access:** Public
- **Description:** Authenticate officer using email and password.
- **Request Body:**
```json
{
  "email": "monitor@aicte.gov.in",
  "password": "Monitor@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "user": {
      "id": 2,
      "email": "monitor@aicte.gov.in",
      "fullName": "Smt. Sunita Verma",
      "role": "CENTRAL_MONITOR",
      "bureauId": null,
      "bureauCode": null,
      "bureauName": null,
      "designation": "Director, Central Monitoring & Quality Assurance",
      "isActive": true
    }
  }
}
```

#### GET `/auth/me`
- **Access:** Authenticated
- **Description:** Retrieve currently logged-in user profile.

#### POST `/auth/logout`
- **Access:** Public

---

### 2. Dashboard 1: Central Monitoring Endpoints

#### GET `/dashboard/central-kpis`
- **Access:** `CENTRAL_MONITOR`, `SYS_ADMIN`
- **Description:** Fetches real-time counts for all 7 key performance indicators.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCases": 5,
    "pendingCases": 1,
    "underProcessCases": 3,
    "disposedCases": 1,
    "transferredCases": 1,
    "overdueCases": 1,
    "potentialOverlaps": 1
  }
}
```

#### GET `/dashboard/bureau-workload`
- **Access:** `CENTRAL_MONITOR`, `SYS_ADMIN`
- **Description:** Real-time case distribution breakdown per statutory Bureau.

#### GET `/dashboard/monthly-trends`
- **Access:** `CENTRAL_MONITOR`, `SYS_ADMIN`
- **Description:** Inflow vs Disposal historical trajectory over the past 6 months for Chart.js.

#### GET `/dashboard/alerts`
- **Access:** `CENTRAL_MONITOR`, `SYS_ADMIN`
- **Description:** Active high-priority overdue complaints and cross-bureau overlap alerts requiring supervisory review.

---

### 3. Dashboard 2: Cases & Bureau Workspace Endpoints

#### GET `/cases/queue`
- **Access:** `BUREAU_OFFICER`, `CENTRAL_MONITOR`, `SYS_ADMIN`
- **Query Parameters:** `bureauId`, `status`, `priority`, `category`, `query`, `sortBy`, `sortDir`, `page`, `size`
- **Description:** Paginated case queue. For Bureau Officers, server-side data scoping automatically restricts records to their assigned Bureau.

#### GET `/cases/{id}`
- **Access:** Authenticated (Bureau-scoping enforced for officers)
- **Description:** Comprehensive case details with institution metadata and status deadlines.

#### POST `/cases`
- **Access:** `BUREAU_OFFICER`, `SYS_ADMIN`
- **Description:** Register new grievance intake with verified AICTE Permanent ID check and overlap triggering.
- **Request Body:**
```json
{
  "permanentId": "1-1097234567",
  "bureauId": 1,
  "title": "Severe Faculty Shortage in Computer Engineering",
  "category": "Faculty Irregularities",
  "priority": "HIGH",
  "description": "Cadre ratio deficit of 38% observed during surprise inspection."
}
```

#### PATCH `/cases/{id}/status`
- **Access:** `BUREAU_OFFICER`, `SYS_ADMIN`
- **Description:** Update case status. Mandatory action remarks required; creates immutable append-only history entry.
- **Request Body:**
```json
{
  "status": "UNDER_PROCESS",
  "remarks": "Formal show cause notice issued to Principal.",
  "nextAction": "Await explanation reply",
  "nextActionDueDate": "2026-11-10T17:00:00"
}
```

#### POST `/cases/{id}/transfer-requests`
- **Access:** `BUREAU_OFFICER`, `SYS_ADMIN`
- **Description:** Submit inter-Bureau transfer request. Case ID is strictly preserved; case is never duplicated or closed.
- **Request Body:**
```json
{
  "toBureauId": 2,
  "reason": "Student capitation fee complaint dimension requires PGRC inquiry."
}
```

#### GET `/cases/{id}/history`
- **Access:** Authenticated
- **Description:** Chronological, immutable action timeline of all remarks and status updates.

---

### 4. Dashboard 3: Institution & Case Tracking Endpoints

#### GET `/institutions`
- **Access:** Authenticated
- **Query Parameters:** `query` (Permanent ID, Name, City, State), `region`, `page`, `size`
- **Description:** Search verified technical institutions registered with AICTE.

#### GET `/institutions/{id}`
- **Access:** Authenticated
- **Description:** Verified institution profile metadata and approval status.

#### GET `/institutions/{id}/history`
- **Access:** Authenticated
- **Description:** Consolidated chronological timeline of all complaints filed against the institution. Distinct records remain separate (never merged).

#### GET `/institutions/{id}/overlaps`
- **Access:** Authenticated
- **Description:** Active cross-Bureau overlap alerts flagged for this institution.

---

### 5. Overlap Management Endpoints

#### GET `/overlaps`
- **Access:** Authenticated
- **Description:** List detected and reviewed cross-Bureau overlap alerts.

#### PATCH `/overlaps/{id}/review`
- **Access:** `CENTRAL_MONITOR`, `BUREAU_OFFICER`, `SYS_ADMIN`
- **Description:** Classify an overlap alert (`RELATED`, `UNRELATED`, `REQUIRES_COORDINATION`) with mandatory remarks.
- **Request Body:**
```json
{
  "classification": "REQUIRES_COORDINATION",
  "reviewRemarks": "Joint inquiry recommended between Regulation Bureau and PGRC."
}
```

---

### 6. Dashboard 4: System Administration & Data Import Endpoints

#### GET `/admin/users`
- **Access:** `SYS_ADMIN`
- **Description:** List platform users and role assignments.

#### POST `/admin/users`
- **Access:** `SYS_ADMIN`
- **Description:** Create officer or monitoring account with BCrypt strength 12 password hashing.

#### PATCH `/admin/users/{id}`
- **Access:** `SYS_ADMIN`
- **Description:** Update role, bureau affiliation, or activate/deactivate account.

#### POST `/admin/import-csv/preview`
- **Access:** `SYS_ADMIN`
- **Description:** Multipart CSV upload validation. Validates columns, Permanent IDs, and duplicate rows; returns row-level preview.

#### POST `/admin/import-csv`
- **Access:** `SYS_ADMIN`
- **Description:** Ingest validated CSV rows into MySQL, generate unique Batch ID, and log failed rows into error audit.

#### GET `/admin/import-batches`
- **Access:** `SYS_ADMIN`
- **Description:** List historical bulk upload batches with execution status.

#### GET `/admin/import-batches/{id}`
- **Access:** `SYS_ADMIN`
- **Description:** Detailed batch report with row-level error breakdown.

#### GET `/admin/audit-logs`
- **Access:** `SYS_ADMIN`
- **Description:** System-wide compliance and security audit trail.

#### PATCH `/admin/transfer-requests/{id}/decision`
- **Access:** `SYS_ADMIN`
- **Description:** Approve or reject inter-Bureau transfer request. Case ID is preserved.
- **Request Body:**
```json
{
  "approve": true,
  "remarks": "Approved by CIO. Reassigned to PGRC."
}
```
