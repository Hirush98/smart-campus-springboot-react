package com.smartcampus;

import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    @Bean
    public CommandLineRunner bootstrapAdmin(UserRepository userRepository) {
        return args -> {
            userRepository.findByEmailContainingIgnoreCase("admin").forEach(user -> {
                if (!user.getRoles().contains(Role.ADMIN)) {
                    user.getRoles().add(Role.ADMIN);
                    userRepository.save(user);
                    System.out.println("🚀 Bootstrapped ADMIN role for: " + user.getEmail());
                }
            });
        };
    }
}
