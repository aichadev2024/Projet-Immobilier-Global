package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.BienRequest;

import com.projetimmo.projet_immobilier.dto.BienResponse;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;

import java.util.List;

public interface BienService {

    BienResponse creerBien(BienRequest request);

    List<BienResponse> listerMesBiens();

    List<BienResponse> listerBiens();

    List<BienResponse> listerTousBiens(); // Pour admin - voir tous les biens incluant LOUE et VENDU

    BienResponse modifierBien(Long idBien, BienRequest request);

    void supprimerBien(Long idBien);

    List<BienResponse> getBiensByStatut(StatutBien statut);

    List<BienResponse> getBiensByTransactionType(TransactionType type);

    void validerBien(Long id);

    void refuserBien(Long id);
    
    BienResponse getBienDetailsWithMedias(Long idBien);
}
