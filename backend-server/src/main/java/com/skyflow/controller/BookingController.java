package com.skyflow.controller;

import com.skyflow.model.dto.response.BookingResponse;
import com.skyflow.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in to complete booking."));
        }
        String username = auth.getName();

        Object flightIdObj = payload.get("flightId");
        Object seatNumberObj = payload.get("seatNumber");
        Object seatClassObj = payload.get("seatClass");

        if (flightIdObj == null || seatNumberObj == null || seatClassObj == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Missing required fields: flightId, seatNumber, seatClass."));
        }

        long flightIdLong;
        try {
            flightIdLong = Long.parseLong(flightIdObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid flight ID. Use a flight from search results (backend)."));
        }
        if (flightIdLong <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid flight ID."));
        }

        String seatNumber = seatNumberObj.toString().trim();
        String seatClass = seatClassObj.toString().trim();
        if (seatNumber.isEmpty() || seatClass.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seat number and seat class are required."));
        }

        try {
            BookingResponse booking = bookingService.createBooking(username, flightIdLong, seatNumber, seatClass);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("already booked") || msg.contains("not found") || msg.contains("No value")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", msg.isEmpty() ? "Flight or seat unavailable." : msg));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Booking failed. Please try again."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Booking failed. Please try again."));
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        try {
            return ResponseEntity.ok(bookingService.getMyBookings(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/cancel/{id}")
    public void cancelBooking(@PathVariable Long id, Authentication auth) {
        bookingService.cancelBooking(id, auth.getName());
    }
}
