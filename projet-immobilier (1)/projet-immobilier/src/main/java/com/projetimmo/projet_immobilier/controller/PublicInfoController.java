package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicInfoController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/admin-info")
    public ResponseEntity<Map<String, Object>> getAdminInfo() {
        try {
            List<Utilisateur> admins = utilisateurRepository.findByRoleNom("ADMIN")
                    .stream()
                    .filter(u -> !u.getIsDeleted())
                    .collect(Collectors.toList());

            if (admins.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "message", "Aucun administrateur trouvé"
                ));
            } else {
                Utilisateur admin = admins.get(0);
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "admin", Map.of(
                        "username", admin.getNomUtilisateur(),
                        "email", admin.getEmail(),
                        "nom", admin.getNom(),
                        "prenom", admin.getPrenom(),
                        "statut", admin.getStatut().toString(),
                        "id", admin.getId().toString()
                    )
                ));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des infos admin: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erreur serveur",
                "message", "Impossible de vérifier l'administrateur"
            ));
        }
    }

    @PostMapping("/reset-admin-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword() {
        try {
            List<Utilisateur> admins = utilisateurRepository.findByRoleNom("ADMIN")
                    .stream()
                    .filter(u -> !u.getIsDeleted())
                    .collect(Collectors.toList());

            if (admins.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Aucun admin trouvé",
                    "message", "Impossible de réinitialiser le mot de passe"
                ));
            } else {
                Utilisateur admin = admins.get(0);
                String newPassword = "Admin2024!";
                
                // Réinitialiser le mot de passe
                admin.setMotDePasse(passwordEncoder.encode(newPassword));
                utilisateurRepository.save(admin);
                
                log.info("Mot de passe admin réinitialisé pour l'utilisateur: {}", admin.getNomUtilisateur());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mot de passe réinitialisé avec succès",
                    "username", admin.getNomUtilisateur(),
                    "newPassword", newPassword
                ));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la réinitialisation du mot de passe admin: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erreur serveur",
                "message", "Impossible de réinitialiser le mot de passe"
            ));
        }
    }
}
