package com.eduvision;

import com.eduvision.dto.AuthResponse;
import com.eduvision.dto.LoginRequest;
import com.eduvision.dto.RegisterRequest;
import com.eduvision.entity.Role;
import com.eduvision.exception.BadRequestException;
import com.eduvision.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void testLogin_ValidCredentials_ReturnsToken() {
        LoginRequest req = new LoginRequest("rahul.sharma@eduvision.in", "Student@123");
        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("rahul.sharma@eduvision.in", res.getUser().getEmail());
        assertEquals(Role.STUDENT, res.getUser().getRole());
    }

    @Test
    void testLogin_InvalidPassword_ThrowsBadCredentials() {
        LoginRequest req = new LoginRequest("rahul.sharma@eduvision.in", "WrongPass123");
        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void testRegister_NewUser_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Priya Nair");
        req.setEmail("priya.nair@eduvision.in");
        req.setPassword("Password@123");
        req.setRole(Role.STUDENT);
        req.setInstitutionName("National Institute of Technology");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("priya.nair@eduvision.in", res.getUser().getEmail());
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Duplicate User");
        req.setEmail("rahul.sharma@eduvision.in"); // Already exists
        req.setPassword("Password@123");
        req.setRole(Role.STUDENT);
        req.setInstitutionName("ABC Institute");

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }
}
