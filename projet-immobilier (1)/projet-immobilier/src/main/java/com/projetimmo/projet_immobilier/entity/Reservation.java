package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.StatutReservation;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateVisite;

    @Enumerated(EnumType.STRING)
    private StatutReservation statut; // Utilisation de l'enum

    private LocalDateTime dateReservation;

    @Builder.Default
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Relation vers Utilisateur (Client/Utilisateur)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    // Relation vers Bien
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bien")
    private Bien bien;

    // Gestion automatique des dates
    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
