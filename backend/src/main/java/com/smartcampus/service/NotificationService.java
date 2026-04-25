package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.NotificationType;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Module D - Notifications
 * Implemented by: Member 4
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void createAnnouncement(String title, String message) {
        String announcementId = UUID.randomUUID().toString();
        List<User> users = userRepository.findAll();
        List<Notification> announcements = new ArrayList<>();

        for (User user : users) {
            announcements.add(Notification.builder()
                    .userId(user.getId())
                    .title(title)
                    .message(message)
                    .type(NotificationType.ANNOUNCEMENT)
                    .referenceId(announcementId)
                    .referenceType("ANNOUNCEMENT")
                    .read(false)
                    .build());
        }

        notificationRepository.saveAll(announcements);
    }

    public AnnouncementDetails getAnnouncement(String announcementId) {
        Notification notification = findAnnouncementRepresentative(announcementId);
        return new AnnouncementDetails(
                notification.getReferenceId() != null ? notification.getReferenceId() : notification.getId(),
                notification.getTitle(),
                notification.getMessage()
        );
    }

    public void updateAnnouncement(String announcementId, String title, String message) {
        Notification representative = findAnnouncementRepresentative(announcementId);

        if (representative.getReferenceId() != null) {
            List<Notification> notifications = notificationRepository.findByReferenceTypeAndReferenceId(
                    "ANNOUNCEMENT", representative.getReferenceId());
            notifications.forEach(n -> {
                n.setTitle(title);
                n.setMessage(message);
            });
            notificationRepository.saveAll(notifications);
            return;
        }

        representative.setTitle(title);
        representative.setMessage(message);
        notificationRepository.save(representative);
    }

    public void deleteAnnouncement(String announcementId) {
        Notification representative = findAnnouncementRepresentative(announcementId);

        if (representative.getReferenceId() != null) {
            List<Notification> notifications = notificationRepository.findByReferenceTypeAndReferenceId(
                    "ANNOUNCEMENT", representative.getReferenceId());
            notificationRepository.deleteAll(notifications);
            return;
        }

        notificationRepository.delete(representative);
    }

    // --- Booking notifications ---

    public void notifyBookingApproved(Booking booking) {
        send(booking.getUserId(),
             "Booking Approved",
             "Your booking for " + booking.getResourceName() + " on " + booking.getBookingDate() + " has been approved.",
             NotificationType.BOOKING_APPROVED,
             booking.getId(), "BOOKING");
    }

    public void notifyBookingRejected(Booking booking) {
        send(booking.getUserId(),
             "Booking Rejected",
             "Your booking for " + booking.getResourceName() + " has been rejected. Reason: " + booking.getRejectionReason(),
             NotificationType.BOOKING_REJECTED,
             booking.getId(), "BOOKING");
    }

    // --- Ticket notifications ---

    public void notifyTicketStatusChanged(Ticket ticket, String updatedBy) {
        send(ticket.getReportedBy(),
             "Ticket Status Updated",
             "Your ticket \"" + ticket.getTitle() + "\" status changed to " + ticket.getStatus(),
             NotificationType.TICKET_STATUS_CHANGED,
             ticket.getId(), "TICKET");
    }

    public void notifyTicketCommentAdded(String ticketId, String commentAuthorId) {
        ticketRepository.findById(ticketId).ifPresent(ticket -> {
            // Notify ticket reporter if commenter is someone else
            if (!ticket.getReportedBy().equals(commentAuthorId)) {
                send(ticket.getReportedBy(),
                     "New Comment on Your Ticket",
                     "Someone commented on your ticket: \"" + ticket.getTitle() + "\"",
                     NotificationType.TICKET_COMMENT_ADDED,
                     ticketId, "TICKET");
            }
        });
    }

    // --- Private helper ---

    private void send(String userId, String title, String message,
                      NotificationType type, String referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private Notification findAnnouncementRepresentative(String announcementId) {
        return notificationRepository.findFirstByReferenceTypeAndReferenceId("ANNOUNCEMENT", announcementId)
                .or(() -> notificationRepository.findById(announcementId)
                        .filter(notification -> notification.getType() == NotificationType.ANNOUNCEMENT))
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
    }

    @Data
    public static class AnnouncementDetails {
        private final String id;
        private final String title;
        private final String message;
    }
}
