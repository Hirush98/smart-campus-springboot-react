package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.model.enums.BookingStatus;
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
 * Implemented by: Member 1 (team lead)
 *
 * GET    /api/bookings                    - list bookings (USER = own, ADMIN = all + filters)
 * GET    /api/bookings/{id}               - get single booking
 * POST   /api/bookings                    - create booking request
 * PATCH  /api/bookings/{id}/approve       - approve (ADMIN only)
 * PATCH  /api/bookings/{id}/reject        - reject with reason (ADMIN only)
 * PATCH  /api/bookings/{id}/cancel        - cancel (owner or ADMIN)
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = isAdmin(principal);

        if (isAdmin) {
            // Admin can filter by status, resourceId, userId
            return ResponseEntity.ok(
                bookingService.getAllBookings(status, resourceId, userId)
            );
        }

        // Regular user sees only their own bookings, optionally filtered by status
        return ResponseEntity.ok(
            bookingService.getBookingsByUser(principal.getId(), status)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(
                        request, principal.getId(), principal.getName()));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.approveBooking(id, principal.getId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.rejectBooking(id, principal.getId(), body.get("reason"))
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                bookingService.cancelBooking(id, principal.getId(), isAdmin(principal))
        );
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
