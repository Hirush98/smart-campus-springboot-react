package com.smartcampus.service;

import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.jwt.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Module E - Implemented by: Member 4
 * Loads UserDetails by email (used by AuthenticationManager for login)
 * Loads UserDetails by userId (used by JwtAuthenticationFilter)
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Called with EMAIL from AuthenticationManager during login
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(UserPrincipal::create)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // Called with userId from JwtAuthenticationFilter (after token validation)
    public UserDetails loadUserById(String userId) {
        return userRepository.findById(userId)
                .map(UserPrincipal::create)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}