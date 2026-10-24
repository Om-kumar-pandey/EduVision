-- ==============================================================================
-- AICTE Integrated Institution Complaint Monitoring & Status Dashboard
-- Smart India Hackathon 2026 (Problem Statement ID: 26264)
-- Initial Seed Data: Normalized reference data, demo institutions, users, cases,
-- append-only action histories, overlap alerts, transfers, and audit logs.
-- ==============================================================================

USE `aicte_complaints`;

-- -----------------------------------------------------------------------------
-- 1. SEED BUREAUS
-- -----------------------------------------------------------------------------
INSERT INTO `bureaus` (`id`, `code`, `name`, `description`, `contact_email`, `is_active`) VALUES
(1, 'RB', 'Regulation Bureau', 'Regulatory compliance, cadre ratio norms, land & building norms, and statutory adherence enforcement.', 'rb@aicte.gov.in', 1),
(2, 'PGRC', 'Public Grievance Redressal Cell', 'Grievance redressal cell investigating student, parent, and faculty complaints, capitation fee, and certificate withholding.', 'pgrc@aicte.gov.in', 1),
(3, 'APPROVAL', 'Approval Bureau', 'Scrutiny of new institution approvals, intake expansions, and course additions.', 'approval@aicte.gov.in', 1),
(4, 'POLICY', 'Policy & Planning Bureau', 'Formulation of technical education curriculum frameworks, NEP 2020 integration, and faculty development norms.', 'policy@aicte.gov.in', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 2. SEED INSTITUTIONS
-- -----------------------------------------------------------------------------
INSERT INTO `institutions` (`id`, `permanent_id`, `name`, `region`, `state`, `city`, `address`, `institution_type`, `approval_status`, `contact_email`, `contact_phone`, `is_verified`) VALUES
(1, '1-1097234567', 'Apex Institute of Technology & Engineering', 'Western', 'Maharashtra', 'Mumbai', 'Sector 15, Powai Technical Campus, Mumbai - 400076', 'Engineering & Technology', 'APPROVED', 'registrar@apextech.edu.in', '+91 22 2570 1122', 1),
(2, '1-2048912384', 'National Engineering Academy', 'Northern', 'Uttar Pradesh', 'Greater Noida', 'Knowledge Park III, Institutional Area, Greater Noida - 201308', 'Engineering & Technology', 'APPROVED', 'info@nea.ac.in', '+91 120 232 4455', 1),
(3, '1-3958102931', 'Deccan College of Engineering & Research', 'Southern', 'Karnataka', 'Bengaluru', 'Outer Ring Road, Marathahalli Sub-post, Bengaluru - 560037', 'Engineering & Technology', 'APPROVED', 'contact@deccaneng.edu.in', '+91 80 4123 7890', 1),
(4, '1-4829103948', 'Eastern Institute of Science & Management', 'Eastern', 'West Bengal', 'Kolkata', 'Salt Lake Sector V, Bidhannagar, Kolkata - 700091', 'Management', 'APPROVED', 'admin@easterninstitute.org', '+91 33 2357 8899', 1),
(5, '1-5729103847', 'Central Polytechnic & Applied Sciences', 'Central', 'Madhya Pradesh', 'Bhopal', 'Ayodhya Bypass Road, Near Technical Board, Bhopal - 462041', 'Polytechnic & Applied Arts', 'APPROVED', 'principal@centralpoly.ac.in', '+91 755 245 6789', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 3. SEED USERS (BCrypt Work Factor 12)
-- Passwords:
-- admin@aicte.gov.in       -> Admin@123
-- monitor@aicte.gov.in     -> Monitor@123
-- rb_officer@aicte.gov.in  -> Officer@123
-- pgrc_officer@aicte.gov.in-> Officer@123
-- approval_officer@aicte.gov.in -> Officer@123
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `bureau_id`, `designation`, `phone`, `is_active`) VALUES
(1, 'admin@aicte.gov.in', '$2a$12$ayMCqwKdcEBIGE7fYfazN.VUKvpkSm08xlZMS/CsH8N00RGwrj7k.', 'Dr. Ramesh Sharma', 'SYS_ADMIN', NULL, 'Chief Information Officer & Administrator', '+91 11 2958 1001', 1),
(2, 'monitor@aicte.gov.in', '$2a$12$hWuWpWGLFc3tGcfxm1tRK.mSdneUvcyFYC9W1gc3uthsNKKTYs.hu', 'Smt. Sunita Verma', 'CENTRAL_MONITOR', NULL, 'Director, Central Monitoring & Quality Assurance', '+91 11 2958 1002', 1),
(3, 'rb_officer@aicte.gov.in', '$2a$12$w1MDJd47/IirguaZ3gmXPOFrdGcyReAOKxiqYE4qj7RJcBBEiaOzi', 'Shri Rajesh Kulkarni', 'BUREAU_OFFICER', 1, 'Senior Regulatory Officer (RB)', '+91 11 2958 1003', 1),
(4, 'pgrc_officer@aicte.gov.in', '$2a$12$L/8eDuyE/EGejL05gIFLsuLF5ZUypciUL5F/nisHF.I.n70I0V7CC', 'Dr. Ananya Sen', 'BUREAU_OFFICER', 2, 'Senior Grievance Redressal Officer (PGRC)', '+91 11 2958 1004', 1),
(5, 'approval_officer@aicte.gov.in', '$2a$12$CzbEhKOviyQx6ufizRiMau86ebfVVBj10kKZZeQt8SM8L1RuLjXZG', 'Shri Vikram Patil', 'BUREAU_OFFICER', 3, 'Approval Bureau Scrutiny Officer', '+91 11 2958 1005', 1)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- -----------------------------------------------------------------------------
-- 4. SEED CASES
-- -----------------------------------------------------------------------------
INSERT INTO `cases` (`id`, `case_number`, `source_case_id`, `institution_id`, `bureau_id`, `title`, `description`, `category`, `priority`, `status`, `receipt_date`, `expected_disposal_date`, `disposed_date`, `created_by_user_id`, `created_at`) VALUES
(1, 'AICTE-2026-CASE-001', 'CPGRAMS-2026-8812', 1, 1, 'Deficit in Faculty Cadre Ratio & Faculty Salary Arrears', 'Detailed audit revealed 38% faculty vacancy in Computer Engineering and non-compliance with 7th CPC salary scales.', 'Faculty Irregularities', 'HIGH', 'UNDER_PROCESS', '2026-09-10 10:30:00', '2026-10-30 17:00:00', NULL, 3, '2026-09-10 05:00:00'),
(2, 'AICTE-2026-CASE-002', 'PGRC-DIRECT-1049', 1, 2, 'Illegal Capitation Fee & Retention of Original Degree Certificates', 'Multiple final year B.Tech students submitted complaints alleging demands for Rs. 50,000 caution deposit and withholding of original qualifying certificates.', 'Capitation Fee / Overcharging', 'URGENT', 'RECEIVED', '2026-09-22 14:15:00', '2026-11-05 17:00:00', NULL, 4, '2026-09-22 08:45:00'),
(3, 'AICTE-2026-CASE-003', 'CPGRAMS-2026-9031', 2, 2, 'Tuition Fee Exceeding State Fee Regulatory Committee Ceiling', 'Grievance against charging ancillary fees under miscellaneous heads violating mandated fee ceiling order.', 'Capitation Fee / Overcharging', 'MEDIUM', 'UNDER_PROCESS', '2026-09-15 11:00:00', '2026-11-15 17:00:00', NULL, 4, '2026-09-15 05:30:00'),
(4, 'AICTE-2026-CASE-004', 'INSP-2026-0421', 3, 1, 'Unauthorized Intake Expansion Without Prior Approval of Council', 'Institution admitted 60 additional seats in Artificial Intelligence course without mandatory EOA.', 'Admission Malpractice', 'HIGH', 'DISPOSED', '2026-08-01 09:00:00', '2026-09-15 17:00:00', '2026-09-12 16:30:00', 3, '2026-08-01 03:30:00'),
(5, 'AICTE-2026-CASE-005', 'AUDIT-2026-0089', 4, 1, 'Deficient Laboratory Infrastructure & Fire Safety Clearance Non-renewal', 'Inspection committee noted obsolete mechanical engineering labs and expired municipal fire NOC.', 'Infrastructure Deficit', 'HIGH', 'UNDER_PROCESS', '2026-08-10 12:00:00', '2026-09-25 17:00:00', NULL, 3, '2026-08-10 06:30:00')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- -----------------------------------------------------------------------------
-- 5. SEED CASE ACTION HISTORY (Append-Only)
-- -----------------------------------------------------------------------------
INSERT INTO `case_actions` (`id`, `case_id`, `user_id`, `action_type`, `from_status`, `to_status`, `remarks`, `next_action`, `next_action_due_date`, `created_at`) VALUES
(1, 1, 3, 'STATUS_CHANGE', 'RECEIVED', 'UNDER_PROCESS', 'Case formally admitted. Formal show-cause notice issued to the management of Apex Institute regarding cadre ratio compliance.', 'Await reply from management within 14 days', '2026-09-24 17:00:00', '2026-09-10 05:30:00'),
(2, 1, 3, 'REMARK_ADDED', 'UNDER_PROCESS', 'UNDER_PROCESS', 'Preliminary reply received from Principal claiming appointment drive is currently underway. Verification requested from Regional Officer Western Bureau.', 'Physical verification committee inspection', '2026-10-15 17:00:00', '2026-09-25 09:00:00'),
(3, 2, 4, 'STATUS_CHANGE', NULL, 'RECEIVED', 'Student complaint registered through PGRC intake with signed affidavits and payment receipts attached.', 'Issue summons to Registrar for document release', '2026-10-05 17:00:00', '2026-09-22 08:45:00'),
(4, 3, 4, 'STATUS_CHANGE', 'RECEIVED', 'UNDER_PROCESS', 'Fee structure verified against State Fee Regulatory Committee notification dated June 2026. Discrepancy observed in laboratory fee component.', 'Seek explanation from Institution Finance Officer', '2026-10-20 17:00:00', '2026-09-16 04:30:00'),
(5, 4, 3, 'STATUS_CHANGE', 'RECEIVED', 'UNDER_PROCESS', 'Surprise inspection conducted on 2026-08-15. Over-intake confirmed by verification of attendance rolls.', 'Place findings before Standing Appellate Committee (SAC)', '2026-08-30 17:00:00', '2026-08-02 06:00:00'),
(6, 4, 3, 'STATUS_CHANGE', 'UNDER_PROCESS', 'DISPOSED', 'Standing Appellate Committee penalty imposed: Reduction of 60 seats for Academic Year 2026-27 and penalty deposit remitted. Case successfully closed.', 'Penalty compliance monitor', NULL, '2026-09-12 11:00:00'),
(7, 5, 3, 'STATUS_CHANGE', 'RECEIVED', 'UNDER_PROCESS', 'Site inspection report reviewed. Immediate requirement to procure certified testing equipment and renew municipal fire safety certificate.', 'Submit renewed Fire NOC', '2026-09-25 17:00:00', '2026-08-12 09:30:00')
ON DUPLICATE KEY UPDATE `remarks`=VALUES(`remarks`);

-- -----------------------------------------------------------------------------
-- 6. SEED OVERLAP ALERTS
-- Case 1 (RB) and Case 2 (PGRC) active simultaneously for Apex Institute (1-1097234567)
-- -----------------------------------------------------------------------------
INSERT INTO `overlap_alerts` (`id`, `institution_id`, `case1_id`, `case2_id`, `status`, `classification`, `review_remarks`, `reviewed_by_user_id`, `reviewed_at`, `created_at`) VALUES
(1, 1, 1, 2, 'DETECTED', NULL, NULL, NULL, NULL, '2026-09-22 08:50:00')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- -----------------------------------------------------------------------------
-- 7. SEED TRANSFER REQUESTS
-- -----------------------------------------------------------------------------
INSERT INTO `transfer_requests` (`id`, `case_id`, `from_bureau_id`, `to_bureau_id`, `requested_by_user_id`, `reviewed_by_user_id`, `reason`, `status`, `decision_remarks`, `created_at`) VALUES
(1, 2, 2, 1, 4, NULL, 'Complainants have also alleged statutory land mortgage issues alongside certificate retention, which falls squarely under Regulation Bureau purview.', 'PENDING', NULL, '2026-09-28 10:30:00')
ON DUPLICATE KEY UPDATE `reason`=VALUES(`reason`);

-- -----------------------------------------------------------------------------
-- 8. SEED IMPORT BATCHES & ERRORS
-- -----------------------------------------------------------------------------
INSERT INTO `import_batches` (`id`, `batch_number`, `filename`, `total_rows`, `valid_rows`, `imported_rows`, `failed_rows`, `status`, `imported_by_user_id`, `created_at`) VALUES
(1, 'BATCH-20260901-001', 'Western_Region_Q3_Complaints.csv', 12, 10, 10, 2, 'COMPLETED', 1, '2026-09-01 04:30:00')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

INSERT INTO `import_errors` (`id`, `batch_id`, `csv_row_number`, `raw_data`, `error_message`, `created_at`) VALUES
(1, 1, 4, '1-INVALID-9999,Faculty Deficit,RB,HIGH,2026-08-15', 'AICTE Permanent ID "1-INVALID-9999" could not be verified in the institution database.', '2026-09-01 04:31:00'),
(2, 1, 9, '1-1097234567,Invalid Category,UNKNOWN_BUR,LOW,2026-08-18', 'Bureau code "UNKNOWN_BUR" is invalid or inactive.', '2026-09-01 04:31:00')
ON DUPLICATE KEY UPDATE `error_message`=VALUES(`error_message`);

-- -----------------------------------------------------------------------------
-- 9. SEED AUDIT LOGS
-- -----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `user_id`, `user_email`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'admin@aicte.gov.in', 'BULK_CSV_IMPORT', 'IMPORT_BATCH', 'BATCH-20260901-001', 'Bulk CSV import completed: 10 valid records ingested, 2 errors logged.', '127.0.0.1', '2026-09-01 04:31:05'),
(2, 3, 'rb_officer@aicte.gov.in', 'CASE_STATUS_UPDATE', 'CASE', 'AICTE-2026-CASE-001', 'Status updated to UNDER_PROCESS with notice issued.', '127.0.0.1', '2026-09-10 05:30:00'),
(3, 4, 'pgrc_officer@aicte.gov.in', 'CASE_CREATE', 'CASE', 'AICTE-2026-CASE-002', 'New case registered for Apex Institute of Technology under PGRC.', '127.0.0.1', '2026-09-22 08:45:00'),
(4, NULL, 'SYSTEM', 'OVERLAP_DETECTED', 'OVERLAP_ALERT', '1', 'Cross-bureau overlap automatically flagged between Case AICTE-2026-CASE-001 (RB) and AICTE-2026-CASE-002 (PGRC) on Institution 1-1097234567.', '127.0.0.1', '2026-09-22 08:50:00'),
(5, 4, 'pgrc_officer@aicte.gov.in', 'TRANSFER_REQUEST', 'CASE', 'AICTE-2026-CASE-002', 'Transfer requested from PGRC to RB.', '127.0.0.1', '2026-09-28 10:30:00')
ON DUPLICATE KEY UPDATE `details`=VALUES(`details`);
