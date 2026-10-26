package com.eduvision.service.impl;

import com.eduvision.dto.request.CreateSupportRequest;
import com.eduvision.entity.SupportRequest;
import com.eduvision.entity.User;
import com.eduvision.repository.SupportRequestRepository;
import com.eduvision.repository.UserRepository;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.SupportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SupportServiceImpl implements SupportService {

    private final SupportRequestRepository supportRequestRepository;
    private final UserRepository userRepository;

    public SupportServiceImpl(SupportRequestRepository supportRequestRepository, UserRepository userRepository) {
        this.supportRequestRepository = supportRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SupportRequest createSupportRequest(CreateSupportRequest request, UserPrincipal currentUser) {
        SupportRequest sr = new SupportRequest();
        sr.setTicketNumber("SUP-2026-" + (int)(Math.random() * 90000 + 10000));
        sr.setContactName(request.getContactName().trim());
        sr.setContactEmail(request.getContactEmail().trim());
        sr.setContactPhone(request.getContactPhone());
        sr.setSubject(request.getSubject().trim());
        sr.setMessage(request.getMessage().trim());
        sr.setStatus("OPEN");

        if (currentUser != null) {
            User user = userRepository.findById(currentUser.getId()).orElse(null);
            sr.setUser(user);
        }

        return supportRequestRepository.save(sr);
    }
}
