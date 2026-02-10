package com.skyflow.controller;

import com.skyflow.model.dto.response.FlightSearchResponse;
import com.skyflow.model.entity.City;
import com.skyflow.service.CityService;
import com.skyflow.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
    public List<FlightSearchResponse> searchFlights(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return flightService.searchFlights(from, to, date);
    }
}
