package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.jwt.JwtTokenProvider;
import com.smartcampus.security.jwt.UserPrincipal;
import com.smartcampus.service.CustomUserDetailsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/status")
    public ResponseEntity<?> checkStatus() {
        try {
            long count = userRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "UP");
            response.put("database", "Connected");
            response.put("userCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "DOWN");
            response.put("database", "Disconnected");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is already registered"));
        }

        String emailLower = request.getEmail().toLowerCase();
        Set<Role> roles;
        if (emailLower.contains("admin")) {
            roles = Set.of(Role.ADMIN, Role.USER);
        } else if (emailLower.contains("tech")) {
            roles = Set.of(Role.TECHNICIAN, Role.USER);
        } else {
            roles = Set.of(Role.USER);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .enabled(true)
                .provider("local")
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", principal.getId() != null ? principal.getId() : "");
        response.put("name", principal.getName() != null ? principal.getName() : "");
        response.put("email", principal.getEmail() != null ? principal.getEmail() : "");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Unauthorized");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", principal.getId() != null ? principal.getId() : "");
        response.put("name", principal.getName() != null ? principal.getName() : "");
        response.put("email", principal.getEmail() != null ? principal.getEmail() : "");
        response.put("roles", principal.getAuthorities());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technicians")
    public ResponseEntity<?> getTechnicians() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.TECHNICIAN))
                .map(u -> {
                    Map<String, Object> tech = new HashMap<>();
                    tech.put("id", u.getId() != null ? u.getId() : "");
                    tech.put("name", u.getName() != null ? u.getName() : "");
                    return tech;
                })
                .toList());
    }

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }
}
