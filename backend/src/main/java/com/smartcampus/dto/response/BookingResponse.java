package com.smartcampus.dto.response;

import com.smartcampus.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for returning booking data — avoids exposing internal model fields
 * Module B - Implemented by: Member 1 (team lead)
 */
@Data
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
