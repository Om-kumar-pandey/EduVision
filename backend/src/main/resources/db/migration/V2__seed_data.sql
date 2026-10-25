-- =============================================================================
-- EduVision - Seed Data Script
-- Populates reference institutions, demonstration users, complaints & notifications
-- Default password for all seed accounts is: password123
-- BCrypt: $2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK
-- =============================================================================

USE eduvision_db;

-- Clear previous seed data if exists (in reverse foreign key order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE support_requests;
TRUNCATE TABLE notifications;
TRUNCATE TABLE complaint_internal_notes;
TRUNCATE TABLE complaint_assignments;
TRUNCATE TABLE complaint_status_history;
TRUNCATE TABLE complaint_attachments;
TRUNCATE TABLE complaints;
TRUNCATE TABLE users;
TRUNCATE TABLE institutions;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. SEED INSTITUTIONS
INSERT INTO institutions (id, code, name, type, state, city, address, contact_email, contact_phone) VALUES
(1, 'INST-UP-001', 'ABC Institute of Technology (UP)', 'Engineering & Technology', 'Uttar Pradesh', 'Lucknow', 'Sector 7, Tech Zone, Lucknow, UP - 226001', 'registrar@abctech.edu.in', '0522-2981001'),
(2, 'INST-MH-002', 'Global Engineering College (MH)', 'Engineering & Technology', 'Maharashtra', 'Pune', 'Campus Road, Viman Nagar, Pune, MH - 411014', 'contact@globaleng.edu.in', '020-2791823'),
(3, 'INST-KA-003', 'Sunrise College of Engineering (KA)', 'Engineering & Technology', 'Karnataka', 'Bengaluru', 'Electronic City Phase 1, Bengaluru, KA - 560100', 'info@sunrisecollege.ac.in', '080-41235678'),
(4, 'INST-DL-004', 'Techno Institute of Technology (Delhi)', 'Management & IT', 'Delhi', 'New Delhi', 'Institutional Area, Okhla Phase 3, New Delhi - 110020', 'support@techno.edu.in', '011-26918844'),
(5, 'INST-BR-005', 'Rohan Institute of Technology (BR)', 'Polytechnic', 'Bihar', 'Patna', 'Boring Road, Patna, Bihar - 800001', 'admin@rohanit.ac.in', '0612-2244551');

-- 2. SEED USERS
-- Password: password123 (BCrypt hash)
INSERT INTO users (id, email, password_hash, full_name, roll_or_emp_id, role, phone_number, institution_id, department, enabled) VALUES
(1, 'rahul.sharma@example.edu', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Rahul Sharma', '2023-CS-419', 'STUDENT', '+91 98765-43210', 1, 'Computer Science & Engineering', TRUE),
(2, 'pooja.d@example.edu', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Pooja Deshmukh', '2022-CH-108', 'STUDENT', '+91 98765-43211', 2, 'Chemical Engineering', TRUE),
(3, 'karthik.rao@example.edu', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Karthik Rao', '2021-EE-302', 'STUDENT', '+91 98765-43212', 3, 'Electrical Engineering', TRUE),
(4, 'amit.anand@example.edu', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Amit Anand', '2024-ME-055', 'STUDENT', '+91 98765-43213', 5, 'Mechanical Engineering', TRUE),
(5, 'arvind.mehta@aicte.gov.in', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Dr. Arvind Mehta', 'AICTE-RO-8821', 'AICTE_OFFICER', '+91 91234-56789', NULL, 'Northern Regional Grievance Scrutiny Cell', TRUE),
(6, 'admin@eduvision.in', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'National System Administrator', 'ADM-SYS-001', 'ADMIN', '+91 90000-11111', NULL, 'Central Portal Administration', TRUE),
(7, 'principal@abctech.edu.in', '$2a$10$eACCYoNOHEqgkvd0i/zW9uS5i6EaWjW8PZ0R9VvC7BvH8A0/0l4iK', 'Dr. K. Sharma', 'EMP-ABC-PR-01', 'INSTITUTION_HEAD', '+91 98111-22233', 1, 'Administration', TRUE);

-- 3. SEED COMPLAINTS (Exact rows matching Reference Dashboard)
INSERT INTO complaints (id, tracking_id, complainant_user_id, institution_id, category, subject, description, incident_date, status, assigned_officer_id, declaration_accepted, resolution_summary, rejection_reason, created_at) VALUES
(1, 'CMP-2026-000103', 1, 1, 'Academic Issues', 'Delay in semester examination results and grade sheet dispatch', 'The 6th semester examination results conducted in July 2026 have not yet been declared. The delayed timeline is obstructing applications for higher education and campus placements.', '2026-10-20', 'IN_PROCESS', 5, TRUE, NULL, NULL, '2026-10-22 09:30:00'),
(2, 'CMP-2026-000102', 2, 2, 'Infrastructure', 'Inadequate laboratory equipment and safety measures in Chemistry lab', 'The organic chemistry laboratories lack required fume hoods and essential reagents. Repeated requests to department authorities have gone unaddressed.', '2026-10-15', 'UNDER_REVIEW', 5, TRUE, NULL, NULL, '2026-10-18 11:20:00'),
(3, 'CMP-2026-000101', 3, 3, 'Fee Related', 'Excessive capitation charges demanded above approved AICTE fee structure', 'The college administration charged Rs. 45,000 as miscellaneous building fund in violation of AICTE notification and state fee regulatory committee guidelines.', '2026-10-08', 'RESOLVED', 5, TRUE, 'Institution refund order verified. Full refund of Rs. 45,000 credited to student account on 20 Oct 2026.', NULL, '2026-10-12 10:15:00'),
(4, 'CMP-2026-000100', 1, 4, 'Faculty Related', 'Non-availability of designated Professors for specialized elective subjects', 'Lack of core faculty for Cloud Architecture and AI Electives for final year students. Classes were repeatedly canceled without substitute teachers.', '2026-09-28', 'RESOLVED', 5, TRUE, 'Two visiting adjunct professors onboarded from industry; special weekend makeup classes scheduled.', NULL, '2026-10-05 08:45:00'),
(5, 'CMP-2026-000099', 4, 5, 'Examination', 'Clash in semester supplementary examination timetable', 'Two core papers (Fluid Mechanics and Digital Electronics) scheduled on the exact same date and time slot for 4th semester students.', '2026-09-25', 'IN_PROCESS', 5, TRUE, NULL, NULL, '2026-09-28 14:00:00');

-- 4. SEED COMPLAINT STATUS HISTORY
INSERT INTO complaint_status_history (complaint_id, previous_status, new_status, updated_by_user_id, remarks, created_at) VALUES
(1, 'SUBMITTED', 'UNDER_REVIEW', 5, 'Preliminary verification completed by AICTE Northern Regional Office.', '2026-10-22 14:15:00'),
(1, 'UNDER_REVIEW', 'IN_PROCESS', 5, 'Formal inquiry notice served to Registrar, ABC Institute of Technology with 7-day compliance window.', '2026-10-23 11:00:00'),
(2, 'SUBMITTED', 'UNDER_REVIEW', 5, 'Assigned to Western Regional Inspection Panel for safety audit scheduling.', '2026-10-19 16:00:00'),
(3, 'SUBMITTED', 'UNDER_REVIEW', 5, 'Scrutinized with fee receipts attached.', '2026-10-14 15:30:00'),
(3, 'UNDER_REVIEW', 'IN_PROCESS', 5, 'Hearing conducted with college management.', '2026-10-16 12:00:00'),
(3, 'IN_PROCESS', 'RESOLVED', 5, 'Compliance refund confirmed by bank transfer slip.', '2026-10-20 17:00:00'),
(4, 'SUBMITTED', 'IN_PROCESS', 5, 'Grievance verified with Delhi State Ombudsman.', '2026-10-06 13:10:00'),
(4, 'IN_PROCESS', 'RESOLVED', 5, 'Adjunct faculty appointments validated.', '2026-10-11 16:20:00'),
(5, 'SUBMITTED', 'IN_PROCESS', 5, 'Examination controller notified to issue revised timetable.', '2026-09-29 10:00:00');

-- 5. SEED NOTIFICATIONS
INSERT INTO notifications (id, recipient_user_id, title, message, type, related_complaint_id, is_read, created_at) VALUES
(1, 1, 'Notice Issued to ABC Institute of Tech', 'Grievance CMP-2026-000103 has been forwarded to the college administration for formal compliance.', 'STATUS_UPDATE', 1, FALSE, '2026-10-23 11:05:00'),
(2, 1, 'AICTE Revised Grievance Resolution Norms', 'All institutions are now required to acknowledge complaints within 48 hours of portal lodging.', 'CIRCULAR', NULL, FALSE, '2026-10-24 08:30:00'),
(3, 1, 'Complaint CMP-2026-000100 Marked Resolved', 'Your grievance regarding faculty vacancy in Cloud Architecture has been resolved.', 'STATUS_UPDATE', 4, FALSE, '2026-10-11 16:25:00'),
(4, 3, 'Complaint CMP-2026-000101 Marked Resolved', 'Capitation fee refund verified. Case closed successfully.', 'STATUS_UPDATE', 3, TRUE, '2026-10-20 17:05:00');

-- 6. SEED SUPPORT REQUEST
INSERT INTO support_requests (ticket_number, contact_name, contact_email, contact_phone, subject, message, status) VALUES
('SUP-2026-88219', 'Rahul Sharma', 'rahul.sharma@example.edu', '+91 98765-43210', 'Document Upload Clarification', 'Inquiry regarding maximum file attachment size for supporting mark sheets.', 'OPEN');
