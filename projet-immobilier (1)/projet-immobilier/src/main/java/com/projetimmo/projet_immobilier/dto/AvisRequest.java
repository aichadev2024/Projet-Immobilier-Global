package com.projetimmo.projet_immobilier.dto;

import lombok.Data;

@Data
public class AvisRequest {
    private Long bienId; // Optional depending if the review is on a property
    private String agenceId;
    private Integer note;
    private String commentaire;
}
