package com.skyflow.repository;

import com.skyflow.model.entity.Flight;
import com.skyflow.model.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    @Query("SELECT f FROM Flight f WHERE f.origin = :origin AND f.destination = :destination AND f.departureTime >= :startTime AND f.departureTime <= :endTime")
    List<Flight> findFlights(@Param("origin") City origin,
            @Param("destination") City destination,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<Flight> findByOriginAndDestination(City origin, City destination);
}
