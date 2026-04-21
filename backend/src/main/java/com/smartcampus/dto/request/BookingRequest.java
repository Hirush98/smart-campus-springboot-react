package com.smartcampus.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for creating a booking — keeps validation off the model
 * Module B - Implemented by: Member 1 (team lead)
 */
@Data
public class BookingRequest {

    @NotNull(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    @Max(value = 1000, message = "Expected attendees cannot exceed 1000")
    private Integer expectedAttendees;
}
