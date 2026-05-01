package com.skyflow.repository;

import com.skyflow.model.entity.Seat;
import com.skyflow.model.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithLock(Long id);

    Optional<Seat> findByFlightAndSeatNumber(Flight flight, String seatNumber);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.flight = :flight AND s.isBooked = true")
    long countBookedSeatsByFlight(@Param("flight") Flight flight);

    List<Seat> findByFlightAndIsBooked(Flight flight, boolean isBooked);
}
