package com.smartcampus.model;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Maintenance / Incident ticket model
 * Module C - Maintenance & Incident Ticketing
 * Implemented by: Member 3
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    // Resource or location this ticket is about
    private String resourceId;
    private String location;

    // Reporter
    @NotNull
    private String reportedBy;
    private String reporterName;

    private String contactDetails;

    // Assigned technician
    private String assignedTo;
    private String assigneeName;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    // Up to 3 image attachments (stored as GridFS IDs or file paths)
    @Size(max = 3, message = "Maximum 3 attachments allowed")
    private List<String> attachmentIds;

    private String resolutionNotes;
    private String rejectionReason;

    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
