package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.AnnonceRequest;
import com.projetimmo.projet_immobilier.dto.AnnonceResponse;

import java.util.List;

public interface AnnonceService {

    AnnonceResponse creerAnnonce(AnnonceRequest request);

    List<AnnonceResponse> listerMesAnnonces();

    List<AnnonceResponse> listerToutesAnnonces();

    AnnonceResponse getAnnonceById(Long id);

    void supprimerAnnonce(Long id);
}
