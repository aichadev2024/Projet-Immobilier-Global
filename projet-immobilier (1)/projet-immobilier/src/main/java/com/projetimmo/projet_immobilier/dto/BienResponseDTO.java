package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BienResponseDTO {
    private Long id;
    private String libelle;
    private String description;
    private String adresse;
    private Double latitude;
    private Double longitude;
    private Integer superficie;
    private BigDecimal prixCalculer;
    private String devise;
    private StatutBien statutBien;
    private TransactionType transactionType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;
    
    // Informations sur l'agence (simplifiées)
    private Long agenceId;
    private String agenceNom;
    private String agenceEmail;
    
    // Informations sur le type de bien
    private Long idTypeBien;
    private String typeBienLibelle;
}
