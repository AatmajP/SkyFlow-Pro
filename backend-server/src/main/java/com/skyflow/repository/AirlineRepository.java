package com.skyflow.repository;

import com.skyflow.model.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AirlineRepository extends JpaRepository<Airline, Long> {
    Optional<Airline> findByCode(String code);
}
