# EduVision – Complaint Monitoring Portal

A centralized AICTE dashboard for tracking institution-related complaints across the Regulation Bureau, PGRC, and other cells. It brings case status, ownership, action history, and reports together, while flagging potential overlaps and deadline risks to help officials coordinate effectively and resolve grievances on time.

> **Transparent • Responsive • Better Education**  
> Full-Stack Technical Education Grievance Redressal and Institutional Monitoring Portal pursuant to All India Council for Technical Education (AICTE) regulations.

---

## Visual Fidelity to Reference Dashboard
This implementation faithfully recreates the **EduVision Dashboard** design:
- **Top Navigation Bar**: Deep navy header (`#0C2B4E`), EduVision logo, global search bar, notification bell with unread badge (`3`), and user profile avatar with dropdown.
- **Left Sidebar**: Dark navy navigation (`#07172C`), active item highlighting in royal blue (`#1D4ED8`), lower section with glowing building artwork ("Your Voice Matters") and official AICTE emblem.
- **Hero Banner**: High-resolution modern campus facade with blue gradient, quote card (`"Better Governance for Quality Technical Education" — AICTE`), and dynamic role indicator.
- **3 Primary Action Cards**: Soft pastel cards for *File a New Complaint* (sky blue), *Track Your Complaint* (mint green), and *View Guidelines* (lavender).
- **5 Dynamic Metric Cards**: *Total Complaints* (3), *In Process* (1, 33%), *Resolved* (1, 33%), *Rejected* (0, 0%), and *Under Review* (1, 33%) with formatted timestamps.
- **Recent Complaints Table**: Exact rows (`CMP-2026-000103` to `CMP-2026-000099`), formatted dates, institutions, categories, colored status badges, and action buttons.
- **Right Support Panels**: *Quick Links*, *Need Help?* (toll-free, email, live chat with support illustration), and *Who Can File a Complaint?*.
- **Bottom Process Banner**: Horizontal 4-step workflow connected with chevrons and student illustration ("Together for Better Education").
- **Footer**: AICTE portal branding, legal links, and copyright text.

---

## Technology Stack

### Frontend
- **HTML5 & CSS3**: Native CSS Grid and Flexbox layouts.
- **Vanilla JavaScript (ES6+)**: Pure, framework-free JavaScript with Fetch API integration.
- **Icons**: Font Awesome 6.5.1 CDN.
- **Strict File Separation**: Separate HTML, CSS, and JS files for each functional area.

### Backend
- **Java**: Java 21 LTS / Java 25.
- **Spring Boot 3.2.5**:
  - `spring-boot-starter-web`: Versioned REST APIs (`/api/v1`).
  - `spring-boot-starter-data-jpa`: Hibernate ORM and repository layer.
  - `spring-boot-starter-security`: Stateless JWT authentication and role-based access control.
  - `spring-boot-starter-validation`: Bean validation for DTOs.
  - `springdoc-openapi-starter-webmvc-ui`: Swagger 3 interactive API testing.
- **Security**: BCrypt password hashing, signed JWT tokens, CORS policy, strict ownership validation.

### Database
- **MySQL 8.x**: Production relational schema with normalized tables, foreign keys, and indexes.
- **H2 Database**: Out-of-the-box development profile with MySQL dialect compatibility for instant zero-dependency testing.
- **Schema & Seed Scripts**: `database/schema.sql` and `database/seed-data.sql`.

---

## Project Structure

