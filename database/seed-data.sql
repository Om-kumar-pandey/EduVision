-- =====================================================================
-- EduVision – Sample Seed Data Matching Dashboard Screenshot
-- Passwords below are BCrypt encoded for:
--   Student@123: $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lqmZ9.k5jH8fO9oQk29zW5cOQO3uO
--   Officer@123: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iK21CddW
--   Admin@123:   $2a$10$4vPZ2E5H2Vw3eJ8H6QZ9n.F2E5H2Vw3eJ8H6QZ9n.F2E5H2Vw3eJ8
-- =====================================================================

USE eduvision_db;

-- Insert Seed Users
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, institution_name, avatar_url, is_active) VALUES
(1, 'rahul.sharma@eduvision.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOSxVNWqKamm', 'Rahul Sharma', '+91 9876543210', 'STUDENT', 'ABC Institute of Technology (UP)', 'assets/images/avatar-rahul.svg', TRUE),
(2, 'sk.verma@aicte-india.org', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOSxVNWqKamm', 'Dr. S. K. Verma', '+91 9811122334', 'AICTE_OFFICER', 'AICTE Headquarters, New Delhi', 'assets/images/avatar-rahul.svg', TRUE),
(3, 'admin@eduvision.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOSxVNWqKamm', 'System Administrator', '+91 9999988888', 'ADMIN', 'EduVision Central Portal', 'assets/images/avatar-rahul.svg', TRUE),
(4, 'anand.raman@eduvision.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOSxVNWqKamm', 'Dr. Anand Raman', '+91 9456712345', 'TEACHER', 'ABC Institute of Technology (UP)', 'assets/images/avatar-rahul.svg', TRUE),
(5, 'sunita.patil@eduvision.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.twOSxVNWqKamm', 'Prof. Sunita Patil', '+91 9822334455', 'HOD', 'Global Engineering College (MH)', 'assets/images/avatar-rahul.svg', TRUE);

-- Insert Sample Institutions
INSERT INTO institutions (id, name, code, type, state, city) VALUES
(1, 'ABC Institute of Technology (UP)', 'AICTE-UP-001', 'Autonomous College', 'Uttar Pradesh', 'Lucknow'),
(2, 'Global Engineering College (MH)', 'AICTE-MH-042', 'Affiliated Engineering College', 'Maharashtra', 'Pune'),
(3, 'Sunrise College of Engineering (KA)', 'AICTE-KA-089', 'Private University', 'Karnataka', 'Bengaluru'),
(4, 'Techno Institute of Technology (Delhi)', 'AICTE-DL-014', 'State University', 'Delhi', 'New Delhi'),
(5, 'Rohan Institute of Technology (BR)', 'AICTE-BR-033', 'Polytechnic Institute', 'Bihar', 'Patna');

-- Insert Sample Complaints Exactly Matching Dashboard Screenshot
INSERT INTO complaints (id, tracking_id, user_id, institution_id, institution_name, institution_type, institution_state, category, subject, description, incident_date, status, assigned_officer, created_at) VALUES
(1, 'CMP-2026-000103', 1, 1, 'ABC Institute of Technology (UP)', 'Autonomous College', 'Uttar Pradesh', 'Academic Issues', 'Delayed mid-term semester examination schedule publication', 'The examination schedule for third year computer science has been delayed repeatedly without notice, impacting students preparation.', '2026-10-20', 'IN_PROCESS', 'Dr. S. K. Verma (AICTE Northern Region)', '2026-10-22 09:30:00'),
(2, 'CMP-2026-000102', 1, 2, 'Global Engineering College (MH)', 'Affiliated Engineering College', 'Maharashtra', 'Infrastructure', 'Malfunctioning laboratory equipment in Computer Science dept', 'High-performance computing lab systems are non-functional for three weeks. Practical assignments pending.', '2026-10-15', 'UNDER_REVIEW', 'Prof. Sunita Patil (Western Directorate)', '2026-10-18 11:15:00'),
(3, 'CMP-2026-000101', 1, 3, 'Sunrise College of Engineering (KA)', 'Private University', 'Karnataka', 'Fee Related', 'Discrepancy in tuition fee receipt and late penalty reversal', 'Late fee penalty levied despite payment confirmation generated via online portal before deadline.', '2026-10-10', 'RESOLVED', 'Dr. K. R. Narayanan (Southern Region)', '2026-10-12 14:00:00'),
(4, 'CMP-2026-000100', 1, 4, 'Techno Institute of Technology (Delhi)', 'State University', 'Delhi', 'Faculty Related', 'Unavailability of designated mentor for final year thesis', 'Mentor departed institution without handover of final year project approvals.', '2026-10-01', 'RESOLVED', 'Dr. S. K. Verma (AICTE Northern Region)', '2026-10-05 10:20:00'),
(5, 'CMP-2026-000099', 1, 5, 'Rohan Institute of Technology (BR)', 'Polytechnic Institute', 'Bihar', 'Examination', 'Evaluation dispute regarding third semester practical grades', 'Discrepancy between lab attendance sheet marks and university portal tabulation.', '2026-09-25', 'IN_PROCESS', 'S. Ganguly (Eastern Region)', '2026-09-28 16:45:00');

-- Insert Status History
INSERT INTO complaint_status_history (complaint_id, previous_status, new_status, updated_by, remarks, internal_note, created_at) VALUES
(1, 'SUBMITTED', 'UNDER_REVIEW', 'System Portal', 'Complaint received and initial automated audit check passed.', 'Automated validation check OK', '2026-10-22 09:35:00'),
(1, 'UNDER_REVIEW', 'IN_PROCESS', 'Dr. S. K. Verma', 'Inquiry notice issued to College Registrar and Controller of Examinations.', 'Awaiting reply within 7 business days', '2026-10-23 14:20:00'),
(3, 'SUBMITTED', 'UNDER_REVIEW', 'System Portal', 'Grievance submitted by student.', 'Payment receipt attached', '2026-10-12 14:05:00'),
(3, 'UNDER_REVIEW', 'IN_PROCESS', 'Dr. K. R. Narayanan', 'Forwarded to Accounts Department of Institution.', 'Verify bank reference transaction ID', '2026-10-13 11:00:00'),
(3, 'IN_PROCESS', 'RESOLVED', 'Dr. K. R. Narayanan', 'Institution verified transaction error. Late penalty of Rs. 2,500 credited back to student ledger.', 'Refund voucher issued', '2026-10-16 16:30:00');

-- Insert Notifications for User 1 (Rahul Sharma) matching badge "3"
INSERT INTO notifications (user_id, title, message, is_read, related_complaint_id, created_at) VALUES
(1, 'Complaint In Process', 'Your complaint CMP-2026-000103 is now being reviewed by AICTE Officer.', FALSE, 1, '2026-10-24 08:30:00'),
(1, 'Complaint Resolved', 'Complaint CMP-2026-000101 has been resolved with remarks from the institution.', FALSE, 3, '2026-10-23 15:45:00'),
(1, 'New Policy Update', 'AICTE has revised the grievance resolution timeline to 15 business days.', FALSE, NULL, '2026-10-21 10:00:00');
