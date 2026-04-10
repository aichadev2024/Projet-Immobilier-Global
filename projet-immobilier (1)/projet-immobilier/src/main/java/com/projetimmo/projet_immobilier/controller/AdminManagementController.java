package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.EnhancedRegisterRequest;
import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@RequiredArgsConstructor
@Slf4j
public class AdminManagementController {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Créer un administrateur (réservé aux admins existants)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createAdmin(
            @RequestBody EnhancedRegisterRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String createdBy = userDetails.getUsername();

        try {
            // Vérifier que c'est bien un admin
            if (!"ADMIN".equals(request.getRoleType())) {
                throw new RuntimeException("Seul le rôle ADMIN est autorisé pour ce endpoint");
            }

            // Vérifier que l'email n'existe pas déjà
            if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Cet email est déjà associé à un compte");
            }

            // Vérifier que le nom d'utilisateur n'existe pas déjà
            if (utilisateurRepository.existsByNomUtilisateur(request.getUsername())) {
                throw new RuntimeException("Ce nom d'utilisateur est déjà utilisé");
            }

            // Récupérer le rôle ADMIN
            Role adminRole = roleRepository.findByNom("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rôle ADMIN non trouvé"));

            // Créer l'administrateur
            Utilisateur admin = Utilisateur.builder()
                    .id(UUID.randomUUID())
                    .nomUtilisateur(request.getUsername())
                    .email(request.getEmail())
                    .motDePasse(passwordEncoder.encode(request.getPassword()))
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .telephone(request.getTelephone())
                    .photoProfil(null)
                    .statut(StatutUtilisateur.ACTIF) // Les admins sont directement actifs
                    .isDeleted(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .role(adminRole)
                    .build();

            utilisateurRepository.save(Objects.requireNonNull(admin));

            log.info("✅ Administrateur créé - Email: {} | Username: {} | Créé par: {}",
                    request.getEmail(), request.getUsername(), createdBy);

            return ResponseEntity.status(201).body(Map.of(
                    "message", "Administrateur créé avec succès",
                    "admin", Map.of(
                            "id", admin.getId(),
                            "email", admin.getEmail(),
                            "username", admin.getNomUtilisateur(),
                            "nom", admin.getNom(),
                            "prenom", admin.getPrenom(),
                            "role", admin.getRole().getNom(),
                            "statut", admin.getStatut().toString(),
                            "createdBy", createdBy)));

        } catch (RuntimeException e) {
            log.warn("❌ Erreur lors de la création de l'admin: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Échec de la création de l'administrateur"));
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de la création de l'admin: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Erreur serveur",
                    "message", "Une erreur inattendue est survenue"));
        }
    }

    /**
     * Lister tous les utilisateurs avec filtre par rôle
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(@RequestParam(required = false) String role) {
        try {
            List<Utilisateur> utilisateurs;

            if (role != null && !role.trim().isEmpty()) {
                utilisateurs = utilisateurRepository.findByRoleNom(role.toUpperCase());
            } else {
                utilisateurs = utilisateurRepository.findAll();
            }

            List<Map<String, Object>> result = utilisateurs.stream()
                    .map(this::utilisateurToMap)
                    .collect(Collectors.toList());

            log.info("📋 Récupération de {} utilisateurs (filtre: {})", result.size(), role);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des utilisateurs: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Désactiver un utilisateur
     */
    @PutMapping("/{utilisateurId}/desactiver")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> desactiverUtilisateur(
            @PathVariable UUID utilisateurId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Empêcher la désactivation de soi-même
            if (utilisateur.getNomUtilisateur().equals(userDetails.getUsername())) {
                throw new RuntimeException("Vous ne pouvez pas désactiver votre propre compte");
            }

            utilisateur.setStatut(StatutUtilisateur.INACTIF);
            utilisateur.setUpdatedAt(LocalDateTime.now());
            utilisateurRepository.save(utilisateur);

            log.info("🔒 Utilisateur désactivé - ID: {} | Email: {} | Par: {}",
                    utilisateurId, utilisateur.getEmail(), userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Utilisateur désactivé avec succès",
                    "utilisateurId", utilisateurId.toString()));

        } catch (RuntimeException e) {
            log.warn("❌ Erreur lors de la désactivation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Échec de la désactivation"));
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de la désactivation: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Erreur serveur",
                    "message", "Une erreur inattendue est survenue"));
        }
    }

    /**
     * Supprimer un utilisateur
     */
    @DeleteMapping("/{utilisateurId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> supprimerUtilisateur(
            @PathVariable UUID utilisateurId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Empêcher la suppression de soi-même
            if (utilisateur.getNomUtilisateur().equals(userDetails.getUsername())) {
                throw new RuntimeException("Vous ne pouvez pas supprimer votre propre compte");
            }

            utilisateurRepository.delete(utilisateur);

            log.info("🗑️ Utilisateur supprimé - ID: {} | Email: {} | Par: {}",
                    utilisateurId, utilisateur.getEmail(), userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Utilisateur supprimé avec succès",
                    "utilisateurId", utilisateurId.toString()));

        } catch (RuntimeException e) {
            log.warn("❌ Erreur lors de la suppression: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Échec de la suppression"));
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de la suppression: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Erreur serveur",
                    "message", "Une erreur inattendue est survenue"));
        }
    }

    /**
     * Convertit un utilisateur en Map pour la réponse JSON
     */
    private Map<String, Object> utilisateurToMap(Utilisateur utilisateur) {
        return Map.of(
                "id", utilisateur.getId().toString(),
                "nom", utilisateur.getNom(),
                "prenom", utilisateur.getPrenom(),
                "email", utilisateur.getEmail(),
                "nomUtilisateur", utilisateur.getNomUtilisateur(),
                "telephone", utilisateur.getTelephone(),
                "role", utilisateur.getRole().getNom(),
                "statut", utilisateur.getStatut().toString(),
                "createdAt", utilisateur.getCreatedAt().toString(),
                "updatedAt", utilisateur.getUpdatedAt().toString());
    }
}
