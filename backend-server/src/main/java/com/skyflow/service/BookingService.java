package com.skyflow.service;

import com.skyflow.model.dto.response.BookingResponse;
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
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

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

    private static final AtomicLong referenceCounter = new AtomicLong(10000);

    private String generateBookingReference() {
        long count = referenceCounter.incrementAndGet();
        return "SKY" + count;
    }

    @Transactional
    public BookingResponse createBooking(String username, Long flightId, String seatNumber, String seatClass) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Flight flight = flightRepository.findById(flightId).orElseThrow(() -> new RuntimeException("Flight not found"));

        Seat seat = seatRepository.findByFlightAndSeatNumber(flight, seatNumber)
                .orElse(null);

        if (seat == null) {
            seat = new Seat();
            seat.setFlight(flight);
            seat.setSeatNumber(seatNumber);
            seat.setSeatClass(seatClass);
            seat.setBooked(false);
            seat = seatRepository.save(seat);
        }

        if (seat.isBooked()) {
            throw new RuntimeException("Seat already booked");
        }

        seat.setBooked(true);
        seatRepository.save(seat);

        // Update available seats count
        flight.setAvailableSeats(Math.max(0, flight.getAvailableSeats() - 1));
        flightRepository.save(flight);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setFlight(flight);
        booking.setSeat(seat);
        booking.setStatus("CONFIRMED");
        booking.setBookingDate(LocalDateTime.now());
        booking.setPnr(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        booking.setBookingReference(generateBookingReference());

        // Calculate price based on class multiplier
        double base = flight.getBasePrice();
        double multiplier = switch (seatClass) {
            case "Premium Economy" -> 1.5;
            case "Business" -> 3.0;
            case "First Class" -> 5.0;
            default -> 1.0;
        };
        double totalAmount = Math.round(base * multiplier * 1.12); // includes 12% tax
        booking.setTotalAmount(totalAmount);

        bookingRepository.save(booking);

        notificationService.createNotification(user,
                "Booking confirmed! Reference: " + booking.getBookingReference() + " | PNR: " + booking.getPnr(),
                booking.getId());

        return mapToResponse(booking);
    }

    public List<BookingResponse> getMyBookings(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        booking.setStatus("CANCELLED");
        booking.getSeat().setBooked(false);
        bookingRepository.save(booking);
        seatRepository.save(booking.getSeat());

        // Restore available seats
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + 1);
        flightRepository.save(flight);

        notificationService.createNotification(booking.getUser(),
                "Booking " + booking.getBookingReference() + " cancelled. Refund initiated.", booking.getId());
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingReference(booking.getBookingReference());
        response.setPnr(booking.getPnr());
        response.setStatus(booking.getStatus());
        response.setBookingDate(booking.getBookingDate());
        response.setTotalAmount(booking.getTotalAmount());
        response.setPassengerName(booking.getUser().getFullName());
        response.setFlightNumber(booking.getFlight().getFlightNumber());
        response.setAirlineName(booking.getFlight().getAirline().getName());
        response.setOrigin(booking.getFlight().getOrigin().getCode());
        response.setDestination(booking.getFlight().getDestination().getCode());
        response.setDepartureTime(booking.getFlight().getDepartureTime());
        response.setSeatNumber(booking.getSeat().getSeatNumber());
        response.setSeatClass(booking.getSeat().getSeatClass());
        return response;
    }
}
