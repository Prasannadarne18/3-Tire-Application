package com.vanraj.hotel.service;

import com.vanraj.hotel.model.Guest;
import com.vanraj.hotel.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Business Logic Tier — mirrors the JS business functions in VanRaj_Hotel_Management.jsx.
 *
 * Responsibilities:
 *   - Auto-calculate amount from room type × nights
 *   - Validate date ordering
 *   - Status-transition rules
 *   - Dashboard statistics aggregation
 */
@Service
@RequiredArgsConstructor
public class GuestService {

    // Room prices per night — matches ROOM_PRICES in the React prototype
    private static final Map<String, BigDecimal> ROOM_PRICES = Map.of(
        "Standard",     BigDecimal.valueOf(1400),
        "Deluxe",       BigDecimal.valueOf(2200),
        "Suite",        BigDecimal.valueOf(3500),
        "Presidential", BigDecimal.valueOf(7000)
    );

    private static final int TOTAL_ROOMS = 50;

    private final GuestRepository repo;

    // ── READ ──────────────────────────────────────────────────────────────────

    public List<Guest> search(String query, String status) {
        String q = (query == null) ? "" : query.trim();
        String s = (status == null || status.isBlank()) ? "All" : status;
        return repo.searchGuests(q, s);
    }

    public Guest findById(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Guest not found: " + id));
    }

    public Map<String, Object> stats() {
        long occupied  = repo.countByStatus("Checked-in");
        long reserved  = repo.countByStatus("Reserved");
        BigDecimal revenue = repo.findByStatus("Checked-in").stream()
            .map(Guest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        revenue = revenue.add(
            repo.findByStatus("Reserved").stream()
                .map(Guest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        return Map.of(
            "totalRooms", TOTAL_ROOMS,
            "occupied",   occupied,
            "reserved",   reserved,
            "available",  TOTAL_ROOMS - occupied,
            "revenue",    revenue
        );
    }

    // ── WRITE ─────────────────────────────────────────────────────────────────

    @Transactional
    public Guest create(Guest guest) {
        validateDates(guest);
        guest.setId(null);                        // force INSERT
        guest.setStatus("Reserved");              // new bookings always start as Reserved
        guest.setAmount(calcAmount(guest));
        return repo.save(guest);
    }

    @Transactional
    public Guest update(Long id, Guest incoming) {
        Guest existing = findById(id);
        validateDates(incoming);

        existing.setName(incoming.getName());
        existing.setMobile(incoming.getMobile());
        existing.setRoom(incoming.getRoom());
        existing.setType(incoming.getType());
        existing.setCheckIn(incoming.getCheckIn());
        existing.setCheckOut(incoming.getCheckOut());
        existing.setAmount(calcAmount(incoming));
        return repo.save(existing);
    }

    @Transactional
    public Guest updateStatus(Long id, String newStatus) {
        Guest guest = findById(id);
        guest.setStatus(newStatus);
        return repo.save(guest);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Guest not found: " + id);
        }
        repo.deleteById(id);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private BigDecimal calcAmount(Guest g) {
        if (g.getCheckIn() == null || g.getCheckOut() == null) return BigDecimal.ZERO;
        long nights = g.getCheckIn().until(g.getCheckOut()).getDays();
        if (nights <= 0) return BigDecimal.ZERO;
        BigDecimal pricePerNight = ROOM_PRICES.getOrDefault(g.getType(), BigDecimal.ZERO);
        return pricePerNight.multiply(BigDecimal.valueOf(nights));
    }

    private void validateDates(Guest g) {
        if (g.getCheckIn() != null && g.getCheckOut() != null
                && !g.getCheckOut().isAfter(g.getCheckIn())) {
            throw new IllegalArgumentException("Check-out must be after check-in");
        }
    }
}
