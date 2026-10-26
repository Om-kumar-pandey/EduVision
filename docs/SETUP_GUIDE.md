# EduVision – Setup and Execution Guide

This guide walks you through starting both the **Frontend** and **Backend** of the EduVision Complaint Monitoring Portal.

---

## 1. Prerequisites
- **Java**: Java 21 or higher (Java 25 supported)
- **Maven**: 3.8+
- **Database**: MySQL 8.x (Optional: an embedded in-memory database runs automatically under the default `dev` profile)
- **Modern Web Browser**: Chrome, Firefox, Edge, or Brave

---

## 2. Quick Start (Development Profile)

### 2.1 Start the Java Spring Boot Backend
1. Navigate to the `backend` folder:
   ```bash
   cd EduVision/backend
   ```
2. Build and run using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The server starts on port `8080`:
   - API Base URL: `http://localhost:8080/api/v1`
   - Swagger 3 UI: `http://localhost:8080/swagger-ui.html`
   - OpenAPI Docs: `http://localhost:8080/api-docs`
   - H2 Dev Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:eduvisiondb`, user: `sa`, blank password)

*Note: The backend automatically seeds the sample users and baseline complaints matching the screenshot on first boot.*

---

## 3. Production MySQL 8.x Configuration

### 3.1 Initialize MySQL Database
1. Open MySQL CLI or Workbench:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema and seed scripts:
   ```sql
   SOURCE database/schema.sql;
   SOURCE database/seed-data.sql;
   ```

### 3.2 Launch Backend in Production Mode
Set environment variables or pass system properties:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/eduvision_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"

mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 4. Serving the Frontend

The frontend consists of pure, standards-compliant HTML5, CSS3, and Vanilla JavaScript with no build steps or heavy frameworks required.

You can serve it via any static web server:

### Option A: VS Code Live Server
Right-click `frontend/index.html` and select **"Open with Live Server"** (runs at `http://localhost:5500`).

### Option B: Python 3 HTTP Server
```bash
cd EduVision/frontend
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.

### Option C: Direct Browser Opening
Simply double-click `frontend/index.html` to open it in your browser. The frontend includes elegant fallback handling so the dashboard displays all visual elements immediately even before the backend server is running.

---

## 5. Sample Login Credentials

| User Type | Email | Password | Role |
|---|---|---|---|
| **Student (Rahul Sharma)** | `rahul.sharma@eduvision.in` | `Student@123` | `STUDENT` |
| **AICTE Regional Officer** | `sk.verma@aicte-india.org` | `Officer@123` | `AICTE_OFFICER` |
| **Portal Administrator** | `admin@eduvision.in` | `Admin@123` | `ADMIN` |
| **Faculty Member** | `anand.raman@eduvision.in` | `Student@123` | `TEACHER` |
| **Department Head (HOD)** | `sunita.patil@eduvision.in` | `Student@123` | `HOD` |
