package com.eduvision.service;

import com.eduvision.dto.SupportRequestDto;
import com.eduvision.entity.SupportRequest;
import com.eduvision.repository.SupportRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportService {

    private final SupportRequestRepository supportRequestRepository;

    public SupportService(SupportRequestRepository supportRequestRepository) {
        this.supportRequestRepository = supportRequestRepository;
    }

    @Transactional
    public void saveSupportRequest(SupportRequestDto dto) {
        SupportRequest request = new SupportRequest(
                dto.getName(),
                dto.getEmail(),
                dto.getComplaintId(),
                dto.getSubject(),
                dto.getMessage()
        );
        supportRequestRepository.save(request);
    }
}
