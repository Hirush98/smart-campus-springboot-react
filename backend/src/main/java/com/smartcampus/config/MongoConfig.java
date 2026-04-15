package com.smartcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables @CreatedDate and @LastModifiedDate annotations on models
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
