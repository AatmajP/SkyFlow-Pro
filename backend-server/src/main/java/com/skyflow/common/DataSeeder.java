package com.skyflow.common;

import com.skyflow.model.entity.*;
import com.skyflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    AirlineRepository airlineRepository;
    @Autowired
    CityRepository cityRepository;
    @Autowired
    FlightRepository flightRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedAirlines();
        seedCities();
        seedFlights();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole("USER");
            user.setFullName("John Doe");
            user.setEmail("john@example.com");
            userRepository.save(user);

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }
    }

    private void seedAirlines() {
        if (airlineRepository.count() == 0) {
            // Patro Airlines — proprietary/custom airline
            Airline patro = new Airline();
            patro.setCode("PT");
            patro.setName("Patro Airlines");
            patro.setProprietary(true);
            patro.setPolicyDescription("Free economy seat selection, priority notifications, complimentary meals on all flights.");
            airlineRepository.save(patro);

            // Indian carriers
            String[][] indianAirlines = {
                    {"6E", "IndiGo"},
                    {"AI", "Air India"},
                    {"UK", "Vistara"},
                    {"SG", "SpiceJet"},
                    {"QP", "Akasa Air"},
            };

            for (String[] a : indianAirlines) {
                Airline airline = new Airline();
                airline.setCode(a[0]);
                airline.setName(a[1]);
                airline.setProprietary(false);
                airlineRepository.save(airline);
            }

            // International carriers
            String[][] intlAirlines = {
                    {"UA", "United Airlines"}, {"DL", "Delta Air Lines"}, {"AA", "American Airlines"},
                    {"BA", "British Airways"}, {"LH", "Lufthansa"}, {"EK", "Emirates"},
            };

            for (String[] a : intlAirlines) {
                Airline airline = new Airline();
                airline.setCode(a[0]);
                airline.setName(a[1]);
                airline.setProprietary(false);
                airlineRepository.save(airline);
            }
        }
    }

    private void seedCities() {
        if (cityRepository.count() == 0) {
            // ----- INDIA — Major metros -----
            createCity("DEL", "New Delhi", "India", "city,capital,history,temple");
            createCity("BOM", "Mumbai", "India", "city,business,beach,bollywood");
            createCity("BLR", "Bengaluru", "India", "city,tech,culture,garden");
            createCity("HYD", "Hyderabad", "India", "city,tech,history,biryani");
            createCity("MAA", "Chennai", "India", "city,beach,temple,culture");
            createCity("CCU", "Kolkata", "India", "city,culture,history,heritage");
            createCity("AMD", "Ahmedabad", "India", "city,heritage,business,food");
            createCity("PNQ", "Pune", "India", "city,tech,education,hill");
            createCity("GOI", "Goa", "India", "beach,nature,party,nightlife");
            createCity("JAI", "Jaipur", "India", "city,heritage,palace,desert");
            createCity("LKO", "Lucknow", "India", "city,heritage,food,culture");
            createCity("COK", "Kochi", "India", "city,beach,backwater,spice");
            createCity("TRV", "Thiruvananthapuram", "India", "beach,temple,nature,culture");

            // ----- INDIA — Tier-2 & Tourism -----
            createCity("VNS", "Varanasi", "India", "temple,spiritual,history,ganga");
            createCity("IXC", "Chandigarh", "India", "city,planned,garden,mountain");
            createCity("GAU", "Guwahati", "India", "city,nature,temple,northeast");
            createCity("PAT", "Patna", "India", "city,history,culture,river");
            createCity("BBI", "Bhubaneswar", "India", "temple,city,culture,history");
            createCity("IXB", "Bagdogra", "India", "mountain,nature,tea,darjeeling");
            createCity("SXR", "Srinagar", "India", "mountain,lake,nature,valley");
            createCity("IXA", "Agartala", "India", "city,nature,northeast,culture");
            createCity("VTZ", "Visakhapatnam", "India", "beach,city,port,nature");
            createCity("IXR", "Ranchi", "India", "city,nature,waterfall,tribal");
            createCity("RPR", "Raipur", "India", "city,nature,tribal,waterfall");
            createCity("IDR", "Indore", "India", "city,food,heritage,business");
            createCity("NAG", "Nagpur", "India", "city,orange,nature,central");
            createCity("UDR", "Udaipur", "India", "heritage,lake,palace,romantic");
            createCity("JDH", "Jodhpur", "India", "heritage,desert,fort,blue");
            createCity("DED", "Dehradun", "India", "mountain,nature,adventure,hill");
            createCity("IXZ", "Port Blair", "India", "beach,island,nature,scuba");
            createCity("IMF", "Imphal", "India", "northeast,nature,culture,dance");

            // ----- INDIA — Pilgrimage & Hill Stations -----
            createCity("ATQ", "Amritsar", "India", "temple,spiritual,food,heritage");
            createCity("TIR", "Tirupati", "India", "temple,spiritual,pilgrimage,hill");
            createCity("IXS", "Silchar", "India", "nature,northeast,tea,culture");

            // ----- International — Gulf / Middle East -----
            createCity("DXB", "Dubai", "UAE", "city,luxury,desert,shopping");
            createCity("AUH", "Abu Dhabi", "UAE", "city,luxury,culture,island");
            createCity("DOH", "Doha", "Qatar", "city,luxury,museum,desert");
            createCity("RUH", "Riyadh", "Saudi Arabia", "city,desert,business,culture");

            // ----- International — Southeast Asia -----
            createCity("SIN", "Singapore", "Singapore", "city,garden,shopping,food");
            createCity("BKK", "Bangkok", "Thailand", "temple,city,streetfood,nightlife");
            createCity("KUL", "Kuala Lumpur", "Malaysia", "city,shopping,food,tower");

            // ----- International — East Asia -----
            createCity("HKG", "Hong Kong", "China", "city,shopping,skyline,food");
            createCity("NRT", "Tokyo", "Japan", "city,culture,tech,food");

            // ----- International — Europe -----
            createCity("LHR", "London", "UK", "city,history,culture,shopping");
            createCity("CDG", "Paris", "France", "city,culture,fashion,art");
            createCity("FRA", "Frankfurt", "Germany", "city,business,culture,river");
            createCity("ZRH", "Zurich", "Switzerland", "mountain,city,chocolate,lake");
            createCity("FCO", "Rome", "Italy", "city,history,food,culture");

            // ----- International — Americas -----
            createCity("JFK", "New York", "USA", "city,business,shopping,culture");
            createCity("LAX", "Los Angeles", "USA", "city,beach,entertainment,hollywood");
            createCity("ORD", "Chicago", "USA", "city,business,shopping,architecture");
            createCity("SFO", "San Francisco", "USA", "city,tech,bridge,culture");
            createCity("MIA", "Miami", "USA", "beach,city,nightlife,cruise");
            createCity("YYZ", "Toronto", "Canada", "city,culture,nature,tower");

            // ----- International — Oceania -----
            createCity("SYD", "Sydney", "Australia", "beach,city,harbor,opera");
            createCity("MEL", "Melbourne", "Australia", "city,culture,food,art");

            // ----- International — Africa -----
            createCity("NBO", "Nairobi", "Kenya", "city,safari,nature,wildlife");
        }
    }

    private void createCity(String code, String name, String country, String tags) {
        City c = new City();
        c.setCode(code);
        c.setName(name);
        c.setCountry(country);
        c.setTags(tags);
        cityRepository.save(c);
    }

    // Pre-defined departure time slots for realistic scheduling
    private static final int[][] TIME_SLOTS = {
            // Morning flights
            {5, 30}, {6, 0}, {6, 30}, {7, 0}, {7, 30}, {8, 0}, {8, 45}, {9, 15}, {9, 45},
            // Late morning
            {10, 0}, {10, 30}, {11, 0}, {11, 30},
            // Afternoon flights
            {12, 0}, {12, 30}, {13, 15}, {14, 0}, {14, 30}, {15, 0}, {15, 30},
            // Evening flights
            {16, 0}, {16, 30}, {17, 0}, {17, 45}, {18, 15}, {18, 45},
            // Night flights
            {19, 30}, {20, 0}, {20, 45}, {21, 30}, {22, 0}, {22, 30}, {23, 0},
    };

    // Approximate flight duration ranges (minutes) based on distance category
    // Short haul domestic India: 90-150 min
    // Medium haul domestic India: 150-210 min
    // Long haul international: 240-600 min
    private int estimateDuration(City origin, City dest, Random rand) {
        boolean bothIndia = "India".equals(origin.getCountry()) && "India".equals(dest.getCountry());
        if (bothIndia) {
            // Domestic India: 1.5h to 3.5h
            return 90 + rand.nextInt(120); // 90 to 210 min
        }
        boolean eitherIndia = "India".equals(origin.getCountry()) || "India".equals(dest.getCountry());
        if (eitherIndia) {
            // India to/from nearby international (Gulf, SEA): 3-6h
            String otherCountry = "India".equals(origin.getCountry()) ? dest.getCountry() : origin.getCountry();
            if (Arrays.asList("UAE", "Qatar", "Saudi Arabia", "Thailand", "Malaysia", "Singapore").contains(otherCountry)) {
                return 180 + rand.nextInt(180); // 3h to 6h
            }
            // India to/from far international: 6-12h
            return 360 + rand.nextInt(360);
        }
        // International to international: 3-10h
        return 180 + rand.nextInt(420);
    }

    // Base price estimation based on distance/duration
    private double estimateBasePrice(int durationMinutes, Random rand) {
        // Rough formula: base price scales with duration + some randomness
        double base;
        if (durationMinutes <= 120) {
            base = 2500 + rand.nextInt(2000); // ₹2500-4500 equivalent in USD: $30-55
        } else if (durationMinutes <= 210) {
            base = 3500 + rand.nextInt(3000); // $42-78
        } else if (durationMinutes <= 360) {
            base = 8000 + rand.nextInt(7000); // $96-180
        } else {
            base = 15000 + rand.nextInt(20000); // $180-420
        }
        // Convert INR-style to USD (approximate ₹83 = $1)
        return Math.round(base / 83.0 * 100.0) / 100.0;
    }

    // Popular domestic Indian routes that should have dense flight coverage
    private static final String[][] POPULAR_ROUTES = {
            {"DEL", "BOM"}, {"BOM", "DEL"}, {"DEL", "BLR"}, {"BLR", "DEL"},
            {"DEL", "HYD"}, {"HYD", "DEL"}, {"BOM", "BLR"}, {"BLR", "BOM"},
            {"DEL", "MAA"}, {"MAA", "DEL"}, {"DEL", "CCU"}, {"CCU", "DEL"},
            {"BOM", "HYD"}, {"HYD", "BOM"}, {"BOM", "GOI"}, {"GOI", "BOM"},
            {"DEL", "GOI"}, {"GOI", "DEL"}, {"BLR", "HYD"}, {"HYD", "BLR"},
            {"DEL", "AMD"}, {"AMD", "DEL"}, {"BOM", "MAA"}, {"MAA", "BOM"},
            {"DEL", "PNQ"}, {"PNQ", "DEL"}, {"DEL", "JAI"}, {"JAI", "DEL"},
            {"DEL", "LKO"}, {"LKO", "DEL"}, {"BLR", "MAA"}, {"MAA", "BLR"},
            {"BLR", "COK"}, {"COK", "BLR"}, {"DEL", "SXR"}, {"SXR", "DEL"},
            {"DEL", "ATQ"}, {"ATQ", "DEL"}, {"BOM", "PNQ"}, {"PNQ", "BOM"},
            // International from India
            {"DEL", "DXB"}, {"DXB", "DEL"}, {"BOM", "DXB"}, {"DXB", "BOM"},
            {"DEL", "SIN"}, {"SIN", "DEL"}, {"BOM", "SIN"}, {"SIN", "BOM"},
            {"DEL", "BKK"}, {"BKK", "DEL"}, {"DEL", "LHR"}, {"LHR", "DEL"},
            {"BOM", "LHR"}, {"LHR", "BOM"}, {"DEL", "JFK"}, {"JFK", "DEL"},
    };

    private void seedFlights() {
        if (flightRepository.count() == 0) {
            List<City> allCities = cityRepository.findAll();
            List<Airline> airlines = airlineRepository.findAll();
            Airline patro = airlineRepository.findByCode("PT").orElseThrow();

            // Separate Indian carriers for domestic flights
            List<Airline> indianCarriers = airlines.stream()
                    .filter(a -> Arrays.asList("PT", "6E", "AI", "UK", "SG", "QP").contains(a.getCode()))
                    .toList();

            Random rand = new Random(42); // Deterministic seed for reproducibility
            LocalDateTime now = LocalDateTime.now();

            // Generate flights for next 7 days on popular routes
            for (int day = 0; day < 7; day++) {
                LocalDateTime date = now.plusDays(day).withHour(0).withMinute(0).withSecond(0);

                for (String[] route : POPULAR_ROUTES) {
                    City origin = allCities.stream()
                            .filter(c -> c.getCode().equals(route[0]))
                            .findFirst().orElse(null);
                    City dest = allCities.stream()
                            .filter(c -> c.getCode().equals(route[1]))
                            .findFirst().orElse(null);

                    if (origin == null || dest == null) continue;

                    boolean isDomestic = "India".equals(origin.getCountry()) && "India".equals(dest.getCountry());

                    // 20-25 flights for popular domestic, 10-15 for international
                    int flightCount = isDomestic ? (20 + rand.nextInt(6)) : (10 + rand.nextInt(6));

                    // Determine which airlines to use
                    List<Airline> routeAirlines = isDomestic ? indianCarriers : airlines;

                    for (int f = 0; f < flightCount; f++) {
                        Flight flight = new Flight();

                        // First flight is always Patro Airlines
                        Airline airline;
                        if (f == 0) {
                            airline = patro;
                        } else {
                            airline = routeAirlines.get(rand.nextInt(routeAirlines.size()));
                            // Limit Patro to exactly one per route (handled in service layer too)
                            while (airline.getCode().equals("PT") && f != 0) {
                                airline = routeAirlines.get(rand.nextInt(routeAirlines.size()));
                            }
                        }

                        flight.setAirline(airline);
                        flight.setOrigin(origin);
                        flight.setDestination(dest);
                        flight.setFlightNumber(airline.getCode() + (1000 + rand.nextInt(9000)));

                        // Pick realistic time slot
                        int[] slot = TIME_SLOTS[rand.nextInt(TIME_SLOTS.length)];
                        LocalDateTime dep = date.withHour(slot[0]).withMinute(slot[1]);
                        flight.setDepartureTime(dep);

                        int duration = estimateDuration(origin, dest, rand);
                        flight.setArrivalTime(dep.plusMinutes(duration));

                        double basePrice = estimateBasePrice(duration, rand);
                        flight.setBasePrice(basePrice);
                        flight.setAvailableSeats(120 + rand.nextInt(60)); // 120-180 seats

                        flightRepository.save(flight);
                    }
                }
            }

            // Also generate some flights for ALL other routes (2-5 per day for 3 days)
            for (int day = 0; day < 3; day++) {
                LocalDateTime date = now.plusDays(day).withHour(0).withMinute(0).withSecond(0);

                for (City origin : allCities) {
                    for (City dest : allCities) {
                        if (origin.equals(dest)) continue;

                        // Skip if it's already a popular route (already seeded above)
                        String routeKey = origin.getCode() + "-" + dest.getCode();
                        boolean isPopular = false;
                        for (String[] pr : POPULAR_ROUTES) {
                            if (pr[0].equals(origin.getCode()) && pr[1].equals(dest.getCode())) {
                                isPopular = true;
                                break;
                            }
                        }
                        if (isPopular) continue;

                        int flightCount = 2 + rand.nextInt(4); // 2-5 flights
                        boolean isDomestic = "India".equals(origin.getCountry()) && "India".equals(dest.getCountry());
                        List<Airline> routeAirlines = isDomestic ? indianCarriers : airlines;

                        for (int f = 0; f < flightCount; f++) {
                            Flight flight = new Flight();

                            Airline airline = (f == 0) ? patro : routeAirlines.get(rand.nextInt(routeAirlines.size()));
                            while (airline.getCode().equals("PT") && f != 0) {
                                airline = routeAirlines.get(rand.nextInt(routeAirlines.size()));
                            }

                            flight.setAirline(airline);
                            flight.setOrigin(origin);
                            flight.setDestination(dest);
                            flight.setFlightNumber(airline.getCode() + (1000 + rand.nextInt(9000)));

                            int[] slot = TIME_SLOTS[rand.nextInt(TIME_SLOTS.length)];
                            LocalDateTime dep = date.withHour(slot[0]).withMinute(slot[1]);
                            flight.setDepartureTime(dep);

                            int duration = estimateDuration(origin, dest, rand);
                            flight.setArrivalTime(dep.plusMinutes(duration));

                            flight.setBasePrice(estimateBasePrice(duration, rand));
                            flight.setAvailableSeats(120 + rand.nextInt(60));

                            flightRepository.save(flight);
                        }
                    }
                }
            }
        }
    }
}
