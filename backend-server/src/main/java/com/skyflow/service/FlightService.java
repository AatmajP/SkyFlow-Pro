package com.skyflow.service;

import com.skyflow.model.dto.response.FareBreakdownResponse;
import com.skyflow.model.dto.response.FlightSearchResponse;
import com.skyflow.model.entity.Airline;
import com.skyflow.model.entity.City;
import com.skyflow.model.entity.Flight;
import com.skyflow.repository.CityRepository;
import com.skyflow.repository.FlightRepository;
import com.skyflow.repository.SeatRepository;
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
    @Autowired
    SeatRepository seatRepository;

    private static final double TAX_RATE = 0.12;
    private static final int SURGE_THRESHOLD = 30; // seats remaining triggers surge
    private static final double SURGE_MULTIPLIER = 1.15;

    private static final Map<String, Double> CLASS_MULTIPLIERS = Map.of(
            "Economy", 1.0,
            "Premium Economy", 1.5,
            "Business", 3.0,
            "First Class", 5.0
    );

    private static final Map<String, Double> SEAT_TYPE_CHARGES = Map.of(
            "free", 0.0,
            "standard", 0.0,
            "preferred", 25.0,
            "extra_legroom", 45.0,
            "premium", 75.0
    );

    private static final String[] AIRCRAFT_TYPES = {
            "Boeing 737-800", "Airbus A320neo", "Boeing 787-9 Dreamliner",
            "Airbus A321neo", "Boeing 777-300ER", "Airbus A330-900neo"
    };

    private static final String[] BAGGAGE_POLICIES = {
            "1 carry-on + 1 personal item. Checked bags from $30.",
            "1 carry-on, 1 checked (23kg). Free seat selection.",
            "1 carry-on, 1 checked (23kg). Priority boarding included.",
            "2 checked bags (23kg each). Lounge access included."
    };

    private static final String[] REFUND_POLICIES = {
            "Non-refundable. Changes allowed with fee + fare difference.",
            "Changeable with no fee. Refund to travel credit.",
            "Fully refundable. Free changes. Priority support.",
            "Non-refundable. Changes not permitted."
    };

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

        List<FlightSearchResponse> responses = flights.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long patroCount = responses.stream().filter(FlightSearchResponse::isProprietary).count();
        if (patroCount > 1) {
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

    public FareBreakdownResponse getFareBreakdown(Long flightId, String seatClass, String seatType) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        double classMultiplier = CLASS_MULTIPLIERS.getOrDefault(seatClass, 1.0);
        double seatCharge = SEAT_TYPE_CHARGES.getOrDefault(seatType, 0.0);

        double rawBase = flight.getBasePrice();
        if (flight.getAirline().isProprietary()) {
            rawBase = rawBase * 0.9;
        }

        double baseFare = Math.round(rawBase * classMultiplier);
        double taxes = Math.round(baseFare * TAX_RATE);

        int seatsLeft = calculateSeatsLeft(flight);
        boolean surgeActive = seatsLeft <= SURGE_THRESHOLD && seatsLeft > 0;
        double surgeCharge = 0;
        if (surgeActive) {
            surgeCharge = Math.round(baseFare * (SURGE_MULTIPLIER - 1.0));
        }

        double total = baseFare + taxes + seatCharge + surgeCharge;

        FareBreakdownResponse response = new FareBreakdownResponse();
        response.setBaseFare(baseFare);
        response.setTaxes(taxes);
        response.setSeatCharge(seatCharge);
        response.setSurgeCharge(surgeCharge);
        response.setTotal(total);
        response.setCurrency("USD");
        response.setSeatClass(seatClass);
        response.setSeatType(seatType != null ? seatType : "standard");
        response.setSeatsLeft(seatsLeft);
        response.setSurgeActive(surgeActive);
        response.setSurgeMessage(surgeActive
                ? "Only " + seatsLeft + " seats left! Price rising due to high demand."
                : null);

        return response;
    }

    private int calculateSeatsLeft(Flight flight) {
        long bookedCount = seatRepository.countBookedSeatsByFlight(flight);
        return Math.max(0, flight.getAvailableSeats() - (int) bookedCount);
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
        response.setStops(0);

        double base = flight.getBasePrice();
        if (flight.getAirline().isProprietary()) {
            base = base * 0.9;
        }

        Map<String, Double> prices = new HashMap<>();
        prices.put("Economy", Math.round(base * 1.0) * 1.0);
        prices.put("Premium Economy", Math.round(base * 1.5) * 1.0);
        prices.put("Business", Math.round(base * 3.0) * 1.0);
        prices.put("First Class", Math.round(base * 5.0) * 1.0);
        response.setClassPrices(prices);

        Map<String, List<String>> features = new HashMap<>();
        features.put("Economy", new ArrayList<>(Arrays.asList("USB Outlet", "Standard Meal")));
        features.put("Premium Economy", new ArrayList<>(Arrays.asList("USB Outlet", "Enhanced Meal", "Extra Legroom")));
        features.put("Business", new ArrayList<>(Arrays.asList("Lie-flat Seat", "Premium Dining", "Lounge Access")));
        features.put("First Class", new ArrayList<>(Arrays.asList("Suite", "Fine Dining", "Lounge Access", "Chauffeur")));
        if (flight.getAirline().isProprietary()) {
            features.get("Economy").add("Free Seat Selection");
        }
        response.setFeatures(features);

        int seatsLeft = calculateSeatsLeft(flight);
        response.setAvailableSeats(seatsLeft);
        response.setSurgeActive(seatsLeft <= SURGE_THRESHOLD && seatsLeft > 0);
        response.setSurgeMessage(response.isSurgeActive()
                ? "Only " + seatsLeft + " seats left!"
                : null);

        Random rand = new Random(flight.getId());
        response.setAircraft(AIRCRAFT_TYPES[rand.nextInt(AIRCRAFT_TYPES.length)]);
        response.setBaggagePolicy(BAGGAGE_POLICIES[rand.nextInt(BAGGAGE_POLICIES.length)]);
        response.setRefundPolicy(REFUND_POLICIES[rand.nextInt(REFUND_POLICIES.length)]);

        return response;
    }
}
