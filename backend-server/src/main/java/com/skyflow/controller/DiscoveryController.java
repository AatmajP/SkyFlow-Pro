package com.skyflow.controller;

import com.skyflow.model.entity.City;
import com.skyflow.model.entity.Flight;
import com.skyflow.repository.CityRepository;
import com.skyflow.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/discovery")
public class DiscoveryController {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/timeline")
    public List<Map<String, Object>> getTimeline(
            @RequestParam String from,
            @RequestParam String to) {
        
        Optional<City> originOpt = cityRepository.findByCode(from);
        Optional<City> destOpt = cityRepository.findByCode(to);

        List<Map<String, Object>> timeline = new ArrayList<>();
        LocalDate today = LocalDate.now();

        if (originOpt.isEmpty() || destOpt.isEmpty()) {
            return timeline;
        }

        City origin = originOpt.get();
        City dest = destOpt.get();

        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(7).atTime(23, 59, 59);

        List<Flight> flights = flightRepository.findFlights(origin, dest, start, end);
        
        Map<LocalDate, Double> minPricePerDay = new HashMap<>();
        for (Flight f : flights) {
            LocalDate d = f.getDepartureTime().toLocalDate();
            double price = f.getBasePrice() * (f.getAirline().isProprietary() ? 0.9 : 1.0) * 1.12; // incl tax roughly
            minPricePerDay.put(d, Math.min(minPricePerDay.getOrDefault(d, Double.MAX_VALUE), price));
        }

        double minAll = minPricePerDay.values().stream().mapToDouble(Double::doubleValue).min().orElse(0);

        for (int i = 0; i < 7; i++) {
            LocalDate d = today.plusDays(i);
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", d.toString());
            
            if (minPricePerDay.containsKey(d)) {
                double price = minPricePerDay.get(d);
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

    @GetMapping("/quick-picks")
    public List<Map<String, Object>> getQuickPicks(@RequestParam String from) {
        List<Map<String, Object>> picks = new ArrayList<>();
        
        picks.add(createPick("weekend", "Weekend getaways", "budget", "GOI", 4500));
        picks.add(createPick("beach", "Beach destinations", "beach", "IXZ", 5200));
        picks.add(createPick("short", "Short flights (<2h)", "short", "JAI", 3100));
        picks.add(createPick("cheapest", "Cheapest this week", "budget", "LKO", 2800));
        
        return picks;
    }

    private Map<String, Object> createPick(String id, String title, String type, String destination, int price) {
        Map<String, Object> pick = new HashMap<>();
        pick.put("id", id);
        pick.put("title", title);
        pick.put("type", type);
        pick.put("destination", destination);
        pick.put("price", price);
        return pick;
    }

    @GetMapping("/deals")
    public List<Map<String, Object>> getDeals(@RequestParam String from) {
        List<Map<String, Object>> deals = new ArrayList<>();
        
        Map<String, Object> deal1 = new HashMap<>();
        deal1.put("route", from + " → BOM");
        deal1.put("price", 3400);
        deal1.put("urgency", "Only 3 seats left");
        deal1.put("destination", "BOM");
        deals.add(deal1);

        Map<String, Object> deal2 = new HashMap<>();
        deal2.put("route", from + " → BLR");
        deal2.put("price", 4100);
        deal2.put("urgency", "Price drops today");
        deal2.put("destination", "BLR");
        deals.add(deal2);

        Map<String, Object> deal3 = new HashMap<>();
        deal3.put("route", from + " → DXB");
        deal3.put("price", 12500);
        deal3.put("urgency", "Hot deal");
        deal3.put("destination", "DXB");
        deals.add(deal3);

        return deals;
    }
}
