package com.skyflow.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    public static class Seat {
        public String seatId;
        public int row;
        public String column;
        public String label;
        public String type;
        public int price;
        public boolean isAvailable;
        public String classType;
        public String position;
        public String status;
        public List<String> features;
    }

    public static class CabinLayout {
        public String classType;
        public String label;
        public List<String> columns;
        public List<Integer> aisleAfter;
        public int seatWidth;
        public int seatGap;
        public int rowGap;
        public int rowStart;
        public int rowEnd;
        public String colorAccent;
    }

    public static class SeatMapData {
        public String flightId;
        public String cabinClass;
        public List<CabinLayout> layouts;
        public List<Seat> seats;
        public int totalSeats;
        public int availableSeats;
    }

    public static class AutoAssignRequest {
        public String flightId;
        public String cabinClass;
        public Integer passengerCount;
    }

    public static class AutoAssignResponse {
        public List<Seat> assignedSeats;
        public int totalExtraPrice;
    }

    @GetMapping
    public ResponseEntity<SeatMapData> getSeatMap(@RequestParam String flightId, @RequestParam(defaultValue = "economy") String cabinClass) {
        return ResponseEntity.ok(generateSeatMap(flightId, cabinClass));
    }

    @PostMapping("/assign")
    public ResponseEntity<AutoAssignResponse> assignSeat(@RequestBody AutoAssignRequest request) {
        SeatMapData map = generateSeatMap(request.flightId, request.cabinClass != null ? request.cabinClass : "economy");
        int count = request.passengerCount != null ? request.passengerCount : 1;

        List<Seat> freeSeats = new ArrayList<>();
        for (Seat s : map.seats) {
            if (s.isAvailable && "FREE".equals(s.type)) {
                freeSeats.add(s);
            }
        }

        freeSeats.sort((a, b) -> {
            int scoreA = a.row * 10 - ("window".equals(a.position) ? 5 : "aisle".equals(a.position) ? 3 : -2);
            int scoreB = b.row * 10 - ("window".equals(b.position) ? 5 : "aisle".equals(b.position) ? 3 : -2);
            return Integer.compare(scoreA, scoreB);
        });

        List<Seat> assigned = new ArrayList<>();
        for (int i = 0; i < Math.min(count, freeSeats.size()); i++) {
            Seat s = freeSeats.get(i);
            s.status = "selected";
            assigned.add(s);
        }

        AutoAssignResponse res = new AutoAssignResponse();
        res.assignedSeats = assigned;
        res.totalExtraPrice = 0; // Assigned seats are FREE
        return ResponseEntity.ok(res);
    }

    // Generate deterministic seat map structure matching the frontend
    private SeatMapData generateSeatMap(String flightId, String cabinClass) {
        SeatMapData data = new SeatMapData();
        data.flightId = flightId;
        data.cabinClass = cabinClass;
        data.layouts = new ArrayList<>();

        CabinLayout layout = new CabinLayout();
        layout.classType = cabinClass;
        
        if ("business".equals(cabinClass)) {
            layout.label = "Business";
            layout.columns = Arrays.asList("A", "B", "C", "D");
            layout.aisleAfter = Arrays.asList(0, 2);
            layout.seatWidth = 52;
            layout.seatGap = 8;
            layout.rowGap = 14;
            layout.rowStart = 1;
            layout.rowEnd = 6;
            layout.colorAccent = "#f59e0b";
        } else if ("premium_economy".equals(cabinClass)) {
            layout.label = "Premium Economy";
            layout.columns = Arrays.asList("A", "B", "C", "D", "E", "F", "G");
            layout.aisleAfter = Arrays.asList(1, 4);
            layout.seatWidth = 42;
            layout.seatGap = 4;
            layout.rowGap = 8;
            layout.rowStart = 1;
            layout.rowEnd = 8;
            layout.colorAccent = "#a855f7";
        } else if ("first".equals(cabinClass)) {
            layout.label = "First Class";
            layout.columns = Arrays.asList("A", "B", "C", "D");
            layout.aisleAfter = Arrays.asList(0, 2);
            layout.seatWidth = 60;
            layout.seatGap = 12;
            layout.rowGap = 18;
            layout.rowStart = 1;
            layout.rowEnd = 4;
            layout.colorAccent = "#ec4899";
        } else {
            // Default to economy
            layout.label = "Economy";
            layout.columns = Arrays.asList("A", "B", "C", "D", "E", "F");
            layout.aisleAfter = Arrays.asList(2);
            layout.seatWidth = 36;
            layout.seatGap = 2;
            layout.rowGap = 4;
            layout.rowStart = 1;
            layout.rowEnd = 25;
            layout.colorAccent = "#38bdf8";
        }

        data.layouts.add(layout);
        data.seats = new ArrayList<>();
        
        // Simple deterministic random
        long seed = (flightId + cabinClass).hashCode();
        Random rand = new Random(seed);

        for (int r = layout.rowStart; r <= layout.rowEnd; r++) {
            for (int ci = 0; ci < layout.columns.size(); ci++) {
                String c = layout.columns.get(ci);
                Seat s = new Seat();
                s.seatId = flightId + "-" + cabinClass + "-" + r + c;
                s.row = r;
                s.column = c;
                s.label = r + c;
                s.classType = cabinClass;

                // Position
                if (ci == 0 || ci == layout.columns.size() - 1) {
                    s.position = "window";
                } else if (layout.aisleAfter.contains(ci) || layout.aisleAfter.contains(ci - 1)) {
                    s.position = "aisle";
                } else {
                    s.position = "middle";
                }

                // Pricing
                if ("business".equals(cabinClass) || "first".equals(cabinClass)) {
                    s.type = r <= 2 ? "PREMIUM" : "PAID";
                    s.price = r <= 2 ? 1500 : 800;
                } else if ("premium_economy".equals(cabinClass)) {
                    s.type = r <= 2 ? "PREMIUM" : (s.position.equals("window") || s.position.equals("aisle") ? "PAID" : "FREE");
                    s.price = r <= 2 ? 1200 : (s.type.equals("PAID") ? 500 : 0);
                } else {
                    if (r <= Math.ceil(layout.rowEnd * 0.15)) {
                        s.type = "PAID";
                        s.price = s.position.equals("window") ? 500 : s.position.equals("aisle") ? 400 : 200;
                    } else if (r == Math.ceil(layout.rowEnd * 0.45) || r == Math.ceil(layout.rowEnd * 0.45) + 1) {
                        s.type = "PAID";
                        s.price = 700; // exit row
                    } else if (s.position.equals("window")) {
                        s.type = "PAID";
                        s.price = 200;
                    } else {
                        s.type = "FREE";
                        s.price = 0;
                    }
                }

                double bookRate = "economy".equals(cabinClass) ? 0.30 : "premium_economy".equals(cabinClass) ? 0.25 : 0.20;
                s.isAvailable = rand.nextDouble() >= bookRate;
                s.status = s.isAvailable ? "available" : "booked";
                
                s.features = new ArrayList<>();
                if (s.price > 500) s.features.add("extra-legroom");
                if ("window".equals(s.position)) s.features.add("window-view");

                data.seats.add(s);
            }
        }

        data.totalSeats = data.seats.size();
        data.availableSeats = (int) data.seats.stream().filter(s -> s.isAvailable).count();

        return data;
    }
}
