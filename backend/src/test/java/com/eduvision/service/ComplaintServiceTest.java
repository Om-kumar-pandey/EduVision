package com.eduvision.service;

import com.eduvision.dto.request.CreateComplaintRequest;
import com.eduvision.dto.response.ComplaintDetailResponse;
import com.eduvision.entity.*;
import com.eduvision.repository.*;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.impl.ComplaintServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ComplaintStatusHistoryRepository statusHistoryRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ComplaintServiceImpl complaintService;

    private User studentUser;
    private Institution institution;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        institution = new Institution(1L, "INST-UP-001", "ABC Institute of Technology (UP)", "Engineering & Technology", "UP", "Lucknow");
        studentUser = new User(1L, "rahul.sharma@example.edu", "hashedPass", "Rahul Sharma", Role.STUDENT);
        studentUser.setInstitution(institution);

        userPrincipal = new UserPrincipal(
                1L, "rahul.sharma@example.edu", "hashedPass", "Rahul Sharma", Role.STUDENT,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")), true
        );
    }

    @Test
    void testCreateComplaintSuccess() {
        CreateComplaintRequest request = new CreateComplaintRequest();
        request.setInstitutionId(1L);
        request.setInstitutionName("ABC Institute of Technology (UP)");
        request.setCategory("Academic Issues");
        request.setSubject("Delay in results");
        request.setDescription("Semester 6 results delayed beyond scheduled notification window.");
        request.setIncidentDate(LocalDate.now());
        request.setDeclarationAccepted(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(studentUser));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        when(complaintRepository.count()).thenReturn(3L);

        Complaint saved = new Complaint();
        saved.setId(10L);
        saved.setTrackingId("CMP-2026-000107");
        saved.setComplainant(studentUser);
        saved.setInstitution(institution);
        saved.setCategory(request.getCategory());
        saved.setSubject(request.getSubject());
        saved.setDescription(request.getDescription());
        saved.setStatus(ComplaintStatus.SUBMITTED);

        when(complaintRepository.save(any(Complaint.class))).thenReturn(saved);

        ComplaintDetailResponse response = complaintService.createComplaint(request, userPrincipal);

        assertNotNull(response);
        assertEquals("CMP-2026-000107", response.getTrackingId());
        assertEquals(ComplaintStatus.SUBMITTED, response.getStatus());
        verify(statusHistoryRepository, times(1)).save(any(ComplaintStatusHistory.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
}
