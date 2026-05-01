package com.skyflow.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/v1/flights")
public class FlightController {

    @GetMapping
    public Map<String, Object> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam String date,
            @RequestParam(defaultValue = "1") int adults,
            @RequestParam(defaultValue = "economy") String cabin) {

        List<Map<String, Object>> results = new ArrayList<>();
        Random random = new Random();
        int totalFlights = 12;

        for (int i = 0; i < totalFlights; i++) {
            Map<String, Object> flight = new HashMap<>();

            // "Patro Airlines" must exist
            boolean isPatro = (i == 3);
            String airline = isPatro ? "Patro Airlines" : "Emirates";
            String code = isPatro ? "PT" : "EK";

            String id = "flight-" + UUID.randomUUID().toString();
            flight.put("id", id);
            flight.put("from", from);
            flight.put("to", to);
            flight.put("cabin", cabin);
            flight.put("stops", 0);

            int duration = 300 + random.nextInt(60);
            flight.put("totalDurationMinutes", duration);

            List<Map<String, Object>> segments = new ArrayList<>();
            Map<String, Object> segment = new HashMap<>();
            segment.put("id", "seg-" + i);
            segment.put("marketingCarrier", airline);
            segment.put("marketingCarrierCode", code);
            segment.put("operatingCarrierCode", code);
            segment.put("flightNumber", code + (1000 + random.nextInt(8000)));
            segment.put("from", from);
            segment.put("to", to);

            Instant depTime = Instant.parse(date + "T" + String.format("%02d", random.nextInt(23)) + ":00:00Z");
            Instant arrTime = depTime.plus(duration, ChronoUnit.MINUTES);

            segment.put("departureTime", depTime.toString());
            segment.put("arrivalTime", arrTime.toString());
            segment.put("durationMinutes", duration);
            segment.put("aircraft", "Boeing 737-800");

            segments.add(segment);
            flight.put("segments", segments);
            flight.put("layovers", Collections.emptyList());

            Map<String, Object> price = new HashMap<>();
            int baseFare = 200 + random.nextInt(300);
            int tax = 50;
            int total = (baseFare + tax) * adults;

            price.put("currency", "USD");
            price.put("total", total);
            price.put("baseFare", baseFare * adults);
            price.put("taxesAndFees", tax * adults);
            price.put("carrierCharges", 0);
            price.put("perPassenger", baseFare + tax);

            List<Map<String, Object>> breakdown = new ArrayList<>();
            Map<String, Object> bd1 = new HashMap<>();
            bd1.put("label", "Base");
            bd1.put("amount", baseFare * adults);
            Map<String, Object> bd2 = new HashMap<>();
            bd2.put("label", "Tax");
            bd2.put("amount", tax * adults);
            breakdown.add(bd1);
            breakdown.add(bd2);

            price.put("breakdown", breakdown);
            price.put("lastUpdated", Instant.now().toString());
            price.put("refundabilityScore", isPatro ? 100 : 75);
            price.put("refundableLabel", isPatro ? "100% refundable" : "75% refundable");
            price.put("carbonEstimateKg", duration * 0.8);

            flight.put("price", price);
            flight.put("baggagePolicy", "7kg carry-on, 23kg checked");
            flight.put("alliance", isPatro ? "SkyFlow Alliance" : "Oneworld");
            flight.put("fareBrand", "Saver");

            results.add(flight);
        }

        // Sort by price (lowest first)
        results.sort((a, b) -> {
            Map priceA = (Map) a.get("price");
            Map priceB = (Map) b.get("price");
            Integer totalA = (Integer) priceA.get("total");
            Integer totalB = (Integer) priceB.get("total");
            return totalA.compareTo(totalB);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        return response;
    }
}
