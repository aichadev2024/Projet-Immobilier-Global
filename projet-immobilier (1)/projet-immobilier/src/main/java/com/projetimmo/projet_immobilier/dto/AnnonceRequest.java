package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.TypeAnnonce;
import com.projetimmo.projet_immobilier.enums.StatutAnnonce;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnonceRequest {

    private TypeAnnonce typeAnnonce;
    private StatutAnnonce statut;
    private Long idBien;
}
