package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.projetimmo.projet_immobilier.enums.ModeTarification;

@Entity
@Table(name = "type_bien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypeBien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false, unique = true)
    private String libelle;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModeTarification modeTarification;
    
    @Builder.Default
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal tarifBase = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
