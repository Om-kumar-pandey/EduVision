# EduVision Database Setup & Schema Guide

This directory contains the database design, schema scripts, and seed data for the **EduVision – Complaint Monitoring Portal**.

## Database Overview
- **RDBMS**: MySQL 8.x
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Timezone**: UTC

## Setup Instructions

### 1. Using MySQL CLI
Connect to your local MySQL server:
```bash
mysql -u root -p
```

Execute the schema and seed scripts:
```sql
SOURCE schema.sql;
SOURCE seed-data.sql;
```

### 2. Spring Boot Integration
By default, the Spring Boot backend runs in the `dev` profile using an in-memory database with MySQL syntax compatibility. To connect to your MySQL 8.x server:

1. Update `application-prod.properties` or provide environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://localhost:3306/eduvision_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME`: `root`
   - `SPRING_DATASOURCE_PASSWORD`: `<your-mysql-password>`
2. Start the backend with the `prod` profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=prod
   ```

## Seed Accounts Reference
| Full Name | Role | Email | Default Password |
|---|---|---|---|
| Rahul Sharma | STUDENT | rahul.sharma@eduvision.in | `Student@123` |
| Dr. S. K. Verma | AICTE_OFFICER | sk.verma@aicte-india.org | `Officer@123` |
| System Admin | ADMIN | admin@eduvision.in | `Admin@123` |
| Dr. Anand Raman | TEACHER | anand.raman@eduvision.in | `Student@123` |
| Prof. Sunita Patil | HOD | sunita.patil@eduvision.in | `Student@123` |
