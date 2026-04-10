package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.ContactAgenceRequest;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.ContactAgence;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.ContactAgenceRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ContactController {

    private final ContactAgenceRepository contactAgenceRepository;
    private final BienRepository bienRepository;
    private final UtilisateurRepository utilisateurRepository;

    // Contacter une agence pour un bien
    @PostMapping("/agence")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ResponseEntity<Map<String, Object>> contacterAgence(
            @Valid @RequestBody ContactAgenceRequest request,
            Authentication authentication) {
        
        try {
            // Get authenticated user from security context
            String username = authentication.getName();
            Utilisateur client = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            // Vérifier que le bien existe
            Bien bien = bienRepository.findById(request.getBienId())
                    .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

            // Vérifier que l'agence existe
            Utilisateur agence = utilisateurRepository.findById(UUID.fromString(request.getAgenceId()))
                    .orElseThrow(() -> new RuntimeException("Agence non trouvée"));

            // Vérifier que le bien appartient bien à cette agence
            if (!bien.getAgence().getId().equals(agence.getId())) {
                throw new RuntimeException("Ce bien n'appartient pas à cette agence");
            }

            // Vérifier que le client ne contacte pas déjà pour ce bien
            contactAgenceRepository.findByBienIdAndClientId(request.getBienId(), client.getId())
                    .ifPresent(contact -> {
                        throw new RuntimeException("Vous avez déjà contacté cette agence pour ce bien");
                    });

            // Créer le contact
            ContactAgence contact = ContactAgence.builder()
                    .bien(bien)
                    .agence(agence)
                    .client(client)
                    .message(request.getMessage())
                    .statut(com.projetimmo.projet_immobilier.enums.StatutContact.EN_ATTENTE)
                    .build();

            ContactAgence savedContact = contactAgenceRepository.save(contact);

            log.info("Nouveau contact créé: Client {} -> Agence {} pour le bien {}", 
                    client.getEmail(), agence.getEmail(), bien.getLibelle());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message envoyé avec succès à l'agence");
            response.put("contactId", savedContact.getId());
            
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Erreur lors du contact de l'agence: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Erreur inattendue lors du contact de l'agence: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi du message");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Lister les contacts reçus par une agence
    @GetMapping("/agence/recus")
    @PreAuthorize("hasRole('AGENCE')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getContactsRecus(Authentication authentication) {
        try {
            // Get authenticated user from security context using username
            String username = authentication.getName();
            Utilisateur agence = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Agence non trouvée"));

            List<ContactAgence> contacts = contactAgenceRepository.findByAgenceIdOrderByDateContactDesc(agence.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("contacts", contacts);
            response.put("total", contacts.size());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contacts reçus: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des contacts");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Lister les contacts envoyés par un client
    @GetMapping("/client/envoyes")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ResponseEntity<Map<String, Object>> getContactsEnvoyes(Authentication authentication) {
        try {
            // Get authenticated user from security context
            String username = authentication.getName();
            Utilisateur client = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            
            List<ContactAgence> contacts = contactAgenceRepository.findByClientIdOrderByDateContactDesc(client.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("contacts", contacts);
            response.put("total", contacts.size());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des contacts envoyés: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des contacts");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Marquer un contact comme lu
    @PutMapping("/{contactId}/marquer-lu")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> marquerCommeLu(
            @PathVariable Long contactId,
            Authentication authentication) {
        
        try {
            // Get authenticated user from security context
            String username = authentication.getName();
            Utilisateur agence = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Agence non trouvée"));
            
            ContactAgence contact = contactAgenceRepository.findById(contactId)
                    .orElseThrow(() -> new RuntimeException("Contact non trouvé"));

            // Vérifier que le contact appartient bien à cette agence
            if (!contact.getAgence().getId().equals(agence.getId())) {
                throw new RuntimeException("Ce contact ne vous appartient pas");
            }

            contact.setStatut(com.projetimmo.projet_immobilier.enums.StatutContact.LU);
            contactAgenceRepository.save(contact);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact marqué comme lu");
            
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Erreur lors du marquage du contact comme lu: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Erreur inattendue lors du marquage du contact: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du traitement");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Répondre à un contact
    @PutMapping("/{contactId}/repondre")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> repondreContact(
            @PathVariable Long contactId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        try {
            // Get authenticated user from security context
            String username = authentication.getName();
            Utilisateur agence = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Agence non trouvée"));
            
            String reponse = request.get("reponse");
            if (reponse == null || reponse.trim().isEmpty()) {
                throw new RuntimeException("La réponse ne peut pas être vide");
            }

            ContactAgence contact = contactAgenceRepository.findById(contactId)
                    .orElseThrow(() -> new RuntimeException("Contact non trouvé"));

            // Vérifier que le contact appartient bien à cette agence
            if (!contact.getAgence().getId().equals(agence.getId())) {
                throw new RuntimeException("Ce contact ne vous appartient pas");
            }

            contact.setReponse(reponse);
            contact.setDateReponse(java.time.LocalDateTime.now());
            contact.setStatut(com.projetimmo.projet_immobilier.enums.StatutContact.REPONDU);
            contactAgenceRepository.save(contact);

            log.info("Réponse envoyée pour le contact {} par l'agence {}", contactId, agence.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Réponse envoyée avec succès");
            
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Erreur lors de la réponse au contact: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Erreur inattendue lors de la réponse au contact: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi de la réponse");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
