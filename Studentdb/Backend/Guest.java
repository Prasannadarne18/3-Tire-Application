package com.vanraj.hotel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "guests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Guest name is required")
    @Size(max = 120)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 20)
    @Column(nullable = false)
    private String mobile;

    @NotBlank(message = "Room number is required")
    @Size(max = 10)
    @Column(nullable = false)
    private String room;

    @NotBlank(message = "Room type is required")
    @Pattern(regexp = "Standard|Deluxe|Suite|Presidential",
             message = "Type must be Standard, Deluxe, Suite, or Presidential")
    @Column(nullable = false)
    private String type;

    @NotNull(message = "Check-in date is required")
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @DecimalMin(value = "0.0")
    @Column(nullable = false)
    private BigDecimal amount;

    @Pattern(regexp = "Reserved|Checked-in|Checked-out",
             message = "Status must be Reserved, Checked-in, or Checked-out")
    @Column(nullable = false)
    private String status = "Reserved";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
