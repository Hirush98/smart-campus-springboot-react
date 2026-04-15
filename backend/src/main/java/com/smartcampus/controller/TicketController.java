package com.smartcampus.controller;

import com.smartcampus.model.Comment;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.security.jwt.UserPrincipal;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Module C - Maintenance & Incident Ticketing
 * Implemented by: Member 3
 *
 * Endpoints:
 *  GET    /api/tickets                        - list tickets
 *  GET    /api/tickets/{id}                   - get one ticket
 *  POST   /api/tickets                        - create ticket
 *  PATCH  /api/tickets/{id}/status            - update status
 *  PATCH  /api/tickets/{id}/assign            - assign technician (ADMIN)
 *  DELETE /api/tickets/{id}                   - delete ticket (ADMIN)
 *  GET    /api/tickets/{id}/comments          - list comments
 *  POST   /api/tickets/{id}/comments          - add comment
 *  PUT    /api/tickets/{id}/comments/{cid}    - edit comment
 *  DELETE /api/tickets/{id}/comments/{cid}    - delete comment
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTechnician = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TECHNICIAN"));

        if (isAdmin) {
            return ResponseEntity.ok(ticketService.getAllTickets());
        }
        if (isTechnician) {
            return ResponseEntity.ok(ticketService.getTicketsByAssignee(principal.getId()));
        }
        return ResponseEntity.ok(ticketService.getTicketsByUser(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody Ticket ticket,
            @AuthenticationPrincipal UserPrincipal principal) {
        ticket.setReportedBy(principal.getId());
        ticket.setReporterName(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        TicketStatus newStatus = TicketStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(
                ticketService.updateTicketStatus(id, newStatus, principal.getId(), body.get("notes"))
        );
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                ticketService.assignTicket(id, body.get("technicianId"), body.get("technicianName"))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        // TODO: implement deleteTicket in service
        return ResponseEntity.noContent().build();
    }

    // --- Comments ---

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicket(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String id,
            @Valid @RequestBody Comment comment,
            @AuthenticationPrincipal UserPrincipal principal) {
        comment.setAuthorId(principal.getId());
        comment.setAuthorName(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, comment));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                ticketService.updateComment(commentId, body.get("content"), principal.getId())
        );
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ticketService.deleteComment(commentId, principal.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
