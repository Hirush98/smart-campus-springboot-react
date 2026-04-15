package com.smartcampus.model;

import com.smartcampus.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Notification model
 * Module D - Notifications
 * Implemented by: Member 4
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId; // Recipient

    private String title;
    private String message;

    private NotificationType type;

    // Reference to the related entity
    private String referenceId;   // bookingId or ticketId
    private String referenceType; // "BOOKING" or "TICKET"

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
