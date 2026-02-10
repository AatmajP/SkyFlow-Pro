package com.skyflow.service;

import com.skyflow.model.entity.City;
import com.skyflow.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CityService {

    @Autowired
    private CityRepository cityRepository;

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public List<City> getCitiesByTag(String tag) {
        if (tag != null && !tag.isEmpty()) {
            return cityRepository.findByTagsContaining(tag);
        }
        return getAllCities();
    }
}
