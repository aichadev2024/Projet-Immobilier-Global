package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContactAgenceRequest {
    
    @NotNull(message = "L'ID du bien est requis")
    private Long bienId;
    
    @NotNull(message = "L'ID de l'agence est requis")
    private String agenceId;
    
    @NotBlank(message = "Le message est requis")
    private String message;
}
