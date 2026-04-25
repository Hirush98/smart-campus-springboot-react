package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Module D - Implemented by: Member 4
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndRead(String userId, boolean read);
    long countByUserIdAndRead(String userId, boolean read);
    List<Notification> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);
    java.util.Optional<Notification> findFirstByReferenceTypeAndReferenceId(String referenceType, String referenceId);
}
