package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.entity.Verification;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.enums.StatutVerification;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.repository.VerificationRepository;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.io.File;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin/validation")
@RequiredArgsConstructor
@Slf4j
public class AdminValidationController {

        private final UtilisateurRepository utilisateurRepository;
        private final AgenceRepository agenceRepository;
        private final VerificationRepository verificationRepository;

        private final com.projetimmo.projet_immobilier.service.BrevoService brevoService;

        /**
         * Récupérer la liste des agences en attente de validation
         */
        @GetMapping("/agences/en-attente")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<List<Map<String, Object>>> getAgencesEnAttente() {
                log.info("Récupération des agences en attente de validation");

                List<Utilisateur> agencesEnAttente = utilisateurRepository
                                .findByRoleNomAndStatut("AGENCE", StatutUtilisateur.EN_ATTENTE_VALIDATION);

                List<Map<String, Object>> result = agencesEnAttente.stream()
                                .map(this::utilisateurToMap)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(result);
        }

        /**
         * Récupérer la liste de toutes les agences
         */
        @GetMapping("/agences")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @Transactional(readOnly = true)
        public ResponseEntity<List<Map<String, Object>>> getAllAgences() {
                log.info("Récupération de toutes les agences");

                List<Utilisateur> allAgences = utilisateurRepository
                                .findByRoleNomAndIsDeletedFalse("AGENCE");

                List<Map<String, Object>> result = allAgences.stream()
                                .map(this::utilisateurToMap)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(result);
        }

        /**
         * Valider une agence
         */
        @PostMapping("/agences/{utilisateurId}/valider")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @Transactional
        public ResponseEntity<Map<String, String>> validerAgence(
                        @PathVariable UUID utilisateurId,
                        Principal principal) {

                String adminUsername = principal != null ? principal.getName() : "system";
                log.info("Tentative de validation de l'agence {} par l'admin {}", utilisateurId,
                                adminUsername);

                Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (!"AGENCE".equals(utilisateur.getRole().getNom())) {
                        throw new RuntimeException("Cet utilisateur n'est pas une agence");
                }

                if (utilisateur.getStatut() != StatutUtilisateur.EN_ATTENTE_VALIDATION) {
                        throw new RuntimeException("Cette agence n'est pas en attente de validation");
                }

                // 📄 Vérifier que tous les documents sont approuvés avant validation
                if (utilisateur.getAgence() != null) {
                        UUID agenceId = utilisateur.getAgence().getId();
                        List<Verification> verifications = verificationRepository.findByAgenceId(agenceId);

                        // Si des documents existent, vérifier qu'ils sont tous approuvés
                        if (!verifications.isEmpty()) {
                                boolean hasPendingDocuments = verifications.stream()
                                                .anyMatch(v -> v.getStatut() == StatutVerification.EN_ATTENTE);
                                boolean hasRejectedDocuments = verifications.stream()
                                                .anyMatch(v -> v.getStatut() == StatutVerification.REJETTEE);

                                if (hasPendingDocuments) {
                                        throw new RuntimeException(
                                                        "Impossible de valider l'agence : des documents sont en attente de vérification. Veuillez vérifier tous les documents avant de valider l'agence.");
                                }

                                if (hasRejectedDocuments) {
                                        throw new RuntimeException(
                                                        "Impossible de valider l'agence : certains documents ont été rejetés. L'agence doit soumettre de nouveaux documents.");
                                }
                        }
                }

                // Validation de l'agence
                utilisateur.setStatut(StatutUtilisateur.ACTIF);
                utilisateurRepository.save(utilisateur);

                // Mise à jour de l'entité Agence associée
                if (utilisateur.getAgence() != null) {
                        var agence = utilisateur.getAgence();
                        agence.setStatut(StatutAgence.VERIFIEE);
                        agenceRepository.save(agence);
                        log.info("🏢 ENTITÉ AGENCE VALIDÉE - Nom: {}", agence.getNom());

                        // Envoyer l'email de confirmation
                        try {
                                String subject = "Bienvenue sur Projet Immobilier - Votre agence est validée !";
                                String htmlContent = "<h1>Félicitations " + utilisateur.getPrenom() + " !</h1>" +
                                                "<p>Nous avons le plaisir de vous informer que votre agence <strong>"
                                                + agence.getNom() + "</strong> a été validée par notre équipe.</p>" +
                                                "<p>Vous pouvez désormais vous connecter à votre espace professionnel pour :</p>"
                                                +
                                                "<ul>" +
                                                "<li>Publier vos annonces gratuitement</li>" +
                                                "<li>Gérer vos agents</li>" +
                                                "<li>Suivre vos statistiques</li>" +
                                                "</ul>" +
                                                "<p><a href='http://localhost:3000/login' style='background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Se connecter à mon espace</a></p>";

                                brevoService.sendEmail(utilisateur.getEmail(), utilisateur.getPrenom(), subject,
                                                htmlContent, "Votre agence est validée !");
                        } catch (Exception e) {
                                log.error("Erreur lors de l'envoi de l'email de validation: {}", e.getMessage());
                        }
                }

                log.info("✅ AGENCE VALIDÉE - ID: {} | Email: {} | Validée par: {}",
                                utilisateurId, utilisateur.getEmail(), adminUsername);
                return ResponseEntity.ok(Map.of(
                                "message", "Agence validée avec succès",
                                "agenceId", utilisateurId.toString(),
                                "agenceEmail", utilisateur.getEmail(),
                                "status", "VALIDÉE"));
        }

