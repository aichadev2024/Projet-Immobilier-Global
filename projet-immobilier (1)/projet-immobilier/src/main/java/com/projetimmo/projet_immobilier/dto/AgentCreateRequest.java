package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AgentCreateRequest {
    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    @Email
    private String email;
    @NotBlank
    private String telephone;
    @NotBlank
    private String role; 
    
    private String specialite;
    private String permis;
}
