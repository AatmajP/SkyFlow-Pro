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
}