        /**
         * Refuser une agence
         */
        @PostMapping("/agences/{utilisateurId}/refuser")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @Transactional
        public ResponseEntity<Map<String, String>> refuserAgence(
                        @PathVariable UUID utilisateurId,
                        @RequestBody(required = false) Map<String, String> raisonRefus,
                        Principal principal) {

                String adminUsername = principal != null ? principal.getName() : "system";
                log.info("Tentative de refus de l'agence {} par l'admin {}", utilisateurId, adminUsername);
                Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (!"AGENCE".equals(utilisateur.getRole().getNom())) {
                        throw new RuntimeException("Cet utilisateur n'est pas une agence");
                }

                if (utilisateur.getStatut() != StatutUtilisateur.EN_ATTENTE_VALIDATION) {
                        throw new RuntimeException("Cette agence n'est pas en attente de validation");
                }

                // Refus de l'agence (suppression ou statut refusé)
                utilisateur.setStatut(StatutUtilisateur.INACTIF);
                utilisateurRepository.save(utilisateur);

                // Mise à jour de l'entité Agence associée
                if (utilisateur.getAgence() != null) {
                        var agence = utilisateur.getAgence();
                        agence.setStatut(StatutAgence.REJETEE);
                        agenceRepository.save(agence);
                        log.info("❌ ENTITÉ AGENCE REJETÉE - Nom: {}", agence.getNom());
                }

                String raison = raisonRefus != null ? raisonRefus.get("raison") : "Non spécifiée";

                log.info("❌ AGENCE REFUSÉE - ID: {} | Email: {} | Raison: {} | Refusée par: {}",
                                utilisateurId, utilisateur.getEmail(), raison, adminUsername);

                return ResponseEntity.ok(Map.of(
                                "message", "Agence refusée",
                                "agenceId", utilisateurId.toString(),
                                "agenceEmail", utilisateur.getEmail(),
                                "raison", raison,
                                "status", "REFUSÉE"));
        }

        /**
         * Statistiques des validations
         */
        @GetMapping("/statistiques")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<Map<String, Object>> getStatistiquesValidation() {
                long totalAgences = utilisateurRepository.countByRoleNom("AGENCE");
                long agencesEnAttente = utilisateurRepository
                                .countByRoleNomAndStatut("AGENCE", StatutUtilisateur.EN_ATTENTE_VALIDATION);
                long agencesActives = utilisateurRepository
                                .countByRoleNomAndStatut("AGENCE", StatutUtilisateur.ACTIF);
                long agencesInactives = utilisateurRepository
                                .countByRoleNomAndStatut("AGENCE", StatutUtilisateur.INACTIF);

                return ResponseEntity.ok(Map.of(
                                "totalAgences", totalAgences,
                                "agencesEnAttente", agencesEnAttente,
                                "agencesActives", agencesActives,
                                "agencesInactives", agencesInactives));
        }

