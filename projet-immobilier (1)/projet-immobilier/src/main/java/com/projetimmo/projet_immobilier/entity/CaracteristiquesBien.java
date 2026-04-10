package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "caracteristiques_bien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaracteristiquesBien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id", nullable = false)
    private Bien bien;

    // 🔹 Caractéristiques générales
    @Builder.Default
    @Column(nullable = false)
    private Integer nbChambres = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer nbSallesBain = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer superficie = 0;

    private String etatGeneral;

    @Builder.Default
    @Column(nullable = false)
    private Integer anneeConstruction = 1990;

    // 🔹 Caractéristiques appartement/studio
    @Builder.Default
    @Column(nullable = false)
    private Boolean meuble = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean cuisineEquipee = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean wifi = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean balcon = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean cave = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ascenseur = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean parking = false;

    // 🔹 Caractéristiques maison/villa
    @Builder.Default
    @Column(nullable = false)
    private Boolean jardin = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean terrasse = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean piscine = false;

    // 🔹 Caractéristiques terrain
    @Builder.Default
    @Column(nullable = false)
    private Boolean viabilise = false;

    private String terrainType;

    @Builder.Default
    @Column(nullable = false)
    private Boolean cloture = false;

    // 🔹 Caractéristiques commercial
    @Builder.Default
    @Column(nullable = false)
    private Integer nbEtages = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean vitrine = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean stockage = false;

    private String localisationType;

    @Builder.Default
    @Column(nullable = false)
    private Integer nbAppartements = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean copropriete = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean gardien = false;

    @PrePersist
    @PreUpdate
    private void validerCaracteristiques() {
        if (nbChambres == null)
            nbChambres = 0;
        if (nbSallesBain == null)
            nbSallesBain = 0;
        if (superficie == null)
            superficie = 0;
        if (anneeConstruction == null)
            anneeConstruction = 1990;
        if (nbEtages == null)
            nbEtages = 0;
        if (nbAppartements == null)
            nbAppartements = 0;
    }
}