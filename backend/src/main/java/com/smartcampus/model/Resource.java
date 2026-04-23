package com.smartcampus.model;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Campus resource model (rooms, labs, equipment)
 * Module A - Facilities & Assets Catalogue
 * Implemented by: Member 1
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    private String building;
    private String floor;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String description;

    // Available time windows e.g. ["08:00-18:00"]
    private List<String> availabilityWindows;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    // Equipment-specific fields
    private String serialNumber;
    private String manufacturer;

    // ✅ NEW: image URLs (max 5 enforced in service layer)
    private List<String> imageUrls;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}