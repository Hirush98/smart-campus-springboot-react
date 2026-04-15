package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Module B - Booking Management
 * Implemented by: Member 2
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public Booking createBooking(Booking booking) {
        // Validate end time is after start time
        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check for scheduling conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException(
                "Scheduling conflict: the resource is already booked during this time slot"
            );
        }

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public Booking approveBooking(String id, String adminId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingApproved(saved);
        return saved;
    }

    public Booking rejectBooking(String id, String adminId, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(adminId);
        booking.setRejectionReason(reason);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingRejected(saved);
        return saved;
    }

    public Booking cancelBooking(String id, String requestingUserId, boolean isAdmin) {
        Booking booking = getBookingById(id);

        if (!isAdmin && !booking.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only APPROVED or PENDING bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
