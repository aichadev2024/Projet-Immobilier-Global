package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.AgentCreateRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.AgenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agence/agents")
@RequiredArgsConstructor
@Slf4j
public class AgentController {

    private final AgenceService agenceService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Créer un nouvel agent (réservé aux agences validées)
     */
    @PostMapping
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, String>> createAgent(
            @RequestBody AgentCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Requête de création d'agent reçue de {}: {}", userDetails.getUsername(), request.getEmail());
        
        try {
            UtilisateurResponse agent = agenceService.createMyAgent(userDetails.getUsername(), request);
            
            return ResponseEntity.ok(Map.of(
                    "message", "L'agent " + agent.getPrenom() + " " + agent.getNom() + " a été créé avec succès. Un email d'invitation lui a été envoyé.",
                    "status", "SUCCESS"
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'agent: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage(),
                    "status", "ERROR"
            ));
        }
    }

    /**
     * Lister les agents de l'agence
     */
    @GetMapping
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<List<Map<String, Object>>> getMyAgents(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Utilisateur manager = utilisateurRepository.findByNomUtilisateur(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (manager.getAgence() == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Utilisateur> agents = utilisateurRepository.findByAgenceIdAndRoleNomAndIsDeletedFalse(
                manager.getAgence().getId(), "AGENT");

        List<Map<String, Object>> result = agents.stream()
                .map(agent -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", agent.getId().toString());
                    map.put("nom", agent.getNom());
                    map.put("prenom", agent.getPrenom());
                    map.put("email", agent.getEmail());
                    map.put("telephone", agent.getTelephone() != null ? agent.getTelephone() : "");
                    map.put("statut", agent.getStatut().toString());
                    map.put("createdAt", agent.getCreatedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Supprimer (désactiver) un agent
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, String>> deleteAgent(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Utilisateur manager = utilisateurRepository.findByNomUtilisateur(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Utilisateur agent = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        // Vérifier que l'agent appartient bien à la même agence
        if (manager.getAgence() == null || agent.getAgence() == null || 
            !manager.getAgence().getId().equals(agent.getAgence().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Accès non autorisé à cet agent"));
        }

        // Suppression logique
        agent.setIsDeleted(true);
        utilisateurRepository.save(agent);

        return ResponseEntity.ok(Map.of("message", "Agent supprimé avec succès"));
    }
}
