package com.skyflow.repository;

import com.skyflow.model.entity.Booking;
import com.skyflow.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

    Optional<Booking> findByPnr(String pnr);
}
