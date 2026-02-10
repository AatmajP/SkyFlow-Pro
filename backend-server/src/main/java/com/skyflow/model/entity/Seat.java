package com.skyflow.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"flight_id", "seatNumber"})
})
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(nullable = false)
    private String seatNumber; // 1A, 1B

    @Column(nullable = false)
    private String seatClass; // Economy, Business, First

    private boolean isBooked;
}