```text
EduVision/
├── frontend/
│   ├── index.html                 # Primary Dashboard matching reference
│   ├── login.html                 # User authentication
│   ├── register.html              # Role registration
│   ├── file-complaint.html        # Complete grievance submission form
│   ├── my-complaints.html         # User grievance list with filters & pagination
│   ├── track-complaint.html       # Public grievance tracking by ID
│   ├── complaint-details.html     # Deep dive into grievance & timeline
│   ├── profile.html               # Profile & password change
│   ├── guidelines.html            # Redressal guidelines & searchable FAQs
│   ├── support.html               # Contact helpdesk form
│   ├── admin-dashboard.html       # Admin / Officer command center
│   │
│   ├── css/
│   │   ├── style.css              # Main theme, navbar, sidebar, cards
│   │   ├── responsive.css         # Breakpoints (1440px, 1280px, 768px, 375px)
│   │   ├── animations.css         # Transitions, modals, toasts, spinners
│   │   ├── auth.css               # Login & register layouts
│   │   ├── complaints.css         # Form, dropzone, table & timeline styles
│   │   └── admin.css              # Admin badges, modals & tabs
│   │
│   ├── js/
│   │   ├── config.js              # Centralized endpoints & constants
│   │   ├── api.js                 # Reusable Fetch API layer & interceptor
│   │   ├── auth.js                # Auth state, session & role checks
│   │   ├── main.js                # Global navigation, toast & search
│   │   ├── dashboard.js           # Live statistics & recent complaints
│   │   ├── complaints.js          # Filtering, sorting, pagination
│   │   ├── complaint-form.js      # Form validation & submission
│   │   ├── tracking.js            # Live tracking & milestone timeline
│   │   ├── profile.js             # Profile management & password updates
│   │   ├── notifications.js       # Unread badge & notifications dropdown
│   │   └── admin.js               # Status transitions, officer assign & CSV
│   │
│   └── assets/
│       └── images/                # Vector SVGs (logo, aicte-seal, campus-banner, etc.)
│
├── backend/
│   ├── pom.xml                    # Maven dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/eduvision/
│       │   │   ├── EduVisionApplication.java
│       │   │   ├── config/        # Security, CORS, Web, OpenAPI configs
│       │   │   ├── controller/    # REST API Controllers (/api/v1)
│       │   │   ├── service/       # Business logic & seeders
│       │   │   ├── repository/    # Spring Data JPA repositories
│       │   │   ├── entity/        # JPA Entities (User, Complaint, etc.)
│       │   │   ├── dto/           # Request and Response transfer objects
│       │   │   ├── security/      # JWT provider, filter, UserPrincipal
│       │   │   └── exception/     # Global exception handler & error response
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── application-dev.properties
│       │       ├── application-prod.properties
│       │       └── db/migration/V1__init_schema.sql
│       └── test/java/com/eduvision/
│           ├── EduVisionApplicationTests.java
│           ├── ComplaintServiceTest.java
│           ├── DashboardControllerTest.java
│           └── AuthServiceTest.java
│
├── database/
│   ├── schema.sql                 # MySQL 8.x schema creation
│   ├── seed-data.sql              # Sample data matching reference screenshot
│   └── README.md                  # Database setup instructions
│
├── docs/
│   ├── API_DOCUMENTATION.md       # Complete REST API specification
│   ├── DATABASE_SCHEMA.md         # Schema & Mermaid ER diagram
│   └── SETUP_GUIDE.md             # Step-by-step setup guide
│
├── .gitignore
└── README.md
```

---

## Quick Start Instructions

### 1. Launching the Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
- The backend starts on **port 8080**.
- Default `dev` profile uses an embedded database and pre-seeds sample complaints matching the screenshot.
- Swagger UI is accessible at: `http://localhost:8080/swagger-ui.html`.

### 2. Launching the Frontend
Open `frontend/index.html` in any browser, or serve it using any HTTP server:
```bash
cd frontend
python -m http.server 3000
```
Visit `http://localhost:3000`.

### 3. Demo Credentials
- **Student**: `rahul.sharma@eduvision.in` / `Student@123`
- **AICTE Officer**: `sk.verma@aicte-india.org` / `Officer@123`
- **Administrator**: `admin@eduvision.in` / `Admin@123`

---

## Key Features Implemented

1. **Complaint Lifecycle Management**: `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `IN_PROCESS` ➔ `RESOLVED` / `REJECTED` / `CLOSED`.
2. **Immutable Audit Trail**: Every status change records previous status, new status, timestamp, officer remarks, and internal notes.
3. **Mandatory Rejection Reasons**: Rejections require an explicit statutory rationale.
4. **Safe Public Tracking**: Rate-friendly public tracking endpoint displays case progress without exposing sensitive student contact info.
5. **Real-time Notifications**: Database-backed notification center with dynamic unread badge count (`3`).
6. **CSV Report Export**: Grievance officers can export complaint datasets directly to CSV.
7. **Strict Security**: Role-based access control (`STUDENT`, `TEACHER`, `HOD`, `INSTITUTION_HEAD`, `AICTE_OFFICER`, `ADMIN`), BCrypt password hashing, and token expiration.
