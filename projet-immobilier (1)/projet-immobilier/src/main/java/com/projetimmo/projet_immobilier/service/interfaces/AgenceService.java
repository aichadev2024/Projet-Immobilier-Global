package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.AgentCreateRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgenceService {

    Optional<Agence> getAgenceById(UUID id);

    Optional<Agence> getAgenceByEmail(String email);

    Optional<Agence> getAgenceByTelephone(String telephone);

    List<Agence> getAllAgences();

    List<Agence> getAgencesByStatut(StatutAgence statut);

    List<Agence> getAgencesByVille(String ville);

    List<Agence> searchAgences(String searchTerm);

    Agence updateAgence(UUID id, Agence agence);

    void deleteAgence(UUID id);

    void softDeleteAgence(UUID id);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);

    boolean existsByNumeroLicence(String numeroLicence);

    Agence verifierAgence(UUID id);

    Agence suspendreAgence(UUID id);

    Agence rejeterAgence(UUID id);

    Agence getMyProfile(String username);

    Agence updateMyProfile(String username, Agence agenceData);

    List<UtilisateurResponse> getMyAgents(String username);

    UtilisateurResponse createMyAgent(String username, AgentCreateRequest request);

    void deleteMyAgent(String username, UUID agentId);
}
