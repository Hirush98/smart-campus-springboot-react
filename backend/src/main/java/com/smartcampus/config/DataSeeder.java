package com.smartcampus.config;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * Seeds initial data into MongoDB on first startup.
 * Skips seeding if data already exists.
 * Remove this class or set a flag once your team has real data.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedResources();
        seedAdminUser();
        seedBookings();
    }

    private void seedResources() {
        if (resourceRepository.count() > 0) {
            log.info("Resources already exist — skipping seed");
            return;
        }

        List<Resource> resources = List.of(
            Resource.builder()
                .name("Lecture Hall A")
                .type(ResourceType.LECTURE_HALL)
                .location("Block A, Ground Floor")
                .building("Block A")
                .floor("Ground")
                .capacity(120)
                .description("Main lecture hall with projector and PA system")
                .availabilityWindows(List.of("08:00-18:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Computer Lab 301")
                .type(ResourceType.LAB)
                .location("Block B, 3rd Floor")
                .building("Block B")
                .floor("3rd")
                .capacity(40)
                .description("40 workstations with high-speed internet")
                .availabilityWindows(List.of("08:00-20:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Meeting Room 101")
                .type(ResourceType.MEETING_ROOM)
                .location("Block C, 1st Floor")
                .building("Block C")
                .floor("1st")
                .capacity(12)
                .description("Small meeting room with whiteboard and TV screen")
                .availabilityWindows(List.of("09:00-17:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Seminar Room 202")
                .type(ResourceType.MEETING_ROOM)
                .location("Block A, 2nd Floor")
                .building("Block A")
                .floor("2nd")
                .capacity(30)
                .description("Seminar room with presentation setup")
                .availabilityWindows(List.of("08:00-18:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Physics Lab")
                .type(ResourceType.LAB)
                .location("Block D, Ground Floor")
                .building("Block D")
                .floor("Ground")
                .capacity(25)
                .description("Physics experiments lab — requires prior approval")
                .availabilityWindows(List.of("09:00-16:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Projector Unit 01")
                .type(ResourceType.EQUIPMENT)
                .location("Equipment Store, Block A")
                .building("Block A")
                .floor("Ground")
                .capacity(1)
                .description("Portable HD projector — collect from store room")
                .availabilityWindows(List.of("08:00-18:00"))
                .status(ResourceStatus.ACTIVE)
                .build(),

            Resource.builder()
                .name("Lecture Hall B")
                .type(ResourceType.LECTURE_HALL)
                .location("Block B, Ground Floor")
                .building("Block B")
                .floor("Ground")
                .capacity(80)
                .description("Medium lecture hall — currently under maintenance")
                .availabilityWindows(List.of("08:00-18:00"))
                .status(ResourceStatus.UNDER_MAINTENANCE)
                .build()
        );

        resourceRepository.saveAll(resources);
        log.info("Seeded {} resources", resources.size());
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@smartcampus.lk")) {
            log.info("Admin user already exists — skipping seed");
            return;
        }

        User admin = User.builder()
                .name("System Admin")
                .email("admin@smartcampus.lk")
                .password(passwordEncoder.encode("Admin@1234"))
                .roles(Set.of(Role.ADMIN, Role.USER))
                .enabled(true)
                .provider("local")
                .build();

        userRepository.save(admin);
        log.info("Seeded admin user — email: admin@smartcampus.lk / password: Admin@1234");
    }

    private void seedBookings() {
        if (bookingRepository.count() > 0) {
            log.info("Bookings already exist — skipping seed");
            return;
        }

        List<Resource> resources = resourceRepository.findAll();
        if (resources.size() < 2) {
            log.warn("Not enough resources to seed bookings");
            return;
        }

        // Use first two seeded resources: Lecture Hall A and Computer Lab 301
        String hallId   = resources.get(0).getId();
        String hallName = resources.get(0).getName();
        String labId    = resources.get(1).getId();
        String labName  = resources.get(1).getName();

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate twoDays  = LocalDate.now().plusDays(2);
        LocalDate threeDays = LocalDate.now().plusDays(3);
        LocalDate nextWeek = LocalDate.now().plusDays(7);

        List<Booking> bookings = List.of(

            // ── CONFLICT TEST 1 ─────────────────────────────────────────────
            // Lecture Hall A | Tomorrow | 09:00–11:00 | APPROVED
            // → Try booking same hall tomorrow 10:00–12:00  ← overlaps end
            // → Try booking same hall tomorrow 08:00–10:00  ← overlaps start
            // → Try booking same hall tomorrow 09:30–10:30  ← fully inside
            Booking.builder()
                .resourceId(hallId).resourceName(hallName)
                .userId("seed-user-1").userName("Alice Johnson")
                .bookingDate(tomorrow)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .purpose("IT3030 Group Project Presentation — PAF Module Demo")
                .expectedAttendees(30)
                .status(BookingStatus.APPROVED)
                .reviewedBy("admin").reviewedAt(LocalDateTime.now())
                .build(),

            // ── CONFLICT TEST 2 ─────────────────────────────────────────────
            // Lecture Hall A | Tomorrow | 13:00–15:00 | APPROVED
            // → Try booking same hall tomorrow 14:00–16:00  ← overlaps
            // → Try booking same hall tomorrow 11:00–13:00  ← adjacent, should PASS
            Booking.builder()
                .resourceId(hallId).resourceName(hallName)
                .userId("seed-user-2").userName("Bob Silva")
                .bookingDate(tomorrow)
                .startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(15, 0))
                .purpose("Database Systems Revision Lecture")
                .expectedAttendees(60)
                .status(BookingStatus.APPROVED)
                .reviewedBy("admin").reviewedAt(LocalDateTime.now())
                .build(),

            // ── CONFLICT TEST 3 ─────────────────────────────────────────────
            // Computer Lab 301 | Tomorrow | 10:00–12:00 | PENDING
            // PENDING bookings also block the slot (conflict query includes PENDING)
            // → Try booking same lab tomorrow 09:00–11:00  ← overlaps
            // → Try booking same lab tomorrow 10:00–12:00  ← exact same slot
            Booking.builder()
                .resourceId(labId).resourceName(labName)
                .userId("seed-user-3").userName("Carol Perera")
                .bookingDate(tomorrow)
                .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(12, 0))
                .purpose("Web Development Lab Session — IT3010 Practical")
                .expectedAttendees(20)
                .status(BookingStatus.PENDING)
                .build(),

            // ── NO CONFLICT — safe slot for testing successful bookings ──────
            // Lecture Hall A | Tomorrow | 15:30–17:00 | APPROVED (gap after 13–15)
            // → Try booking same hall tomorrow 15:00–15:30  ← adjacent, should PASS
            Booking.builder()
                .resourceId(hallId).resourceName(hallName)
                .userId("seed-user-4").userName("David Nair")
                .bookingDate(tomorrow)
                .startTime(LocalTime.of(15, 30)).endTime(LocalTime.of(17, 0))
                .purpose("Software Engineering Guest Lecture")
                .expectedAttendees(80)
                .status(BookingStatus.APPROVED)
                .reviewedBy("admin").reviewedAt(LocalDateTime.now())
                .build(),

            // ── REJECTED booking — does NOT block the slot ───────────────────
            // Computer Lab 301 | Day+2 | 09:00–11:00 | REJECTED
            // → Booking same lab day+2 09:00–11:00 should PASS (rejected = free)
            Booking.builder()
                .resourceId(labId).resourceName(labName)
                .userId("seed-user-5").userName("Eve Fernando")
                .bookingDate(twoDays)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(11, 0))
                .purpose("Mobile App Development Workshop")
                .expectedAttendees(25)
                .status(BookingStatus.REJECTED)
                .rejectionReason("Lab is reserved for semester exams on this date")
                .reviewedBy("admin").reviewedAt(LocalDateTime.now())
                .build(),

            // ── CANCELLED booking — does NOT block the slot ──────────────────
            // Lecture Hall A | Day+3 | 09:00–10:00 | CANCELLED
            // → Booking same hall day+3 09:00–10:00 should PASS (cancelled = free)
            Booking.builder()
                .resourceId(hallId).resourceName(hallName)
                .userId("seed-user-1").userName("Alice Johnson")
                .bookingDate(threeDays)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(10, 0))
                .purpose("Club Committee Meeting")
                .expectedAttendees(15)
                .status(BookingStatus.CANCELLED)
                .build(),

            // ── Future safe slot — freely bookable ───────────────────────────
            // Computer Lab 301 | Next week | 14:00–16:00 | APPROVED
            Booking.builder()
                .resourceId(labId).resourceName(labName)
                .userId("seed-user-2").userName("Bob Silva")
                .bookingDate(nextWeek)
                .startTime(LocalTime.of(14, 0)).endTime(LocalTime.of(16, 0))
                .purpose("PAF Assignment Final Demo Practice")
                .expectedAttendees(5)
                .status(BookingStatus.APPROVED)
                .reviewedBy("admin").reviewedAt(LocalDateTime.now())
                .build()
        );

        bookingRepository.saveAll(bookings);
        log.info("Seeded {} bookings for conflict detection testing", bookings.size());
        log.info("Conflict test guide:");
        log.info("  CONFLICT  → Lecture Hall A | Tomorrow | 10:00-12:00 (overlaps 09:00-11:00)");
        log.info("  CONFLICT  → Computer Lab   | Tomorrow | 09:00-11:00 (overlaps PENDING 10:00-12:00)");
        log.info("  NO CONFLICT → Lecture Hall A | Tomorrow | 11:00-13:00 (adjacent slot)");
        log.info("  NO CONFLICT → Computer Lab   | Day+2    | 09:00-11:00 (REJECTED doesn't block)");
    }
}