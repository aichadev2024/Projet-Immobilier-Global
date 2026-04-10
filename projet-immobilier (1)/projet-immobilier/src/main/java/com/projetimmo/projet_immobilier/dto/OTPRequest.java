package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OTPRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 30, message = "Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    private String username;

    @Pattern(regexp = "^[+]?[0-9\\s]{8,15}$", message = "Le numéro de téléphone n'est pas valide")
    private String telephone;
}
