package com.smartcampus;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus_test",
    "app.jwt.secret=test-secret-key-that-is-long-enough-for-testing-purposes-only",
    "spring.security.oauth2.client.registration.google.client-id=test",
    "spring.security.oauth2.client.registration.google.client-secret=test"
})
class SmartCampusApplicationTests {

    @Test
    void contextLoads() {
    }
}
