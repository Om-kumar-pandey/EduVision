package com.eduvision.service;

import com.eduvision.entity.*;
import com.eduvision.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(UserRepository userRepository,
                             InstitutionRepository institutionRepository,
                             ComplaintRepository complaintRepository,
                             ComplaintStatusHistoryRepository historyRepository,
                             NotificationRepository notificationRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Seed Users
        User student = new User("rahul.sharma@eduvision.in", passwordEncoder.encode("Student@123"), "Rahul Sharma", Role.STUDENT, "ABC Institute of Technology (UP)");
        student.setPhoneNumber("+91 9876543210");
        student.setAvatarUrl("assets/images/avatar-rahul.svg");
        userRepository.save(student);

        User officer = new User("sk.verma@aicte-india.org", passwordEncoder.encode("Officer@123"), "Dr. S. K. Verma", Role.AICTE_OFFICER, "AICTE Headquarters, New Delhi");
        officer.setPhoneNumber("+91 9811122334");
        officer.setAvatarUrl("assets/images/avatar-rahul.svg");
        userRepository.save(officer);

        User admin = new User("admin@eduvision.in", passwordEncoder.encode("Admin@123"), "System Administrator", Role.ADMIN, "EduVision Central Portal");
        admin.setPhoneNumber("+91 9999988888");
        admin.setAvatarUrl("assets/images/avatar-rahul.svg");
        userRepository.save(admin);

        User teacher = new User("anand.raman@eduvision.in", passwordEncoder.encode("Student@123"), "Dr. Anand Raman", Role.TEACHER, "ABC Institute of Technology (UP)");
        userRepository.save(teacher);

        User hod = new User("sunita.patil@eduvision.in", passwordEncoder.encode("Student@123"), "Prof. Sunita Patil", Role.HOD, "Global Engineering College (MH)");
        userRepository.save(hod);

        // 2. Seed Institutions
        Institution inst1 = new Institution("ABC Institute of Technology (UP)", "AICTE-UP-001", "Autonomous College", "Uttar Pradesh", "Lucknow");
        institutionRepository.save(inst1);

        Institution inst2 = new Institution("Global Engineering College (MH)", "AICTE-MH-042", "Affiliated Engineering College", "Maharashtra", "Pune");
        institutionRepository.save(inst2);

        Institution inst3 = new Institution("Sunrise College of Engineering (KA)", "AICTE-KA-089", "Private University", "Karnataka", "Bengaluru");
        institutionRepository.save(inst3);

        Institution inst4 = new Institution("Techno Institute of Technology (Delhi)", "AICTE-DL-014", "State University", "Delhi", "New Delhi");
        institutionRepository.save(inst4);

        Institution inst5 = new Institution("Rohan Institute of Technology (BR)", "AICTE-BR-033", "Polytechnic Institute", "Bihar", "Patna");
        institutionRepository.save(inst5);

        // 3. Seed Complaints matching Dashboard Screenshot
        Complaint c1 = new Complaint();
        c1.setTrackingId("CMP-2026-000103");
        c1.setUser(student);
        c1.setInstitution(inst1);
        c1.setInstitutionName("ABC Institute of Technology (UP)");
        c1.setInstitutionType("Autonomous College");
        c1.setInstitutionState("Uttar Pradesh");
        c1.setCategory("Academic Issues");
        c1.setSubject("Delayed mid-term semester examination schedule publication");
        c1.setDescription("The department announced examination dates with insufficient preparation window, conflicting with practical schedules.");
        c1.setIncidentDate(LocalDate.of(2026, 10, 20));
        c1.setStatus(ComplaintStatus.IN_PROCESS);
        c1.setAssignedOfficer("Dr. S. K. Verma (AICTE Northern Region)");
        c1.setCreatedAt(LocalDateTime.of(2026, 10, 22, 9, 30));
        complaintRepository.save(c1);

        Complaint c2 = new Complaint();
        c2.setTrackingId("CMP-2026-000102");
        c2.setUser(student);
        c2.setInstitution(inst2);
        c2.setInstitutionName("Global Engineering College (MH)");
        c2.setInstitutionType("Affiliated Engineering College");
        c2.setInstitutionState("Maharashtra");
        c2.setCategory("Infrastructure");
        c2.setSubject("Malfunctioning laboratory equipment in Computer Science dept");
        c2.setDescription("High-performance networking lab systems non-operational.");
        c2.setIncidentDate(LocalDate.of(2026, 10, 15));
        c2.setStatus(ComplaintStatus.UNDER_REVIEW);
        c2.setAssignedOfficer("Prof. Sunita Patil (Western Directorate)");
        c2.setCreatedAt(LocalDateTime.of(2026, 10, 18, 11, 15));
        complaintRepository.save(c2);

        Complaint c3 = new Complaint();
        c3.setTrackingId("CMP-2026-000101");
        c3.setUser(student);
        c3.setInstitution(inst3);
        c3.setInstitutionName("Sunrise College of Engineering (KA)");
        c3.setInstitutionType("Private University");
        c3.setInstitutionState("Karnataka");
        c3.setCategory("Fee Related");
        c3.setSubject("Discrepancy in tuition fee receipt and late penalty reversal");
        c3.setDescription("Late penalty levied erroneously despite payment before the declared cutoff date.");
        c3.setIncidentDate(LocalDate.of(2026, 10, 10));
        c3.setStatus(ComplaintStatus.RESOLVED);
        c3.setAssignedOfficer("Dr. K. R. Narayanan (Southern Region)");
        c3.setResolutionSummary("Late fee penalty of Rs. 2,500 reversed and credited to student account.");
        c3.setCreatedAt(LocalDateTime.of(2026, 10, 12, 14, 0));
        complaintRepository.save(c3);

        Complaint c4 = new Complaint();
        c4.setTrackingId("CMP-2026-000100");
        c4.setUser(student);
        c4.setInstitution(inst4);
        c4.setInstitutionName("Techno Institute of Technology (Delhi)");
        c4.setInstitutionType("State University");
        c4.setInstitutionState("Delhi");
        c4.setCategory("Faculty Related");
        c4.setSubject("Unavailability of designated mentor for final year thesis");
        c4.setDescription("Assigned mentor absent without alternate mentor designated.");
        c4.setIncidentDate(LocalDate.of(2026, 10, 1));
        c4.setStatus(ComplaintStatus.RESOLVED);
        c4.setAssignedOfficer("Dr. S. K. Verma (AICTE Northern Region)");
        c4.setResolutionSummary("New senior project guide appointed by Head of Department.");
        c4.setCreatedAt(LocalDateTime.of(2026, 10, 5, 10, 20));
        complaintRepository.save(c4);

        Complaint c5 = new Complaint();
        c5.setTrackingId("CMP-2026-000099");
        c5.setUser(student);
        c5.setInstitution(inst5);
        c5.setInstitutionName("Rohan Institute of Technology (BR)");
        c5.setInstitutionType("Polytechnic Institute");
        c5.setInstitutionState("Bihar");
        c5.setCategory("Examination");
        c5.setSubject("Evaluation dispute regarding third semester practical grades");
        c5.setDescription("Discrepancy between lab sign-off sheet and semester portal result.");
        c5.setIncidentDate(LocalDate.of(2026, 9, 25));
        c5.setStatus(ComplaintStatus.IN_PROCESS);
        c5.setAssignedOfficer("S. Ganguly (Eastern Region)");
        c5.setCreatedAt(LocalDateTime.of(2026, 9, 28, 16, 45));
        complaintRepository.save(c5);

        // 4. Seed Status History for CMP-2026-000103
        historyRepository.save(new ComplaintStatusHistory(c1, null, ComplaintStatus.SUBMITTED, "Rahul Sharma", "Complaint submitted through portal", null));
        historyRepository.save(new ComplaintStatusHistory(c1, ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, "AICTE System", "Initial verification passed", null));
        historyRepository.save(new ComplaintStatusHistory(c1, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.IN_PROCESS, "Dr. S. K. Verma", "Official institutional notice dispatched to College Dean", "Awaiting institutional response"));

        // 5. Seed Notifications for Rahul Sharma
        notificationRepository.save(new Notification(student, "Complaint In Process", "Your complaint CMP-2026-000103 is now being reviewed by AICTE Officer.", c1.getId()));
        notificationRepository.save(new Notification(student, "Complaint Resolved", "Complaint CMP-2026-000101 has been resolved with remarks from the institution.", c3.getId()));
        notificationRepository.save(new Notification(student, "New Policy Update", "AICTE has revised the grievance resolution timeline to 15 business days.", null));
    }
}
