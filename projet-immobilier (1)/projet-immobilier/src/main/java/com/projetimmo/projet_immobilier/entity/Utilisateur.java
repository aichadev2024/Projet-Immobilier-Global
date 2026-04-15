package com.projetimmo.projet_immobilier.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;

@Entity
@Table(name = "utilisateurs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String telephone;

    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutUtilisateur statut;

    @Column(nullable = false, unique = true)
    private String nomUtilisateur;

    private String photoProfil;

    private LocalDate dateEmbauche;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int biensGeres = 0;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int ventesRealisees = 0;

    private String specialite;

    private String permis;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean enabled = true; // Setting to true for existing users to avoid lockouts

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean accountNonLocked = true;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int failedAttempt = 0;

    private LocalDateTime lockTime;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agence")
    private Agence agence;

    // 🔄 Lifecycle JPA
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
