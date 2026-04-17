package com.smartcampus;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "app.jwt.secret=test-secret-key-that-is-long-enough",
    "app.jwt.expiration-ms=3600000"
})
class SmartCampusApplicationTests {

    @Test
    void contextLoads() {
    }
}