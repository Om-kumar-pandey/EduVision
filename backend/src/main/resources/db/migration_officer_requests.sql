-- =============================================================================
-- AICTE Integrated Institution Complaint Monitoring & Status Dashboard
-- Migration: Officer Access Requests & Screenshot Verification Data
-- =============================================================================

USE aicte_complaints;

-- 1. Create officer_registration_requests table
CREATE TABLE IF NOT EXISTS officer_registration_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50),
    requested_role VARCHAR(50) NOT NULL DEFAULT 'BUREAU_OFFICER',
    requested_bureau_code VARCHAR(20) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(150),
    phone VARCHAR(30),
    verification_info TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_reason TEXT,
    activation_token VARCHAR(100) UNIQUE,
    token_expiry DATETIME,
    is_activated BOOLEAN DEFAULT FALSE,
    approved_by_id BIGINT,
    approved_at DATETIME,
    rejected_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_officer_req_status (status),
    INDEX idx_officer_req_email (email),
    INDEX idx_officer_req_token (activation_token),
    CONSTRAINT fk_officer_req_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Ensure Institutions from Screenshot 1 & 2 exist
INSERT INTO institutions (permanent_id, name, region, state, city, address, contact_email, is_verified, approval_status, created_at, updated_at)
VALUES
('1-8934102911', 'Global Institute of Technology', 'Northern', 'Uttar Pradesh', 'Noida', 'Sector 62, Institutional Area, Noida', 'info@git.edu.in', 1, 'APPROVED', NOW(), NOW()),
('1-7829103822', 'Techno College of Engineering', 'Southern', 'Tamil Nadu', 'Chennai', 'IT Corridor, OMR, Chennai', 'contact@techno.edu.in', 1, 'APPROVED', NOW(), NOW()),
('1-6718201933', 'Sunrise College', 'Eastern', 'West Bengal', 'Kolkata', 'Salt Lake Sector V, Kolkata', 'admin@sunrisecollege.org', 1, 'APPROVED', NOW(), NOW()),
('1-5629102844', 'National Institute of Management', 'Western', 'Maharashtra', 'Pune', 'Viman Nagar, Pune', 'director@nim.ac.in', 1, 'APPROVED', NOW(), NOW()),
('1-4519203855', 'Bavi Engineering College', 'Southern', 'Karnataka', 'Bengaluru', 'Electronic City Phase 1, Bengaluru', 'principal@baviec.edu.in', 1, 'APPROVED', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Ensure Cases from Screenshot 1 exist and are assigned to Bureau Officer (Dr. Ananya Sen, id=4, and Shri Rajesh Kulkarni, id=3)
-- Case 1: CASE-2026-0784
INSERT INTO cases (case_number, source_case_id, institution_id, bureau_id, title, description, category, priority, status, receipt_date, expected_disposal_date, assigned_to_user_id, created_at, updated_at)
SELECT 'CASE-2026-0784', 'SYS-CASE-0784', i.id, 1, 'Faculty Cadre Ratio Deficiency & Unqualified Teaching Staff', 'Inspection revealed 40% shortfall in designated faculty cadre ratio and lack of doctoral degrees among senior faculties.', 'RB', 'North', 'UNDER_PROCESS', '2026-09-12 10:00:00', '2026-10-12 17:00:00', 4, NOW(), NOW()
FROM institutions i WHERE i.name = 'Global Institute of Technology'
AND NOT EXISTS (SELECT 1 FROM cases WHERE case_number = 'CASE-2026-0784');

-- Case 2: CASE-2026-0732
INSERT INTO cases (case_number, source_case_id, institution_id, bureau_id, title, description, category, priority, status, receipt_date, expected_disposal_date, assigned_to_user_id, created_at, updated_at)
SELECT 'CASE-2026-0732', 'SYS-CASE-0732', i.id, 2, 'Arbitrary Fee Hike Beyond State Regulatory Commission Directives', 'Students reported unauthorized fee collection under auxiliary heads not permitted by government fee guidelines.', 'PGRC', 'South', 'RECEIVED', '2026-09-10 11:30:00', '2026-10-10 17:00:00', 4, NOW(), NOW()
FROM institutions i WHERE i.name = 'Techno College of Engineering'
AND NOT EXISTS (SELECT 1 FROM cases WHERE case_number = 'CASE-2026-0732');

-- Case 3: CASE-2026-0721
INSERT INTO cases (case_number, source_case_id, institution_id, bureau_id, title, description, category, priority, status, receipt_date, expected_disposal_date, disposed_date, assigned_to_user_id, created_at, updated_at)
SELECT 'CASE-2026-0721', 'SYS-CASE-0721', i.id, 1, 'Fire Safety & Municipal Building Occupancy Clearance Verification', 'Submission and verification of valid National Building Code compliant fire safety certificate from statutory authorities.', 'RB', 'East', 'DISPOSED', '2026-08-08 09:15:00', '2026-10-08 17:00:00', '2026-10-08 14:30:00', 4, NOW(), NOW()
FROM institutions i WHERE i.name = 'Sunrise College'
AND NOT EXISTS (SELECT 1 FROM cases WHERE case_number = 'CASE-2026-0721');

-- Case 4: CASE-2026-0715
INSERT INTO cases (case_number, source_case_id, institution_id, bureau_id, title, description, category, priority, status, receipt_date, expected_disposal_date, assigned_to_user_id, created_at, updated_at)
SELECT 'CASE-2026-0715', 'SYS-CASE-0715', i.id, 2, 'Withholding of Original Degree Certificates & Academic Documents', 'Institution refused to release undergraduate marksheet and transfer certificates to graduating students upon course completion.', 'PGRC', 'West', 'UNDER_PROCESS', '2026-09-06 14:00:00', '2026-10-06 17:00:00', 4, NOW(), NOW()
FROM institutions i WHERE i.name = 'National Institute of Management'
AND NOT EXISTS (SELECT 1 FROM cases WHERE case_number = 'CASE-2026-0715');

-- Case 5: CASE-2026-0698
INSERT INTO cases (case_number, source_case_id, institution_id, bureau_id, title, description, category, priority, status, receipt_date, expected_disposal_date, assigned_to_user_id, created_at, updated_at)
SELECT 'CASE-2026-0698', 'SYS-CASE-0698', i.id, 1, 'Inadequate Computing & Computer Laboratory Infrastructure', 'Complaint regarding inadequate desktop computers and unlicensed software in engineering department labs.', 'RB', 'South', 'UNDER_PROCESS', '2026-08-03 16:45:00', '2026-10-03 17:00:00', 4, NOW(), NOW()
FROM institutions i WHERE i.name = 'Bavi Engineering College'
AND NOT EXISTS (SELECT 1 FROM cases WHERE case_number = 'CASE-2026-0698');

-- Also assign copies or relevant cases to Shri Rajesh Kulkarni (id=3, RB)
UPDATE cases SET assigned_to_user_id = 3 WHERE case_number IN ('AICTE-2026-CASE-001', 'AICTE-2026-CASE-005', 'AICTE-2026-CASE-007') AND (assigned_to_user_id IS NULL OR assigned_to_user_id = 12);

-- 4. Seed initial pending Officer Access Requests
INSERT INTO officer_registration_requests 
(request_id, full_name, email, employee_id, requested_role, requested_bureau_code, designation, department, phone, verification_info, status, created_at, updated_at)
VALUES
('REQ-2026-0101', 'Er. Vikram Mehta', 'vikram.mehta@aicte.gov.in', 'EMP-AICTE-4891', 'BUREAU_OFFICER', 'RB', 'Senior Regulatory Inspection Officer', 'Regulation Bureau (Standards & Norms)', '+91 11 2958 1022', 'Government Officer ID: AICTE/HQ/RB/2021-049. Verified by Bureau In-charge.', 'PENDING_APPROVAL', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2026-0102', 'Dr. Kavita Nair', 'kavita.nair@aicte.gov.in', 'EMP-AICTE-5120', 'BUREAU_OFFICER', 'PGRC', 'Grievance Officer (Legal Scrutiny)', 'Public Grievance Redressal Cell', '+91 11 2958 1035', 'AICTE Officer ID: AICTE/HQ/PGRC/2023-108. Legal counsel and grievance scrutiny officer.', 'PENDING_APPROVAL', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2026-0103', 'Shri Manoj Joshi', 'manoj.joshi@aicte.gov.in', 'EMP-AICTE-6204', 'BUREAU_OFFICER', 'RB', 'Assistant Director (Inspections)', 'Regulation Bureau (Western Division)', '+91 22 2285 5490', 'Regional Deputy Director endorsement attached. Western Regional Office liaison.', 'PENDING_APPROVAL', NOW(), NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
