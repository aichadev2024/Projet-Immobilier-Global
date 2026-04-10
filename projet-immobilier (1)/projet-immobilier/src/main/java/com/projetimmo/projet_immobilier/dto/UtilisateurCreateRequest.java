package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UtilisateurCreateRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @Email(message = "Email invalide")
    @NotBlank(message = "Email obligatoire")
    private String email;

    private String telephone;

    @NotBlank(message = "Nom d'utilisateur obligatoire")
    private String nomUtilisateur;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 6, message = "Mot de passe minimum 6 caractères")
    private String motDePasse;

    private String role;
}
