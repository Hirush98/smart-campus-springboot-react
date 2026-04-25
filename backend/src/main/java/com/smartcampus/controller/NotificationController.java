package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.security.jwt.UserPrincipal;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module D - Notifications
 * Implemented by: Member 4
 *
 * Endpoints:
 *  GET   /api/notifications          - get my notifications
 *  GET   /api/notifications/unread-count - unread count badge
 *  PATCH /api/notifications/{id}/read   - mark one as read
 *  PATCH /api/notifications/read-all    - mark all as read
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(principal.getId())
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        long count = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request) {
        notificationService.createAnnouncement(
                request.getTitle(),
                request.getMessage(),
                request.getAudience()
        );
        return ResponseEntity.ok(Map.of("message", "Announcement created successfully"));
    }

    @GetMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationService.AnnouncementDetails> getAnnouncement(
            @PathVariable String id) {
        return ResponseEntity.ok(notificationService.getAnnouncement(id));
    }

    @PutMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateAnnouncement(
            @PathVariable String id,
            @Valid @RequestBody AnnouncementRequest request) {
        notificationService.updateAnnouncement(
                id,
                request.getTitle(),
                request.getMessage(),
                request.getAudience()
        );
        return ResponseEntity.ok(Map.of("message", "Announcement updated successfully"));
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable String id) {
        notificationService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @lombok.Data
    public static class AnnouncementRequest {
        @NotBlank
        private String title;

        @NotBlank
        private String message;

        @NotBlank
        private String audience;
    }
}
