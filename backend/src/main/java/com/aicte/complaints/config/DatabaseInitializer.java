package com.aicte.complaints.config;

import com.aicte.complaints.entity.User;
import com.aicte.complaints.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Verifying initial AICTE demo credentials with BCrypt strength 12...");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            String targetRawPassword;
            if ("admin@aicte.gov.in".equalsIgnoreCase(user.getEmail())) {
                targetRawPassword = "Admin@123";
            } else if ("monitor@aicte.gov.in".equalsIgnoreCase(user.getEmail())) {
                targetRawPassword = "Monitor@123";
            } else {
                targetRawPassword = "Officer@123";
            }

            // Ensure password matches targetRawPassword
            if (!passwordEncoder.matches(targetRawPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(targetRawPassword));
                userRepository.save(user);
                log.info("Updated BCrypt hash for user: {}", user.getEmail());
            }
        }
        log.info("Database initialization and credential check complete.");
    }
}
