package com.projetimmo.projet_immobilier.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import com.projetimmo.projet_immobilier.enums.TransactionType;

@Data
public class BienRequest {
    
    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;
    
    @NotBlank(message = "La description est obligatoire")
    private String description;
    
    @NotNull(message = "L'ID du type de bien est obligatoire")
    private Long idTypeBien;
    
    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;
    
    private String latitude;
    
    private String longitude;
    
    @NotNull(message = "La superficie est obligatoire")
    @Positive(message = "La superficie doit être supérieure à 0")
    private Integer superficie;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être supérieur à 0")
    private java.math.BigDecimal prix;

    @NotNull(message = "Le type de transaction est obligatoire")
    private TransactionType transactionType;
}
