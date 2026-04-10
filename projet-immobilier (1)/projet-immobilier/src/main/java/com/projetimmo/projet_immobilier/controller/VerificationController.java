package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/admin/email")
    public ResponseEntity<Map<String, Object>> verifierAdminEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean verification = verificationService.verifierAdminParEmail(email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", verification);
        response.put("message", verification ? "Admin vérifié avec succès" : "Échec de la vérification admin");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/utilisateur/telephone/envoyer-code")
    public ResponseEntity<Map<String, Object>> envoyerCodeVerification(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        String code = verificationService.genererCodeVerification();
        boolean envoye = verificationService.envoyerCodeVerification(telephone, code);

        Map<String, Object> response = new HashMap<>();
        response.put("success", envoye);
        response.put("message", envoye ? "Code envoyé avec succès" : "Échec de l'envoi du code");

        if (envoye) {
            response.put("code", code);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/utilisateur/telephone/verifier")
    public ResponseEntity<Map<String, Object>> verifierUtilisateurTelephone(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        String code = request.get("code");
        boolean verification = verificationService.verifierUtilisateurParTelephone(telephone, code);

        Map<String, Object> response = new HashMap<>();
        response.put("success", verification);
        response.put("message", verification ? "Utilisateur vérifié avec succès" : "Échec de la vérification");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/agence/verifier")
    public ResponseEntity<Map<String, Object>> verifierAgence(@RequestBody Map<String, Object> request) {
        try {
            // Conversion du Map vers l'entité Agence
            Agence agence = convertMapToAgence(request);

            // Appeler le service de vérification
            boolean verificationReussie = verificationService.verifierAgence(agence);

            Map<String, Object> response = new HashMap<>();
            response.put("success", verificationReussie);
            response.put("message",
                    verificationReussie ? "Agence vérifiée avec succès" : "Échec de la vérification de l'agence");
            response.put("agence", Map.of(
                    "id", agence.getId(),
                    "nom", agence.getNom(),
                    "statut", agence.getStatut()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la vérification de l'agence: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Agence convertMapToAgence(Map<String, Object> request) {
        return Agence.builder()
                .id(request.containsKey("id") ? UUID.fromString(request.get("id").toString()) : null)
                .nom((String) request.getOrDefault("nom", ""))
                .email((String) request.getOrDefault("email", ""))
                .telephone((String) request.getOrDefault("telephone", ""))
                .adresse((String) request.getOrDefault("adresse", ""))
                .ville((String) request.getOrDefault("ville", ""))
                .pays((String) request.getOrDefault("pays", ""))
                .codePostal((String) request.getOrDefault("codePostal", ""))
                .numeroLicence((String) request.getOrDefault("numeroLicence", ""))
                .siteWeb((String) request.getOrDefault("siteWeb", ""))
                .logoUrl((String) request.getOrDefault("logoUrl", ""))
                .description((String) request.getOrDefault("description", ""))
                .statut(StatutAgence.EN_ATTENTE_VERIFICATION) // Statut par défaut
                .build();
    }
}
