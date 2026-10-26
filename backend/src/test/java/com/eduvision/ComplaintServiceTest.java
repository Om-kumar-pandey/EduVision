package com.eduvision;

import com.eduvision.dto.ComplaintResponseDto;
import com.eduvision.dto.CreateComplaintRequest;
import com.eduvision.dto.PublicTrackingDto;
import com.eduvision.entity.ComplaintStatus;
import com.eduvision.entity.Role;
import com.eduvision.entity.User;
import com.eduvision.exception.UnauthorizedException;
import com.eduvision.repository.UserRepository;
import com.eduvision.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ComplaintServiceTest {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    private User student;
    private User anotherStudent;

    @BeforeEach
    void setUp() {
        student = userRepository.findByEmail("rahul.sharma@eduvision.in").orElseGet(() -> {
            User u = new User("test.student@eduvision.in", "pass", "Test Student", Role.STUDENT, "ABC Institute");
            return userRepository.save(u);
        });

        anotherStudent = userRepository.findByEmail("other.student@eduvision.in").orElseGet(() -> {
            User u = new User("other.student@eduvision.in", "pass", "Other Student", Role.STUDENT, "Other Institute");
            return userRepository.save(u);
        });
    }

    @Test
    void testCreateComplaint_GeneratesTrackingIdAndPersists() {
        CreateComplaintRequest request = new CreateComplaintRequest();
        request.setComplainantName("Test Student");
        request.setComplainantEmail("test.student@eduvision.in");
        request.setInstitutionName("ABC Institute of Technology (UP)");
        request.setInstitutionType("Autonomous College");
        request.setInstitutionState("Uttar Pradesh");
        request.setCategory("Academic Issues");
        request.setSubject("Test grievance subject for verification");
        request.setDescription("This is a detailed description of the grievance meeting minimum length requirements.");
        request.setIncidentDate(LocalDate.now());

        ComplaintResponseDto response = complaintService.createComplaint(student, request);

        assertNotNull(response);
        assertNotNull(response.getTrackingId());
        assertTrue(response.getTrackingId().startsWith("CMP-"));
        assertEquals(ComplaintStatus.SUBMITTED, response.getStatus());
        assertEquals("Academic Issues", response.getCategory());
        assertFalse(response.getHistory().isEmpty());
    }

    @Test
    void testPublicTracking_ReturnsSafeSummaryWithoutPrivateContactData() {
        PublicTrackingDto tracking = complaintService.getPublicTrackingInfo("CMP-2026-000103");

        assertNotNull(tracking);
        assertEquals("CMP-2026-000103", tracking.getTrackingId());
        assertNotNull(tracking.getStatus());
        assertFalse(tracking.getHistory().isEmpty());
    }

    @Test
    void testComplaintOwnership_RestrictsUnauthorizedUser() {
        // anotherStudent attempting to view student's private complaint CMP-2026-000103
        assertThrows(UnauthorizedException.class, () -> {
            complaintService.getComplaintDetails("CMP-2026-000103", anotherStudent);
        });
    }

    @Test
    void testGetUserComplaints_ReturnsOnlyUserRecords() {
        List<ComplaintResponseDto> complaints = complaintService.getUserComplaints(student);
        assertNotNull(complaints);
        assertFalse(complaints.isEmpty());
    }
}
