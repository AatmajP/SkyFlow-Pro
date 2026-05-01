package com.skyflow.model.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private String pnr;
    private String status;
    private LocalDateTime bookingDate;
    private double totalAmount;
    private String passengerName;
    private String flightNumber;
    private String airlineName;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private String seatNumber;
    private String seatClass;
}
