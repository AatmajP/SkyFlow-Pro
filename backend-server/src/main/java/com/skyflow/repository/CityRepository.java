package com.skyflow.repository;

import com.skyflow.model.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByCode(String code);

    List<City> findByTagsContaining(String tag);
}
