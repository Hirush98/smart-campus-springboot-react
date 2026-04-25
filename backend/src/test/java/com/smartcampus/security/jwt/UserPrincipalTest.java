package com.smartcampus.security.jwt;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserPrincipalTest {

    @Test
    void getName_returnsStoredDisplayName() {
        UserPrincipal principal = new UserPrincipal(
                "user-123",
                "Jane Doe",
                "jane@example.com",
                "secret",
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                null
        );

        assertThat(principal.getName()).isEqualTo("Jane Doe");
        assertThat(principal.getDisplayName()).isEqualTo("Jane Doe");
    }

    @Test
    void getName_fallsBackToEmailWhenDisplayNameMissing() {
        UserPrincipal principal = new UserPrincipal(
                "user-123",
                " ",
                "jane@example.com",
                "secret",
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                null
        );

        assertThat(principal.getName()).isEqualTo("jane@example.com");
        assertThat(principal.getDisplayName()).isEqualTo("jane@example.com");
    }
}
