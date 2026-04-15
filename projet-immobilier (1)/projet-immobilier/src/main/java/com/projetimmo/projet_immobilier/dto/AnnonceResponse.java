package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.TypeAnnonce;
import com.projetimmo.projet_immobilier.enums.StatutAnnonce;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AnnonceResponse {

    private Long id;
    private TypeAnnonce typeAnnonce;
    private StatutAnnonce statut;

    // Titre de l'annonce (utilise le libellé du bien)
    private String titre;
    
    // Date de publication
    private String dateCreation;

    // Bien
    private Long idBien;
    private String libelleBien;
    private String description;
    private BigDecimal prix;
    private Double superficie;
    private String adresse;
    
    // Agence
    private String agenceNom;
    
    // Médias et méta
    private List<String> images;
    private TransactionType transactionType;
    
    // ID du créateur (lié au bien)
    private String createdById;
}