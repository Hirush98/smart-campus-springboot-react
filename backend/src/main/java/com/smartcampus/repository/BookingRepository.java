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
 * Module B - Implemented by: Member 2
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    // Conflict detection: find overlapping bookings for the same resource on the same date
    // A conflict exists when: existing.startTime < newEndTime AND existing.endTime > newStartTime
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate bookingDate,
                                          LocalTime startTime, LocalTime endTime);

    // Same as above but excluding a specific booking ID (for update scenarios)
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 }, '_id': { $ne: ?4 } }")
    List<Booking> findConflictingBookingsExcluding(String resourceId, LocalDate bookingDate,
                                                    LocalTime startTime, LocalTime endTime,
                                                    String excludeBookingId);
}
