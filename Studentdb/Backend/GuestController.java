package com.vanraj.hotel.controller;

import com.vanraj.hotel.model.Guest;
import com.vanraj.hotel.service.GuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Presentation Tier (server-side) — REST API consumed by the React frontend.
 *
 * Base path : /api/guests
 *
 * GET    /api/guests              — list / search
 * GET    /api/guests/{id}         — single guest
 * GET    /api/guests/stats        — dashboard statistics
 * POST   /api/guests              — create booking
 * PUT    /api/guests/{id}         — update booking
 * PATCH  /api/guests/{id}/status  — update status only
 * DELETE /api/guests/{id}         — delete booking
 */
@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService service;

    @GetMapping
    public List<Guest> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "All") String status) {
        return service.search(search, status);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public Guest get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Guest> create(@Valid @RequestBody Guest guest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(guest));
    }

    @PutMapping("/{id}")
    public Guest update(@PathVariable Long id, @Valid @RequestBody Guest guest) {
        return service.update(id, guest);
    }

    @PatchMapping("/{id}/status")
    public Guest updateStatus(@PathVariable Long id,
                              @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("status field is required");
        }
        return service.updateStatus(id, newStatus);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Global exception handlers ─────────────────────────────────────────────

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                             .body(Map.of("error", ex.getMessage()));
    }
}
