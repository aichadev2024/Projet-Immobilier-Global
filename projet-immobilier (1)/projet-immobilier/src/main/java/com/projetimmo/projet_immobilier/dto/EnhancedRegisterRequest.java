package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnhancedRegisterRequest {

    // Champs communs
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String prenom;

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 30, message = "Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    private String username;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Veuillez entrer une adresse email valide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial")
    private String password;

    @NotBlank(message = "Le rôle est obligatoire")
    private String roleType; // UTILISATEUR, AGENCE, ADMIN

    // Champs spécifiques AGENCE
    private String nomAgence;
    private String adresseAgence;
    private String telephoneAgence;
    private String nina;
    private String descriptionAgence;

    // Champs spécifiques UTILISATEUR
    private String telephone;



    // Getters pour compatibilité avec le code existant
    public String getNomUtilisateur() {
        return username;
    }

    public String getMotDePasse() {
        return password;
    }

    // Validation métier
    public boolean isAgence() {
        return "AGENCE".equalsIgnoreCase(roleType);
    }

    public boolean isUtilisateur() {
        return "UTILISATEUR".equalsIgnoreCase(roleType);
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(roleType);
    }

    public boolean isSuperAdmin() {
        return false;
    }
}
