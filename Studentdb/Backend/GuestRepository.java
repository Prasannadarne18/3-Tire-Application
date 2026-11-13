package com.vanraj.hotel.repository;

import com.vanraj.hotel.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByStatus(String status);

    @Query("""
        SELECT g FROM Guest g
        WHERE (:status IS NULL OR :status = 'All' OR g.status = :status)
          AND (
            LOWER(g.name)   LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(g.room)   LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(g.type)   LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(g.status) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY g.createdAt DESC
    """)
    List<Guest> searchGuests(@Param("search") String search,
                             @Param("status") String status);

    long countByStatus(String status);
}
