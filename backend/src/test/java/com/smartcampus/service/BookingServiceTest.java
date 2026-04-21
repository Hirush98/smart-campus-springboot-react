package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingService
 * Module B - Implemented by: Member 1 (team lead)
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private NotificationService notificationService;
    @InjectMocks private BookingService bookingService;

    private BookingRequest validRequest;
    private Booking savedBooking;

    @BeforeEach
    void setUp() {
        validRequest = new BookingRequest();
        validRequest.setResourceId("resource-1");
        validRequest.setResourceName("Lab 301");
        validRequest.setBookingDate(LocalDate.now().plusDays(1));
        validRequest.setStartTime(LocalTime.of(9, 0));
        validRequest.setEndTime(LocalTime.of(10, 0));
        validRequest.setPurpose("Weekly study group session");
        validRequest.setExpectedAttendees(5);

        savedBooking = Booking.builder()
                .id("booking-1")
                .resourceId("resource-1")
                .resourceName("Lab 301")
                .userId("user-1")
                .userName("John Doe")
                .bookingDate(validRequest.getBookingDate())
                .startTime(validRequest.getStartTime())
                .endTime(validRequest.getEndTime())
                .purpose(validRequest.getPurpose())
                .expectedAttendees(5)
                .status(BookingStatus.PENDING)
                .build();
    }

    // ── createBooking tests ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create booking when no conflicts exist")
    void createBooking_noConflict_success() {
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(List.of());
        when(bookingRepository.save(any())).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(validRequest, "user-1", "John Doe");

        assertThat(response.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(response.getResourceName()).isEqualTo("Lab 301");
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw when end time is before start time")
    void createBooking_endBeforeStart_throwsBadRequest() {
        validRequest.setStartTime(LocalTime.of(10, 0));
        validRequest.setEndTime(LocalTime.of(9, 0));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user-1", "John"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End time must be after start time");
    }

    @Test
    @DisplayName("Should throw when booking duration is less than 15 minutes")
    void createBooking_tooShort_throwsBadRequest() {
        validRequest.setStartTime(LocalTime.of(9, 0));
        validRequest.setEndTime(LocalTime.of(9, 10));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user-1", "John"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("at least 15 minutes");
    }

    @Test
    @DisplayName("Should throw when scheduling conflict exists")
    void createBooking_conflict_throwsBadRequest() {
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(List.of(savedBooking));

        assertThatThrownBy(() -> bookingService.createBooking(validRequest, "user-2", "Jane"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Scheduling conflict");

        verify(bookingRepository, never()).save(any());
    }

    // ── approveBooking tests ──────────────────────────────────────────────────

    @Test
    @DisplayName("Should approve a PENDING booking")
    void approveBooking_pending_success() {
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));
        when(bookingRepository.save(any())).thenReturn(savedBooking);
        doNothing().when(notificationService).notifyBookingApproved(any());

        BookingResponse response = bookingService.approveBooking("booking-1", "admin-1");

        assertThat(response).isNotNull();
        verify(bookingRepository).save(argThat(b -> b.getStatus() == BookingStatus.APPROVED));
        verify(notificationService).notifyBookingApproved(any());
    }

    @Test
    @DisplayName("Should throw when approving a non-PENDING booking")
    void approveBooking_notPending_throwsBadRequest() {
        savedBooking.setStatus(BookingStatus.APPROVED);
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));

        assertThatThrownBy(() -> bookingService.approveBooking("booking-1", "admin-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only PENDING bookings can be approved");
    }

    // ── rejectBooking tests ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should reject a PENDING booking with reason")
    void rejectBooking_pending_success() {
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));
        when(bookingRepository.save(any())).thenReturn(savedBooking);
        doNothing().when(notificationService).notifyBookingRejected(any());

        bookingService.rejectBooking("booking-1", "admin-1", "Room not available on that date");

        verify(bookingRepository).save(argThat(b ->
                b.getStatus() == BookingStatus.REJECTED
                && b.getRejectionReason() != null));
        verify(notificationService).notifyBookingRejected(any());
    }

    @Test
    @DisplayName("Should throw when rejection reason is blank")
    void rejectBooking_blankReason_throwsBadRequest() {
        

        assertThatThrownBy(() -> bookingService.rejectBooking("booking-1", "admin-1", "  "))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("rejection reason is required");
    }

    // ── cancelBooking tests ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should allow owner to cancel their own PENDING booking")
    void cancelBooking_owner_success() {
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));
        when(bookingRepository.save(any())).thenReturn(savedBooking);

        bookingService.cancelBooking("booking-1", "user-1", false);

        verify(bookingRepository).save(argThat(b -> b.getStatus() == BookingStatus.CANCELLED));
    }

    @Test
    @DisplayName("Should throw when non-owner tries to cancel")
    void cancelBooking_nonOwner_throwsUnauthorized() {
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));

        assertThatThrownBy(() -> bookingService.cancelBooking("booking-1", "other-user", false))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("your own bookings");
    }

    @Test
    @DisplayName("Should allow admin to cancel anyone's booking")
    void cancelBooking_admin_success() {
        savedBooking.setStatus(BookingStatus.APPROVED);
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));
        when(bookingRepository.save(any())).thenReturn(savedBooking);

        bookingService.cancelBooking("booking-1", "admin-1", true);

        verify(bookingRepository).save(argThat(b -> b.getStatus() == BookingStatus.CANCELLED));
    }

    @Test
    @DisplayName("Should throw when cancelling an already rejected booking")
    void cancelBooking_rejected_throwsBadRequest() {
        savedBooking.setStatus(BookingStatus.REJECTED);
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(savedBooking));

        assertThatThrownBy(() -> bookingService.cancelBooking("booking-1", "user-1", false))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("APPROVED or PENDING");
    }
}
