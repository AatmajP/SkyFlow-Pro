package com.skyflow.service;

import com.skyflow.model.dto.response.FlightSearchResponse;
import com.skyflow.model.entity.Airline;
import com.skyflow.model.entity.City;
import com.skyflow.model.entity.Flight;
import com.skyflow.repository.CityRepository;
import com.skyflow.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    FlightRepository flightRepository;
    @Autowired
    CityRepository cityRepository;

    public List<FlightSearchResponse> searchFlights(String from, String to, LocalDate date) {
        City origin = cityRepository.findByCode(from).orElseThrow(() -> new RuntimeException("Origin not found"));
        City destination = cityRepository.findByCode(to)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<Flight> flights = flightRepository.findFlights(origin, destination, start, end);

        if (flights.isEmpty()) {
            return Collections.emptyList();
        }

        // Logic: Return MINIMUM 10. (Seeder guarantees 10 created).
        // Logic: EXACTLY ONE Patro Airlines.

        List<FlightSearchResponse> responses = flights.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Filter logic if needed to ensure constraints, but Seeder handles generation
        // well.
        // If we have >1 Patro, remove extras? "EXACTLY ONE".
        long patroCount = responses.stream().filter(FlightSearchResponse::isProprietary).count();
        if (patroCount > 1) {
            // Keep only the first one
            boolean kept = false;
            Iterator<FlightSearchResponse> it = responses.iterator();
            while (it.hasNext()) {
                FlightSearchResponse f = it.next();
                if (f.isProprietary()) {
                    if (kept)
                        it.remove();
                    else
                        kept = true;
                }
            }
        }

        return responses;
    }

    private FlightSearchResponse mapToResponse(Flight flight) {
        FlightSearchResponse response = new FlightSearchResponse();
        response.setId(flight.getId());
        response.setFlightNumber(flight.getFlightNumber());
        response.setAirlineName(flight.getAirline().getName());
        response.setAirlineCode(flight.getAirline().getCode());
        response.setAirlineLogo(flight.getAirline().getLogoUrl());
        response.setProprietary(flight.getAirline().isProprietary());

        response.setOrigin(flight.getOrigin().getCode());
        response.setDestination(flight.getDestination().getCode());
        response.setDepartureTime(flight.getDepartureTime());
        response.setArrivalTime(flight.getArrivalTime());

        long minutes = Duration.between(flight.getDepartureTime(), flight.getArrivalTime()).toMinutes();
        response.setDurationMinutes((int) minutes);
        response.setStops(0); // For now assuming direct from seeder

        // Pricing Logic
        // Base Price = flight.basePrice
        // Multipliers: Economy 1.0, Premium 1.5, Business 3.0, First 5.0
        // Patro Airlines: Better prices?

        double base = flight.getBasePrice();
        if (flight.getAirline().isProprietary()) {
            base = base * 0.9; // 10% discount
        }

        Map<String, Double> prices = new HashMap<>();
        prices.put("Economy", Math.round(base * 1.0) * 1.0);
        prices.put("Premium Economy", Math.round(base * 1.5) * 1.0);
        prices.put("Business", Math.round(base * 3.0) * 1.0);
        prices.put("First Class", Math.round(base * 5.0) * 1.0);

        response.setClassPrices(prices);

        // Features
        Map<String, List<String>> features = new HashMap<>();
        features.put("Economy", Arrays.asList("USB Outlet", "Standard Meal"));
        if (flight.getAirline().isProprietary()) {
            features.get("Economy").add("Free Seat Selection");
        }
        response.setFeatures(features);

        return response;
    }
}
