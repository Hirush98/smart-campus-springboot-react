package com.smartcampus.config;

import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedResources();
        seedAdminUser();
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
}

