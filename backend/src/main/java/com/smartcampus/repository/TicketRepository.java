package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Module C - Implemented by: Member 3
 */
@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReportedBy(String userId);
    List<Ticket> findByAssignedTo(String userId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByStatusAndPriority(TicketStatus status, TicketPriority priority);
    List<Ticket> findByResourceId(String resourceId);
}
