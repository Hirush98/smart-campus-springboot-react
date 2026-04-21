package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Module B - Implemented by: Member 1 (team lead)
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
    List<Booking> findByStatusAndResourceId(BookingStatus status, String resourceId);

    // Conflict detection: overlapping time slots for same resource on same date
    // Conflict exists when: existing.startTime < newEndTime AND existing.endTime > newStartTime
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, " +
           "'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(
            String resourceId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime);

    // Same but excludes a specific booking ID (for future update use)
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, " +
           "'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 }, '_id': { $ne: ?4 } }")
    List<Booking> findConflictingBookingsExcluding(
            String resourceId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            String excludeId);
}
