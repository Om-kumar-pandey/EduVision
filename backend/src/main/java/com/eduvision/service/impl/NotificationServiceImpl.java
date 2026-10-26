package com.eduvision.service.impl;

import com.eduvision.dto.response.NotificationResponse;
import com.eduvision.entity.Notification;
import com.eduvision.exception.ResourceNotFoundException;
import com.eduvision.exception.UnauthorizedException;
import com.eduvision.repository.NotificationRepository;
import com.eduvision.security.UserPrincipal;
import com.eduvision.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UserPrincipal currentUser) {
        if (currentUser == null) return List.of();
        List<Notification> list = notificationRepository.findTop10ByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        return list.stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UserPrincipal currentUser) {
        if (currentUser == null) return 0;
        return notificationRepository.countByRecipientIdAndIsReadFalse(currentUser.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, UserPrincipal currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Cannot modify notifications belonging to another user.");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UserPrincipal currentUser) {
        if (currentUser == null) return;
        List<Notification> unread = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setIsRead(n.getIsRead());
        res.setCreatedAt(n.getCreatedAt());
        res.setTimeAgo(formatTimeAgo(n.getCreatedAt()));
        if (n.getRelatedComplaint() != null) {
            res.setRelatedComplaintId(n.getRelatedComplaint().getId());
        }
        return res;
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + " minutes ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hours ago";
        long days = hours / 24;
        return days + " days ago";
    }
}
