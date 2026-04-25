package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Module C - Maintenance & Incident Ticketing
 * Implemented by: Member 3
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public List<Ticket> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        tickets.forEach(this::populateAttachmentUrls);
        return tickets;
    }

    public List<Ticket> getTicketsByUser(String userId) {
        List<Ticket> tickets = ticketRepository.findByReportedBy(userId);
        tickets.forEach(this::populateAttachmentUrls);
        return tickets;
    }

    public List<Ticket> getTicketsByAssignee(String userId) {
        List<Ticket> tickets = ticketRepository.findByAssignedTo(userId);
        tickets.forEach(this::populateAttachmentUrls);
        return tickets;
    }

    public Ticket getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        populateAttachmentUrls(ticket);
        return ticket;
    }

    public Ticket createTicket(Ticket ticket, List<org.springframework.web.multipart.MultipartFile> files) {
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new BadRequestException("Maximum 3 attachments allowed per ticket");
            }
            
            List<String> fileNames = files.stream()
                    .map(fileStorageService::storeFile)
                    .toList();
            ticket.setAttachmentIds(fileNames);
        }
        
        ticket.setStatus(TicketStatus.OPEN);
        Ticket saved = ticketRepository.save(ticket);
        populateAttachmentUrls(saved);
        return saved;
    }

    public void deleteTicket(String id) {
        Ticket ticket = getTicketById(id);
        
        // Delete physical files
        if (ticket.getAttachmentIds() != null) {
            ticket.getAttachmentIds().forEach(fileStorageService::deleteFile);
        }
        
        // Delete comments
        List<Comment> comments = getCommentsByTicket(id);
        commentRepository.deleteAll(comments);
        
        // Delete ticket
        ticketRepository.deleteById(id);
    }

    public Ticket updateTicketStatus(String id, TicketStatus newStatus,
                                      String updatedBy, String notes) {
        Ticket ticket = getTicketById(id);

        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(notes);
        }

        Ticket saved = ticketRepository.save(ticket);
        populateAttachmentUrls(saved);
        notificationService.notifyTicketStatusChanged(saved, updatedBy);
        return saved;
    }

    public Ticket assignTicket(String id, String technicianId, String technicianName) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTo(technicianId);
        ticket.setAssigneeName(technicianName);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        Ticket saved = ticketRepository.save(ticket);
        populateAttachmentUrls(saved);
        return saved;
    }

    private void populateAttachmentUrls(Ticket ticket) {
        if (ticket.getAttachmentIds() != null) {
            List<String> urls = ticket.getAttachmentIds().stream()
                    .map(id -> "/api/uploads/" + id.replace(" ", "%20"))
                    .toList();
            ticket.setAttachmentUrls(urls);
        }
    }

    public Comment addComment(String ticketId, Comment comment) {
        // Verify ticket exists
        getTicketById(ticketId);
        comment.setTicketId(ticketId);
        Comment saved = commentRepository.save(comment);
        notificationService.notifyTicketCommentAdded(ticketId, comment.getAuthorId());
        return saved;
    }

    public Comment updateComment(String commentId, String content, String requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthorId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        comment.setContent(content);
        comment.setEdited(true);
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String requestingUserId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!isAdmin && !comment.getAuthorId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.deleteById(commentId);
    }

    public List<Comment> getCommentsByTicket(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED || next == TicketStatus.CANCELLED || next == TicketStatus.CLOSED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED || next == TicketStatus.CANCELLED || next == TicketStatus.CLOSED;
            case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.CANCELLED || next == TicketStatus.IN_PROGRESS;
            case REJECTED, CANCELLED -> next == TicketStatus.OPEN || next == TicketStatus.CLOSED;
            default -> false;
        };
        if (!valid) {
            throw new BadRequestException(
                "Invalid status transition from " + current + " to " + next
            );
        }
    }
}
