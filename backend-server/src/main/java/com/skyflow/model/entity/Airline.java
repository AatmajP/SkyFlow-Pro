package com.skyflow.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "airlines")
public class Airline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., AA, PT

    @Column(nullable = false)
    private String name;

    private boolean isProprietary; // True for Patro Airlines

    private String logoUrl;
    
    @Column(length = 1000)
    private String policyDescription;
}
