package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.enums.NotificationType;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private NotificationService notificationService;

    @Captor private ArgumentCaptor<Notification> notificationCaptor;

    private Booking booking;

    @BeforeEach
    void setUp() {
        booking = Booking.builder()
                .id("booking-1")
                .userId("user-1")
                .userName("Jane Doe")
                .resourceName("Lab 301")
                .bookingDate(LocalDate.of(2026, 4, 30))
                .rejectionReason("Room unavailable due to maintenance")
                .build();
    }

    @Test
    @DisplayName("Should save a booking approved notification for the booking owner")
    void notifyBookingApproved_savesNotificationForBookingOwner() {
        notificationService.notifyBookingApproved(booking);

        verify(notificationRepository).save(notificationCaptor.capture());
        Notification notification = notificationCaptor.getValue();

        assertThat(notification.getUserId()).isEqualTo("user-1");
        assertThat(notification.getType()).isEqualTo(NotificationType.BOOKING_APPROVED);
        assertThat(notification.getReferenceId()).isEqualTo("booking-1");
        assertThat(notification.getReferenceType()).isEqualTo("BOOKING");
        assertThat(notification.getTitle()).isEqualTo("Booking Approved");
        assertThat(notification.getMessage()).contains("Lab 301", "2026-04-30", "approved");
        assertThat(notification.isRead()).isFalse();
    }

    @Test
    @DisplayName("Should save a booking rejected notification with the rejection reason")
    void notifyBookingRejected_savesNotificationWithReason() {
        notificationService.notifyBookingRejected(booking);

        verify(notificationRepository).save(notificationCaptor.capture());
        Notification notification = notificationCaptor.getValue();

        assertThat(notification.getUserId()).isEqualTo("user-1");
        assertThat(notification.getType()).isEqualTo(NotificationType.BOOKING_REJECTED);
        assertThat(notification.getReferenceId()).isEqualTo("booking-1");
        assertThat(notification.getReferenceType()).isEqualTo("BOOKING");
        assertThat(notification.getTitle()).isEqualTo("Booking Rejected");
        assertThat(notification.getMessage()).contains(
                "Lab 301",
                "2026-04-30",
                "rejected",
                "Room unavailable due to maintenance"
        );
        assertThat(notification.isRead()).isFalse();
    }
}
