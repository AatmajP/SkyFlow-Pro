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
import java.util.List;

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
            @RequestParam(required = false) String date) {

        java.util.List<java.util.Map<String, Object>> timeline = new java.util.ArrayList<>();
        LocalDate baseDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : LocalDate.now();

        java.util.Optional<City> originOpt = cityService.getCitiesByTag(null).stream().filter(c -> c.getCode().equalsIgnoreCase(from)).findFirst();
        java.util.Optional<City> destOpt = cityService.getCitiesByTag(null).stream().filter(c -> c.getCode().equalsIgnoreCase(to)).findFirst();

        if (originOpt.isEmpty() || destOpt.isEmpty()) {
            // Return some default structure if cities not found
            for (int i = -3; i <= 3; i++) {
                LocalDate d = baseDate.plusDays(i);
                java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
                dayMap.put("date", d.toString());
                dayMap.put("price", null);
                timeline.add(dayMap);
            }
            return timeline;
        }

        City origin = originOpt.get();
        City dest = destOpt.get();

        // 7 days window (e.g., -3 to +3 days around date)
        LocalDateTime start = baseDate.minusDays(3).atStartOfDay();
        LocalDateTime end = baseDate.plusDays(3).atTime(23, 59, 59);

        // This assumes flightService exposes a way to get flights or we can just call searchFlights for each day
        // But since we can't modify FlightRepository here easily, we'll just loop and call searchFlights per day
        double minAll = Double.MAX_VALUE;
        java.util.Map<LocalDate, Double> pricesMap = new java.util.HashMap<>();

        for (int i = -3; i <= 3; i++) {
            LocalDate d = baseDate.plusDays(i);
            List<FlightSearchResponse> dailyFlights = flightService.searchFlights(from, to, d);
            if (!dailyFlights.isEmpty()) {
                double minPriceOfDay = dailyFlights.stream()
                        .mapToDouble(f -> f.getClassPrices().getOrDefault("Economy", 99999.0))
                        .min().orElse(99999.0);
                pricesMap.put(d, minPriceOfDay);
                if (minPriceOfDay < minAll) minAll = minPriceOfDay;
            }
        }

        for (int i = -3; i <= 3; i++) {
            LocalDate d = baseDate.plusDays(i);
            java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
            dayMap.put("date", d.toString());
            if (pricesMap.containsKey(d)) {
                double price = pricesMap.get(d);
                dayMap.put("price", Math.round(price));
                dayMap.put("isCheapest", price == minAll);
            } else {
                dayMap.put("price", null);
                dayMap.put("isCheapest", false);
            }
            timeline.add(dayMap);
        }

        return timeline;
    }
}
