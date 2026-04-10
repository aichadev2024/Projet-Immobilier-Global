package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UtilisateurResponse {

    private UUID id;
    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String nomUtilisateur;
    private String role;
    private String statut;
    private LocalDateTime createdAt;
    private String photoProfil;

    private LocalDate dateEmbauche;
    private int biensGeres;
    private int ventesRealisees;
    private String specialite;
    private String permis;
    private String roleAgent;
}
