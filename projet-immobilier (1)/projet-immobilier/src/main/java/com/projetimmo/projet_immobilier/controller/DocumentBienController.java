package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.DocumentBien;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutDocumentBien;
import com.projetimmo.projet_immobilier.enums.TypeDocumentBien;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.DocumentBienRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents-bien")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
@RequiredArgsConstructor
@Slf4j
public class DocumentBienController {

    private final DocumentBienRepository documentBienRepository;
    private final BienRepository bienRepository;
    private final UtilisateurRepository utilisateurRepository;

    private static final String UPLOAD_DIR = "uploads/documents-biens/";

    @GetMapping("/bien/{bienId}")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsByBien(@PathVariable Long bienId) {
        List<DocumentBien> documents = documentBienRepository.findByBienId(bienId);

        List<Map<String, Object>> result = documents.stream()
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId().toString());
                    map.put("type", d.getType().toString());
                    map.put("statut", d.getStatut().toString());
                    map.put("nomFichier", d.getNomFichier());
                    map.put("dateSoumission", d.getDateSoumission() != null ? d.getDateSoumission().toString() : null);
                    map.put("dateVerification",
                            d.getDateVerification() != null ? d.getDateVerification().toString() : null);
                    map.put("commentaires", d.getCommentaires());
                    map.put("verifiePar", d.getVerifiePar());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload/{bienId}")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @PathVariable Long bienId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") TypeDocumentBien type,
            Authentication authentication) {

        String email = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (utilisateur.getAgence() == null) {
            throw new RuntimeException("Vous n'êtes pas associé à une agence");
        }

        Agence agence = utilisateur.getAgence();

        Bien bien = bienRepository.findById(bienId)
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        // Vérifier que le bien appartient à l'agence
        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new RuntimeException("Ce bien n'appartient pas à votre agence");
        }

        try {
            // Créer le dossier de stockage s'il n'existe pas
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Générer un nom de fichier unique
            String fileName = bienId + "_" + type + "_" + System.currentTimeMillis() + ".pdf";
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            // Sauvegarder le fichier
            file.transferTo(filePath.toFile());

            // Créer l'entrée en base de données
            DocumentBien document = DocumentBien.builder()
                    .bien(bien)
                    .agence(agence)
                    .type(type)
                    .statut(StatutDocumentBien.EN_ATTENTE)
                    .documentUrl(filePath.toString())
                    .nomFichier(file.getOriginalFilename())
                    .dateSoumission(LocalDateTime.now())
                    .commentaires("Document soumis - En attente de vérification par l'administration")
                    .build();

            documentBienRepository.save(document);

            log.info("Document {} uploadé pour le bien {} par l'agence {}", type, bienId, agence.getNom());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Document soumis avec succès. En attente de vérification.");
            response.put("documentId", document.getId().toString());
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Erreur lors de l'upload du document: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'upload du fichier");
        }
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasAnyRole('AGENCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        DocumentBien document = documentBienRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        try {
            Path filePath = Paths.get(document.getDocumentUrl());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Fichier non accessible");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + document.getNomFichier() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new RuntimeException("Erreur lors du téléchargement");
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable UUID documentId,
            Authentication authentication) {

        String email = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (utilisateur.getAgence() == null) {
            throw new RuntimeException("Vous n'êtes pas associé à une agence");
        }

        DocumentBien document = documentBienRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        if (!document.getAgence().getId().equals(utilisateur.getAgence().getId())) {
            throw new RuntimeException("Ce document n'appartient pas à votre agence");
        }

        try {
            File file = new File(document.getDocumentUrl());
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception e) {
            log.warn("Impossible de supprimer le fichier physique: {}", e.getMessage());
        }

        documentBienRepository.delete(document);

        log.info("Document {} supprimé par l'agence {}", documentId, utilisateur.getAgence().getNom());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Document supprimé avec succès");
        return ResponseEntity.ok(response);
    }
}
