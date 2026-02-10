package com.skyflow.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "cities")
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // IATA e.g., JFK

    @Column(nullable = false)
    private String name;
    
    private String country;

    private String tags; // Comma separated: beach,mountain,temple
}
