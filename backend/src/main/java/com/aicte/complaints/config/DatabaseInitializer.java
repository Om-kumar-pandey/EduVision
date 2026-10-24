package com.aicte.complaints.config;

import com.aicte.complaints.entity.Bureau;
import com.aicte.complaints.entity.User;
import com.aicte.complaints.repository.BureauRepository;
import com.aicte.complaints.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserRepository userRepository;
    private final BureauRepository bureauRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository,
                               BureauRepository bureauRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bureauRepository = bureauRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Verifying AICTE role-based demo accounts with BCrypt strength 12...");

        // 1. Super Admin
        createOrUpdateUser("admin@aicte.gov.in", "Admin@123", "Dr. Ramesh Sharma", "SYS_ADMIN", null, null, "Chief Information Officer & Administrator", "+91 11 2958 1001");

        // 2. Senior Authority
        createOrUpdateUser("monitor@aicte.gov.in", "Monitor@123", "Smt. Sunita Verma", "CENTRAL_MONITOR", null, null, "Director, Central Monitoring & Quality Assurance", "+91 11 2958 1002");

        // 3. Regional Officers
        createOrUpdateUser("western_ro@aicte.gov.in", "Officer@123", "Dr. Sandeep Deshmukh", "REGIONAL_OFFICER", null, "Western", "Regional Officer - Western Region", "+91 22 2285 5412");
        createOrUpdateUser("northern_ro@aicte.gov.in", "Officer@123", "Shri Alok Kumar", "REGIONAL_OFFICER", null, "Northern", "Regional Officer - Northern Region", "+91 11 2372 4151");

        // 4. Bureau Officers
        Bureau rbBureau = bureauRepository.findByCode("RB").orElse(null);
        Bureau pgrcBureau = bureauRepository.findByCode("PGRC").orElse(null);
        Bureau approvalBureau = bureauRepository.findByCode("APPROVAL").orElse(null);

        createOrUpdateUser("rb_officer@aicte.gov.in", "Officer@123", "Shri Rajesh Kulkarni", "BUREAU_OFFICER", rbBureau, null, "Senior Regulatory Officer (RB)", "+91 11 2958 1003");
        createOrUpdateUser("pgrc_officer@aicte.gov.in", "Officer@123", "Dr. Ananya Sen", "BUREAU_OFFICER", pgrcBureau, null, "Senior Grievance Redressal Officer (PGRC)", "+91 11 2958 1004");
        createOrUpdateUser("approval_officer@aicte.gov.in", "Officer@123", "Shri Vikram Patil", "BUREAU_OFFICER", approvalBureau, null, "Approval Bureau Scrutiny Officer", "+91 11 2958 1005");

        // 5. Complainant
        createOrUpdateUser("rahul.sharma@gmail.com", "Student@123", "Rahul Sharma", "COMPLAINANT", null, null, "Final Year B.Tech Student", "+91 98765 43210");

        log.info("Database role credentials verification complete.");
    }

    private void createOrUpdateUser(String email, String rawPassword, String fullName, String role, Bureau bureau, String region, String designation, String phone) {
        Optional<User> opt = userRepository.findByEmail(email);
        User user = opt.orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setBureau(bureau);
        user.setRegion(region);
        user.setDesignation(designation);
        user.setPhone(phone);
        user.setIsActive(true);

        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
        }

        userRepository.save(user);
    }
}
