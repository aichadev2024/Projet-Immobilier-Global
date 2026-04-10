package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.ChangePasswordRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurCreateRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.service.interfaces.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

        private final UtilisateurService utilisateurService;

        @PostMapping
        public UtilisateurResponse creerUtilisateur(
                        @Valid @RequestBody UtilisateurCreateRequest request) {

                Utilisateur utilisateur = Utilisateur.builder()
                                .prenom(request.getPrenom())
                                .nom(request.getNom())
                                .email(request.getEmail())
                                .telephone(request.getTelephone())
                                .nomUtilisateur(request.getNomUtilisateur())
                                .motDePasse(request.getMotDePasse())
                                .statut(StatutUtilisateur.ACTIF)
                                .build();

                Utilisateur saved = utilisateurService.creerUtilisateur(utilisateur);

                return UtilisateurResponse.builder()
                                .id(saved.getId())
                                .prenom(saved.getPrenom())
                                .nom(saved.getNom())
                                .email(saved.getEmail())
                                .telephone(saved.getTelephone())
                                .nomUtilisateur(saved.getNomUtilisateur())
                                .role(saved.getRole().getNom())
                                .createdAt(saved.getCreatedAt())
                                .build();
        }

        @DeleteMapping("/{id}")
        public void supprimerUtilisateur(@PathVariable UUID id) {
                utilisateurService.supprimerUtilisateur(id);
        }

        @PutMapping("/{id}")
        public UtilisateurResponse updateUtilisateur(
                        @PathVariable UUID id,
                        @Valid @RequestBody UtilisateurCreateRequest request) {

                Utilisateur utilisateur = Utilisateur.builder()
                                .prenom(request.getPrenom())
                                .nom(request.getNom())
                                .email(request.getEmail())
                                .telephone(request.getTelephone())
                                .nomUtilisateur(request.getNomUtilisateur())
                                .motDePasse(request.getMotDePasse())
                                .build();

                Utilisateur updated = utilisateurService.mettreAJourUtilisateur(id, utilisateur);

                return UtilisateurResponse.builder()
                                .id(updated.getId())
                                .prenom(updated.getPrenom())
                                .nom(updated.getNom())
                                .email(updated.getEmail())
                                .telephone(updated.getTelephone())
                                .nomUtilisateur(updated.getNomUtilisateur())
                                .role(updated.getRole().getNom())
                                .createdAt(updated.getCreatedAt())
                                .build();
        }

        @GetMapping("/me")
        public UtilisateurResponse getUtilisateurConnecte(Authentication authentication) {

                // Récupération du nom d'utilisateur (login)
                String username = authentication.getName();

                // Récupérer l'entité Utilisateur depuis la base
                Utilisateur utilisateur = utilisateurService
                                .getUtilisateurParNomUtilisateur(username);

                // Gérer le cas où le rôle est null
                String roleName = "UTILISATEUR"; // Valeur par défaut
                if (utilisateur.getRole() != null && utilisateur.getRole().getNom() != null) {
                        roleName = utilisateur.getRole().getNom();
                }

                // Construire la réponse DTO
                return UtilisateurResponse.builder()
                                .id(utilisateur.getId())
                                .prenom(utilisateur.getPrenom())
                                .nom(utilisateur.getNom())
                                .email(utilisateur.getEmail())
                                .telephone(utilisateur.getTelephone())
                                .nomUtilisateur(utilisateur.getNomUtilisateur())
                                .role(roleName)
                                .createdAt(utilisateur.getCreatedAt())
                                .build();
        }

        @GetMapping
        public List<UtilisateurResponse> getAllUtilisateurs() {
                return utilisateurService.listerUtilisateurs();
        }

        @PutMapping("/{id}/photo")
        public UtilisateurResponse uploadPhotoProfil(
                        @PathVariable UUID id,
                        @RequestParam("file") MultipartFile file) throws IOException {

                Utilisateur utilisateur = utilisateurService.getUtilisateurParId(id);

                if (file.isEmpty()) {
                        throw new RuntimeException("Fichier vide");
                }

                // Créer dossier uploads si inexistant
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                }

                // Générer nom unique
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Sauvegarder chemin accessible
                utilisateur.setPhotoProfil("/uploads/" + fileName);
                Utilisateur updated = utilisateurService.mettreAJourUtilisateur(id, utilisateur);

                return UtilisateurResponse.builder()
                                .id(updated.getId())
                                .prenom(updated.getPrenom())
                                .nom(updated.getNom())
                                .email(updated.getEmail())
                                .telephone(updated.getTelephone())
                                .nomUtilisateur(updated.getNomUtilisateur())
                                .role(updated.getRole().getNom())
                                .statut(updated.getStatut().name())
                                .createdAt(updated.getCreatedAt())
                                .photoProfil(updated.getPhotoProfil())
                                .build();
        }

        @PostMapping("/change-password")
        public void changePassword(
                        @Valid @RequestBody ChangePasswordRequest request,
                        Authentication authentication) {
                String username = authentication.getName();
                utilisateurService.changerMotDePasse(username, request.getCurrentPassword(), request.getNewPassword());
        }
}
