package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/agences")
@RequiredArgsConstructor
@Slf4j
public class AdminAgenceController {

    private final AgenceRepository agenceRepository;

    /**
     * Lister toutes les agences
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllAgences() {
        log.info("Récupération de toutes les agences");

        List<Agence> agences = agenceRepository.findByIsDeletedFalse();

        List<Map<String, Object>> result = agences.stream()
                .map(this::agenceToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Lister les agences en attente de validation
     */
    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAgencesEnAttente() {
        log.info("Récupération des agences en attente");

        List<Agence> agences = agenceRepository.findByStatut(StatutAgence.EN_ATTENTE_VERIFICATION);

        List<Map<String, Object>> result = agences.stream()
                .map(this::agenceToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Valider une agence
     */
    @PostMapping("/{agenceId}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> validerAgence(
            @PathVariable UUID agenceId,
            Principal principal) {

        String adminUsername = principal != null ? principal.getName() : "system";
        log.info("Validation de l'agence {} par {}", agenceId, adminUsername);

        Agence agence = agenceRepository.findById(agenceId)
                .orElseThrow(() -> new RuntimeException("Agence non trouvée"));

        if (agence.getStatut() != StatutAgence.EN_ATTENTE_VERIFICATION) {
            throw new RuntimeException("Cette agence n'est pas en attente de validation");
        }

        agence.setStatut(StatutAgence.VERIFIEE);
        agence.setUpdatedAt(LocalDateTime.now());
        agenceRepository.save(agence);

        log.info("✅ Agence validée - ID: {} | Nom: {}", agenceId, agence.getNom());

        return ResponseEntity.ok(Map.of(
                "message", "Agence validée avec succès",
                "agenceId", agenceId.toString(),
                "nom", agence.getNom(),
                "statut", "VERIFIEE",
                "info", "L'agence est maintenant prête. Les utilisateurs peuvent s'inscrire avec cet ID: " + agenceId
        ));
    }

    /**
     * Rejeter une agence
     */
    @PostMapping("/{agenceId}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> refuserAgence(
            @PathVariable UUID agenceId,
            @RequestBody(required = false) Map<String, String> raisonRefus,
            Principal principal) {

        String adminUsername = principal != null ? principal.getName() : "system";
        log.info("Refus de l'agence {} par {}", agenceId, adminUsername);

        Agence agence = agenceRepository.findById(agenceId)
                .orElseThrow(() -> new RuntimeException("Agence non trouvée"));

        if (agence.getStatut() != StatutAgence.EN_ATTENTE_VERIFICATION) {
            throw new RuntimeException("Cette agence n'est pas en attente de validation");
        }

        agence.setStatut(StatutAgence.REJETEE);
        agence.setUpdatedAt(LocalDateTime.now());
        agenceRepository.save(agence);

        String raison = raisonRefus != null ? raisonRefus.get("raison") : "Non spécifiée";

        log.info("❌ Agence refusée - ID: {} | Nom: {} | Raison: {}", agenceId, agence.getNom(), raison);

        return ResponseEntity.ok(Map.of(
                "message", "Agence refusée",
                "agenceId", agenceId.toString(),
                "nom", agence.getNom(),
                "statut", "REJETEE",
                "raison", raison
        ));
    }

    /**
     * Convertit une agence en Map
     */
    private Map<String, Object> agenceToMap(Agence agence) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", agence.getId().toString());
        map.put("nom", agence.getNom());
        map.put("email", agence.getEmail());
        map.put("telephone", agence.getTelephone());
        map.put("adresse", agence.getAdresse());
        map.put("ville", agence.getVille());
        map.put("pays", agence.getPays());
        map.put("nina", agence.getNina());
        map.put("statut", agence.getStatut().toString());
        map.put("createdAt", agence.getCreatedAt() != null ? agence.getCreatedAt().toString() : null);
        
        // Nombre d'utilisateurs associés
        int nbUtilisateurs = agence.getUtilisateurs() != null ? agence.getUtilisateurs().size() : 0;
        map.put("nbUtilisateurs", nbUtilisateurs);
        
        return map;
    }
}
