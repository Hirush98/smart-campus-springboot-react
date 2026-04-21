package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Module B - Booking Management
 * Implemented by: Member 1 (team lead)
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public List<BookingResponse> getAllBookings(BookingStatus status, String resourceId, String userId) {
        List<Booking> bookings;
        if (status != null && resourceId != null) {
            bookings = bookingRepository.findByStatusAndResourceId(status, resourceId);
        } else if (status != null && userId != null) {
            bookings = bookingRepository.findByUserIdAndStatus(userId, status);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else if (resourceId != null) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else if (userId != null) {
            bookings = bookingRepository.findByUserId(userId);
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByUser(String userId, BookingStatus status) {
        List<Booking> bookings = (status != null)
                ? bookingRepository.findByUserIdAndStatus(userId, status)
                : bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(String id) {
        return toResponse(findOrThrow(id));
    }

    public BookingResponse createBooking(BookingRequest req, String userId, String userName) {
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        long minutes = Duration.between(req.getStartTime(), req.getEndTime()).toMinutes();
        if (minutes < 15) {
            throw new BadRequestException("Booking duration must be at least 15 minutes");
        }
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                req.getResourceId(), req.getBookingDate(), req.getStartTime(), req.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException(
                "Scheduling conflict: this resource is already booked from "
                + conflicts.get(0).getStartTime() + " to " + conflicts.get(0).getEndTime());
        }
        Booking booking = Booking.builder()
                .resourceId(req.getResourceId())
                .resourceName(req.getResourceName())
                .userId(userId)
                .userName(userName)
                .bookingDate(req.getBookingDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .purpose(req.getPurpose())
                .expectedAttendees(req.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();
        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse approveBooking(String id, String adminId) {
        Booking booking = findOrThrow(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved. Status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingApproved(saved);
        return toResponse(saved);
    }

    public BookingResponse rejectBooking(String id, String adminId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A rejection reason is required");
        }
        Booking booking = findOrThrow(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected. Status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(adminId);
        booking.setRejectionReason(reason);
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingRejected(saved);
        return toResponse(saved);
    }

    public BookingResponse cancelBooking(String id, String requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(id);
        if (!isAdmin && !booking.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only APPROVED or PENDING bookings can be cancelled. Status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    private Booking findOrThrow(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .resourceName(b.getResourceName())
                .userId(b.getUserId())
                .userName(b.getUserName())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .reviewedBy(b.getReviewedBy())
                .reviewedAt(b.getReviewedAt())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
