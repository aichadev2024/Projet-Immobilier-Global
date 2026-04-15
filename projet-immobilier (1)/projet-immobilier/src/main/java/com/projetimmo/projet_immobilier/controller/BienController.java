package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.BienRequest;
import com.projetimmo.projet_immobilier.dto.BienResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.BienService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/biens")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BienController {

    private final BienService bienService;
    private final UtilisateurRepository utilisateurRepository;

    // Créer un bien (pour les agences)
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    public ResponseEntity<Map<String, Object>> createBien(@Valid @RequestBody BienRequest bienRequest, 
                                                        Authentication authentication) {
        try {
            // Get authenticated user from security context
            String username = authentication.getName();
            Utilisateur agence = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Agence non trouvée"));
            
            BienResponse createdBien = bienService.creerBien(bienRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien créé avec succès. En attente de validation.");
            response.put("bien", createdBien);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la création du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lister les biens disponibles (pour utilisateurs - exclut LOUE et VENDU)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBiens() {
        try {
            List<BienResponse> biens = bienService.listerBiens();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("biens", biens);
            response.put("total", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lister tous les biens pour admin (inclut LOUE et VENDU)
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllBiensForAdmin() {
        try {
            List<BienResponse> biens = bienService.listerTousBiens();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("biens", biens);
            response.put("total", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens admin: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lister les biens de l'agence connectée (inclut LOUE et VENDU)
    @GetMapping("/agence")
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    public ResponseEntity<Map<String, Object>> getMesBiens() {
        try {
            List<BienResponse> biens = bienService.listerMesBiens();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("biens", biens);
            response.put("total", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens agence: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lister les biens par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<Map<String, Object>> getBiensByStatut(@PathVariable StatutBien statut) {
        try {
            List<BienResponse> biens = bienService.getBiensByStatut(statut);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("biens", biens);
            response.put("total", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens par statut: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lister les biens par type de transaction
    @GetMapping("/transaction/{type}")
    public ResponseEntity<Map<String, Object>> getBiensByTransactionType(@PathVariable TransactionType type) {
        try {
            List<BienResponse> biens = bienService.getBiensByTransactionType(type);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("biens", biens);
            response.put("total", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens par type: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Obtenir un bien par ID avec tous les détails et médias
    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getBienDetails(@PathVariable Long id) {
        try {
            BienResponse bien = bienService.getBienDetailsWithMedias(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bien", bien);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des détails du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Obtenir un bien par ID (version simple)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBienById(@PathVariable Long id) {
        try {
            // Pour l'instant, nous utilisons listerBiens et filtrons
            List<BienResponse> biens = bienService.listerBiens();
            BienResponse bien = biens.stream()
                    .filter(b -> b.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Bien non trouvé"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bien", bien);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Mettre à jour un bien
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    public ResponseEntity<Map<String, Object>> updateBien(@PathVariable Long id, 
                                                      @Valid @RequestBody BienRequest bienRequest) {
        try {
            BienResponse updatedBien = bienService.modifierBien(id, bienRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien mis à jour avec succès");
            response.put("bien", updatedBien);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Supprimer un bien
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> deleteBien(@PathVariable Long id) {
        try {
            bienService.supprimerBien(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien supprimé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Valider un bien (admin)
    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> validerBien(@PathVariable Long id) {
        try {
            bienService.validerBien(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien validé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la validation du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Refuser un bien (admin)
    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> refuserBien(@PathVariable Long id) {
        try {
            bienService.refuserBien(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien refusé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors du refus du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ===================== VÉRIFICATION PAR L'AGENCE =====================

    // Lister les biens en attente de validation (pour l'agence)
    @GetMapping("/en-attente-validation")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> getBiensEnAttenteValidation() {
        try {
            List<BienResponse> biens = bienService.listerBiensEnAttenteValidation();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", biens);
            response.put("count", biens.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des biens en attente: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Approuver un bien (agence)
    @PostMapping("/{id}/approuver")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> approuverBien(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String commentaire = request != null ? request.get("commentaire") : null;
            bienService.approuverBien(id, commentaire);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien approuvé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'approbation du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Rejeter un bien (agence)
    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> rejeterBien(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String commentaire = request.get("commentaire");
            if (commentaire == null || commentaire.isBlank()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Un commentaire est obligatoire pour rejeter un bien");
                return ResponseEntity.badRequest().body(response);
            }
            
            bienService.rejeterBien(id, commentaire);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bien rejeté avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors du rejet du bien: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
