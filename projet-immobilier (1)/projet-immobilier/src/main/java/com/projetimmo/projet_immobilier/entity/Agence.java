package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "agences")
@JsonIgnoreProperties({"utilisateurs", "biens", "hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agence {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String telephone;

    @Column(nullable = false)
    private String adresse;

    private String ville;
    private String pays;
    private String codePostal;

    private String numeroLicence;
    private String siteWeb;
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAgence statut;

    private String nina;

    @Column(columnDefinition = "TEXT")
    private String horairesOuverture;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 🔗 RELATIONS

    @OneToMany(mappedBy = "agence")
    private List<Utilisateur> utilisateurs;

    @OneToMany(mappedBy = "agence")
    private List<Bien> biens;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}