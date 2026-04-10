package com.projetimmo.projet_immobilier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import com.projetimmo.projet_immobilier.entity.TypeBien;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienResponse {
    
    private Long id;
    private String libelle;
    private String description;
    private TypeBien typeBien;
    private String adresse;
    private String latitude;
    private String longitude;
    private java.math.BigDecimal prixCalculer;
    private java.math.BigDecimal prix;
    private java.math.BigDecimal commission;
    private Integer superficie;
    private StatutBien statutBien;
    private LocalDateTime dateCreation;
    private LocalDateTime datePublication;
    private List<String> images;
    private TransactionType transactionType;
    
    // Informations de l'agence
    private AgenceInfo utilisateur;
    
    // Caractéristiques du bien
    private CaracteristiquesInfo caracteristiques;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgenceInfo {
        private String id;
        private String nom;
        private String email;
        private String telephone;
        private String adresse;
        private AgenceDetails agence;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgenceDetails {
        private String nom;
        private String adresse;
        private String telephone;
        private String email;
        private String siteWeb;
        private String whatsapp;
        private Boolean visitePayante;
        private Double tarifVisite;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaracteristiquesInfo {
        private Integer superficie;
        private Integer nbChambres;
        private Integer nbSallesDeBain;
        private Integer nbParking;
        private Boolean meuble;
        private Boolean balcon;
        private Boolean jardin;
        private Boolean piscine;
        private Boolean climatisation;
        private Boolean cuisineEquipee;
        private Boolean wifi;
        private Boolean securite;
    }
}
