package com.skyflow.model.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class FlightSearchResponse {
    private Long id;
    private String flightNumber;
    private String airlineName;
    private String airlineCode;
    private String airlineLogo;
    private boolean isProprietary;

    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private int durationMinutes;
    private int stops; // 0 for nonstop

    private Map<String, Double> classPrices; // Economy: 100, Business: 300
    private Map<String, List<String>> features; // "Economy": ["Meal"]
}
