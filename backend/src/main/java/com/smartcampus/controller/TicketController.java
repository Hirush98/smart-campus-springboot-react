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
import org.springframework.web.multipart.MultipartFile;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Module C - Maintenance & Incident Ticketing
 * Implemented by: Member 3
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<Ticket>>> getTickets(
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTechnician = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TECHNICIAN"));

        List<Ticket> tickets;
        if (isAdmin) {
            tickets = ticketService.getAllTickets();
        } else if (isTechnician) {
            tickets = ticketService.getTicketsByAssignee(principal.getId());
        } else {
            tickets = ticketService.getTicketsByUser(principal.getId());
        }

        List<EntityModel<Ticket>> ticketModels = tickets.stream()
                .map(ticket -> EntityModel.of(ticket,
                        linkTo(methodOn(TicketController.class).getTicket(ticket.getId())).withSelfRel(),
                        linkTo(methodOn(TicketController.class).getComments(ticket.getId())).withRel("comments")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(CollectionModel.of(ticketModels,
                linkTo(methodOn(TicketController.class).getTickets(principal)).withSelfRel()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<Ticket>> getTicket(@PathVariable String id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(EntityModel.of(ticket,
                linkTo(methodOn(TicketController.class).getTicket(id)).withSelfRel(),
                linkTo(methodOn(TicketController.class).getTickets(null)).withRel("tickets"),
                linkTo(methodOn(TicketController.class).getComments(id)).withRel("comments")));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Ticket> createTicket(
            @RequestPart("ticket") @Valid Ticket ticket,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal principal) {
        ticket.setReportedBy(principal.getId());
        ticket.setReporterName(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket, files));
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
        ticketService.deleteTicket(id);
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
