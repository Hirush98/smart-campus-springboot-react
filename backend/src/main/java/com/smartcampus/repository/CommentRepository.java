package com.smartcampus.repository;

import com.smartcampus.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Module C - Implemented by: Member 3
 */
@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
    List<Comment> findByAuthorId(String authorId);
    void deleteByTicketId(String ticketId);
}
