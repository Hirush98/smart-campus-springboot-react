package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.security.jwt.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module B - Booking Management
 * Implemented by: Member 2
 *
 * Endpoints:
 *  GET    /api/bookings            - all bookings (ADMIN) or own (USER)
 *  GET    /api/bookings/{id}       - get one booking
 *  POST   /api/bookings            - create booking
 *  PATCH  /api/bookings/{id}/approve  - approve (ADMIN)
 *  PATCH  /api/bookings/{id}/reject   - reject (ADMIN)
 *  PATCH  /api/bookings/{id}/cancel   - cancel (USER/ADMIN)
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(bookingService.getAllBookings());
        }
        return ResponseEntity.ok(bookingService.getBookingsByUser(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
        @Valid @RequestBody Booking booking,
        @AuthenticationPrincipal UserPrincipal principal) {

    // ✅ Set userId from JWT token — never trust the client to send this
    booking.setUserId(principal.getId());

    return ResponseEntity.ok(bookingService.createBooking(booking));
}

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.approveBooking(id, principal.getId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.rejectBooking(id, principal.getId(), body.get("reason"))
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(
                bookingService.cancelBooking(id, principal.getId(), isAdmin)
        );
    }
}
