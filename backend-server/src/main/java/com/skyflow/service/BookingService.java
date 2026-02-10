package com.skyflow.service;

import com.skyflow.model.entity.Booking;
import com.skyflow.model.entity.Flight;
import com.skyflow.model.entity.Seat;
import com.skyflow.model.entity.User;
import com.skyflow.repository.BookingRepository;
import com.skyflow.repository.FlightRepository;
import com.skyflow.repository.SeatRepository;
import com.skyflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    FlightRepository flightRepository;
    @Autowired
    SeatRepository seatRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    NotificationService notificationService;

    @Transactional
    public Booking createBooking(String username, Long flightId, String seatNumber, String seatClass) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Flight flight = flightRepository.findById(flightId).orElseThrow(() -> new RuntimeException("Flight not found"));

        // Handle seat locking/creation
        // Check if seat exists for this flight
        Seat seat = seatRepository.findByFlightAndSeatNumber(flight, seatNumber)
                .orElse(null);

        if (seat == null) {
            // Create seat if not exists (dynamic seat inventory for simplicity)
            seat = new Seat();
            seat.setFlight(flight);
            seat.setSeatNumber(seatNumber);
            seat.setSeatClass(seatClass);
            seat.setBooked(false);
            seat = seatRepository.save(seat);
        }

        // Lock check
        if (seat.isBooked()) {
            throw new RuntimeException("Seat already booked");
        }

        seat.setBooked(true);
        seatRepository.save(seat);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setFlight(flight);
        booking.setSeat(seat);
        booking.setStatus("CONFIRMED");
        booking.setBookingDate(LocalDateTime.now());
        booking.setPnr(UUID.randomUUID().toString().substring(0, 6).toUpperCase());

        // Calculate price based on class/flight... simplified here
        booking.setTotalAmount(flight.getBasePrice()); // Should use multiplier logic from FlightService

        bookingRepository.save(booking);

        // Notify
        notificationService.createNotification(user, "Booking confirmed! PNR: " + booking.getPnr(), booking.getId());

        return booking;
    }

    public List<Booking> getMyBookings(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    @Transactional
    public void cancelBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        booking.setStatus("CANCELLED");
        booking.getSeat().setBooked(false); // Release seat
        bookingRepository.save(booking);
        seatRepository.save(booking.getSeat());

        notificationService.createNotification(booking.getUser(),
                "Booking " + booking.getPnr() + " cancelled. Refund initiated.", booking.getId());
    }
}
