package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.AvisRequest;
import com.projetimmo.projet_immobilier.dto.AvisResponse;

import java.util.List;
import java.util.UUID;

public interface AvisService {
    AvisResponse createAvis(AvisRequest request, UUID clientId);
    List<AvisResponse> getAvisForAgence(UUID agenceId);
    List<AvisResponse> getAvisForClient(UUID clientId);
    void repondreAvis(Long avisId, String reponse, UUID agenceId);
    void changerStatutAvis(Long avisId, String statut, UUID agenceId);
}
