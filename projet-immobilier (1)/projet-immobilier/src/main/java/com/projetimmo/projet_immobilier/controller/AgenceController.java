package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.service.interfaces.AgenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import com.projetimmo.projet_immobilier.dto.AgentCreateRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;

@RestController
@RequestMapping("/api/agences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"})
public class AgenceController {

    private final AgenceService agenceService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCE', 'UTILISATEUR')")
    public ResponseEntity<Agence> getAgenceById(@PathVariable UUID id) {
        return agenceService.getAgenceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE')")
    public ResponseEntity<Agence> getAgenceByEmail(@PathVariable String email) {
        return agenceService.getAgenceByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'UTILISATEUR')")
    public ResponseEntity<List<Agence>> getAllAgences() {
        List<Agence> agences = agenceService.getAllAgences();
        return ResponseEntity.ok(agences);
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE')")
    public ResponseEntity<List<Agence>> getAgencesByStatut(@PathVariable StatutAgence statut) {
        List<Agence> agences = agenceService.getAgencesByStatut(statut);
        return ResponseEntity.ok(agences);
    }

    @GetMapping("/ville/{ville}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCE', 'UTILISATEUR')")
    public ResponseEntity<List<Agence>> getAgencesByVille(@PathVariable String ville) {
        List<Agence> agences = agenceService.getAgencesByVille(ville);
        return ResponseEntity.ok(agences);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCE', 'UTILISATEUR')")
    public ResponseEntity<List<Agence>> searchAgences(@RequestParam String searchTerm) {
        List<Agence> agences = agenceService.searchAgences(searchTerm);
        return ResponseEntity.ok(agences);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE')")
    public ResponseEntity<Agence> updateAgence(@PathVariable UUID id, @RequestBody Agence agence) {
        try {
            Agence updatedAgence = agenceService.updateAgence(id, agence);
            return ResponseEntity.ok(updatedAgence);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAgence(@PathVariable UUID id) {
        agenceService.deleteAgence(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/soft")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> softDeleteAgence(@PathVariable UUID id) {
        agenceService.softDeleteAgence(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/verifier")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Agence> verifierAgence(@PathVariable UUID id) {
        try {
            Agence agence = agenceService.verifierAgence(id);
            return ResponseEntity.ok(agence);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/suspendre")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Agence> suspendreAgence(@PathVariable UUID id) {
        try {
            Agence agence = agenceService.suspendreAgence(id);
            return ResponseEntity.ok(agence);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Agence> rejeterAgence(@PathVariable UUID id) {
        try {
            Agence agence = agenceService.rejeterAgence(id);
            return ResponseEntity.ok(agence);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<Agence> getMyProfile(Authentication authentication) {
        try {
            Agence agence = agenceService.getMyProfile(authentication.getName());
            return ResponseEntity.ok(agence);
        } catch (IllegalArgumentException e) {
            log.error("Agency profile not found for user {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            log.error("Error fetching agency profile for user {}: {}", authentication.getName(), e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    public ResponseEntity<Agence> updateMyProfile(Authentication authentication, @RequestBody Agence agence) {
        return ResponseEntity.ok(agenceService.updateMyProfile(authentication.getName(), agence));
    }

    @GetMapping("/agents")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<List<UtilisateurResponse>> getMyAgents(Authentication authentication) {
        return ResponseEntity.ok(agenceService.getMyAgents(authentication.getName()));
    }

    @PostMapping("/agents")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<UtilisateurResponse> createMyAgent(Authentication authentication, @RequestBody AgentCreateRequest request) {
        return ResponseEntity.ok(agenceService.createMyAgent(authentication.getName(), request));
    }

    @DeleteMapping("/agents/{id}")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<Void> deleteMyAgent(Authentication authentication, @PathVariable UUID id) {
        agenceService.deleteMyAgent(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