        /**
         * Récupérer les documents d'une agence
         */
        @GetMapping("/agences/{utilisateurId}/documents")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<List<Map<String, Object>>> getAgenceDocuments(
                        @PathVariable UUID utilisateurId) {

                log.info("Récupération des documents pour l'agence de l'utilisateur: {}", utilisateurId);

                Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (utilisateur.getAgence() == null) {
                        throw new RuntimeException("Cet utilisateur n'a pas d'agence associée");
                }

                UUID agenceId = utilisateur.getAgence().getId();
                List<Verification> verifications = verificationRepository.findByAgenceId(agenceId);

                List<Map<String, Object>> documents = verifications.stream()
                                .<Map<String, Object>>map(v -> {
                                        Map<String, Object> map = new HashMap<>();
                                        map.put("id", v.getId().toString());
                                        map.put("type", v.getTypeDocumentAgence() != null
                                                        ? v.getTypeDocumentAgence().toString()
                                                        : v.getType().toString());
                                        map.put("statut", v.getStatut().toString());
                                        map.put("dateDemande",
                                                        v.getDateDemande() != null ? v.getDateDemande().toString()
                                                                        : null);
                                        map.put("dateTraitement",
                                                        v.getDateTraitement() != null ? v.getDateTraitement().toString()
                                                                        : null);
                                        map.put("traitePar", v.getTraitePar());
                                        map.put("commentaires", v.getCommentaires());
                                        map.put("documentUrl", v.getDocumentUrl());
                                        return map;
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(documents);
        }

        /**
         * Télécharger un document
         */
        @GetMapping("/documents/{verificationId}/download")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<Resource> downloadDocument(@PathVariable UUID verificationId) {

                log.info("Téléchargement du document: {}", verificationId);

                Verification verification = verificationRepository.findById(Objects.requireNonNull(verificationId))
                                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

                String documentPath = verification.getDocumentUrl();
                if (documentPath == null || documentPath.isEmpty()) {
                        throw new RuntimeException("Chemin du document non disponible");
                }

                File file = new File(documentPath);
                if (!file.exists()) {
                        throw new RuntimeException("Fichier non trouvé sur le serveur");
                }

                Resource resource = new FileSystemResource(file);

                return ResponseEntity.ok()
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + file.getName() + "\"")
                                .body(resource);
        }

        /**
         * Approuver un document
         */
        @PostMapping("/documents/{verificationId}/approuver")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @Transactional
        public ResponseEntity<Map<String, String>> approuverDocument(
                        @PathVariable UUID verificationId,
                        @RequestBody(required = false) Map<String, String> request,
                        Principal principal) {

                String adminUsername = principal != null ? principal.getName() : "system";
                String commentaires = request != null ? request.getOrDefault("commentaires", "Document approuvé")
                                : "Document approuvé";

                log.info("Approbation du document {} par {}", verificationId, adminUsername);

                Verification verification = verificationRepository.findById(Objects.requireNonNull(verificationId))
                                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

                verification.setStatut(StatutVerification.APPROUVEE);
                verification.setDateTraitement(LocalDateTime.now());
                verification.setTraitePar(adminUsername);
                verification.setCommentaires(commentaires);

                verificationRepository.save(verification);

                log.info("✅ Document approuvé: {}", verificationId);

                return ResponseEntity.ok(Map.of(
                                "message", "Document approuvé avec succès",
                                "documentId", verificationId.toString(),
                                "statut", "APPROUVEE"));
        }

        /**
         * Rejeter un document
         */
        @PostMapping("/documents/{verificationId}/rejeter")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        @Transactional
        public ResponseEntity<Map<String, String>> rejeterDocument(
                        @PathVariable UUID verificationId,
                        @RequestBody(required = false) Map<String, String> request,
                        Principal principal) {

                String adminUsername = principal != null ? principal.getName() : "system";
                String commentaires = request != null ? request.getOrDefault("commentaires", "Document rejeté")
                                : "Document rejeté";

                log.info("Rejet du document {} par {} - Raison: {}", verificationId, adminUsername, commentaires);

                Verification verification = verificationRepository.findById(Objects.requireNonNull(verificationId))
                                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

                verification.setStatut(StatutVerification.REJETTEE);
                verification.setDateTraitement(LocalDateTime.now());
                verification.setTraitePar(adminUsername);
                verification.setCommentaires(commentaires);

                verificationRepository.save(verification);

                log.info("❌ Document rejeté: {}", verificationId);

                return ResponseEntity.ok(Map.of(
                                "message", "Document rejeté",
                                "documentId", verificationId.toString(),
                                "statut", "REJETTEE",
                                "raison", commentaires));
        }

        /**
         * Vérifier si tous les documents d'une agence sont approuvés
         */
        @GetMapping("/agences/{utilisateurId}/documents/verification-status")
        @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<Map<String, Object>> checkDocumentsVerificationStatus(
                        @PathVariable UUID utilisateurId) {

                Utilisateur utilisateur = utilisateurRepository.findById(Objects.requireNonNull(utilisateurId))
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (utilisateur.getAgence() == null) {
                        throw new RuntimeException("Cet utilisateur n'a pas d'agence associée");
                }

                UUID agenceId = utilisateur.getAgence().getId();
                List<Verification> verifications = verificationRepository.findByAgenceId(agenceId);

                long totalDocuments = verifications.size();
                long approvedDocuments = verifications.stream()
                                .filter(v -> v.getStatut() == StatutVerification.APPROUVEE)
                                .count();
                long rejectedDocuments = verifications.stream()
                                .filter(v -> v.getStatut() == StatutVerification.REJETTEE)
                                .count();
                long pendingDocuments = verifications.stream()
                                .filter(v -> v.getStatut() == StatutVerification.EN_ATTENTE)
                                .count();

                boolean allApproved = totalDocuments > 0 && approvedDocuments == totalDocuments;
                boolean hasRejected = rejectedDocuments > 0;

                return ResponseEntity.ok(Map.of(
                                "totalDocuments", totalDocuments,
                                "approvedDocuments", approvedDocuments,
                                "rejectedDocuments", rejectedDocuments,
                                "pendingDocuments", pendingDocuments,
                                "allApproved", allApproved,
                                "hasRejected", hasRejected,
                                "canValidate", allApproved && !hasRejected));
        }

        /**
         * Convertit un utilisateur en Map pour la réponse JSON
         */
        private Map<String, Object> utilisateurToMap(Utilisateur utilisateur) {
                // Vérifier si l'agence a des documents
                boolean hasDocuments = false;
                boolean allDocumentsApproved = false;
                if (utilisateur.getAgence() != null) {
                        List<Verification> verifications = verificationRepository
                                        .findByAgenceId(utilisateur.getAgence().getId());
                        hasDocuments = !verifications.isEmpty();
                        allDocumentsApproved = hasDocuments && verifications.stream()
                                        .allMatch(v -> v.getStatut() == StatutVerification.APPROUVEE);
                }

                Map<String, Object> result = new HashMap<>();
                result.put("id", utilisateur.getId().toString());
                result.put("nom", utilisateur.getNom());
                result.put("prenom", utilisateur.getPrenom());
                result.put("email", utilisateur.getEmail());
                result.put("nomUtilisateur", utilisateur.getNomUtilisateur());
                result.put("telephone", utilisateur.getTelephone());
                result.put("statut", utilisateur.getStatut().toString());
                result.put("createdAt", utilisateur.getCreatedAt().toString());
                result.put("role", utilisateur.getRole().getNom());
                result.put("hasDocuments", hasDocuments);
                result.put("allDocumentsApproved", allDocumentsApproved);
                if (utilisateur.getAgence() != null) {
                    result.put("agenceNom", utilisateur.getAgence().getNom());
                    result.put("agenceAdresse", utilisateur.getAgence().getAdresse());
                }

                return result;
        }
}
