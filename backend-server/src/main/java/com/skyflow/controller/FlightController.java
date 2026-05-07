package com.skyflow.controller;

import com.skyflow.model.dto.response.FareBreakdownResponse;
import com.skyflow.model.dto.response.FlightSearchResponse;
import com.skyflow.model.entity.City;
import com.skyflow.service.CityService;
import com.skyflow.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
public class FlightController {

    @Autowired
    FlightService flightService;
    @Autowired
    CityService cityService;

    @GetMapping("/cities")
    public List<City> getCities(@RequestParam(required = false) String tag) {
        return cityService.getCitiesByTag(tag);
    }

    @GetMapping("/flights/search")
    public ResponseEntity<java.util.Map<String, Object>> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String tripType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate) {
        
        if ("ROUND_TRIP".equalsIgnoreCase(tripType) || "ROUNDTRIP".equalsIgnoreCase(tripType)) {
            if (returnDate != null) {
                return ResponseEntity.ok(flightService.searchRoundTripFlights(from, to, date, returnDate));
            }
        }
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        List<FlightSearchResponse> outboundFlights = flightService.searchFlights(from, to, date);
        response.put("results", outboundFlights);
        response.put("tripType", "oneway");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/flights/{id}/fare-breakdown")
    public ResponseEntity<FareBreakdownResponse> getFareBreakdown(
            @PathVariable Long id,
            @RequestParam(name = "class", defaultValue = "Economy") String seatClass,
            @RequestParam(name = "seatType", defaultValue = "standard") String seatType) {
        try {
            FareBreakdownResponse breakdown = flightService.getFareBreakdown(id, seatClass, seatType);
            return ResponseEntity.ok(breakdown);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/api/flights/timeline")
    public List<java.util.Map<String, Object>> getTimeline(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String date,
            @RequestParam(required = false, defaultValue = "oneway") String tripType) {

        java.util.List<java.util.Map<String, Object>> timeline = new java.util.ArrayList<>();
        LocalDate baseDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : LocalDate.now();

        // Check if cities exist
        java.util.Optional<City> originOpt = cityService.getCitiesByTag(null).stream()
                .filter(c -> c.getCode().equalsIgnoreCase(from)).findFirst();
        java.util.Optional<City> destOpt = cityService.getCitiesByTag(null).stream()
                .filter(c -> c.getCode().equalsIgnoreCase(to)).findFirst();

        if (originOpt.isEmpty() || destOpt.isEmpty()) {
            // Return mock data for unknown routes to keep UI alive
            for (int i = -3; i <= 3; i++) {
                LocalDate d = baseDate.plusDays(i);
                java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
                dayMap.put("date", d.toString());
                dayMap.put("price", 2500 + (Math.abs(d.hashCode()) % 3000));
                dayMap.put("isCheapest", i == -1);
                timeline.add(dayMap);
            }
            return timeline;
        }

        double minAll = Double.MAX_VALUE;
        java.util.Map<LocalDate, Double> pricesMap = new java.util.HashMap<>();

        // 7 days window
        for (int i = -3; i <= 3; i++) {
            LocalDate d = baseDate.plusDays(i);
            List<FlightSearchResponse> dailyFlights = flightService.searchFlights(from, to, d);
            
            if (!dailyFlights.isEmpty()) {
                double minPriceOfDay = dailyFlights.stream()
                        .mapToDouble(f -> f.getClassPrices().getOrDefault("Economy", 99999.0))
                        .min().orElse(99999.0);
                
                // If roundtrip, add some return flight logic (simplified)
                if ("ROUND_TRIP".equalsIgnoreCase(tripType) || "ROUNDTRIP".equalsIgnoreCase(tripType)) {
                    minPriceOfDay *= 1.8; // Approximate roundtrip cost
                }

                pricesMap.put(d, minPriceOfDay);
                if (minPriceOfDay < minAll) minAll = minPriceOfDay;
            } else {
                // If no real flights, generate a pseudo-random price based on route and date for the timeline
                long seed = (from + to + d.toString()).hashCode();
                java.util.Random rnd = new java.util.Random(seed);
                double pseudoPrice = 3000 + rnd.nextInt(5000);
                if ("ROUND_TRIP".equalsIgnoreCase(tripType) || "ROUNDTRIP".equalsIgnoreCase(tripType)) {
                    pseudoPrice *= 1.8;
                }
                pricesMap.put(d, pseudoPrice);
                if (pseudoPrice < minAll) minAll = pseudoPrice;
            }
        }

        for (int i = -3; i <= 3; i++) {
            LocalDate d = baseDate.plusDays(i);
            java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
            dayMap.put("date", d.toString());
            
            if (pricesMap.containsKey(d)) {
                double price = pricesMap.get(d);
                dayMap.put("price", Math.round(price));
                dayMap.put("isCheapest", Math.abs(price - minAll) < 1.0);
            } else {
                dayMap.put("price", null);
                dayMap.put("isCheapest", false);
            }
            timeline.add(dayMap);
        }

        return timeline;
    }
}
