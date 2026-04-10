package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.MediaRequest;
import com.projetimmo.projet_immobilier.dto.MediaResponse;
import com.projetimmo.projet_immobilier.entity.Media;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.MediaRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.MediaService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medias")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class MediaController {

    private final MediaService mediaService;
    private final MediaRepository mediaRepository;
    private final UtilisateurRepository utilisateurRepository;

    // 🔹 Ajouter via DTO
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public MediaResponse ajouter(@RequestBody MediaRequest request) {
        return mediaService.ajouterMedia(request);
    }

    // 🔹 Upload multiple - CORRIGÉ
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public ResponseEntity<Map<String, Object>> uploadMultipleMedias(
            @RequestParam("bienId") Long bienId,
            @RequestParam("files") MultipartFile[] files,
            Authentication authentication) {

        log.info("🔹 DEBUG - MediaController.uploadMultipleMedias appelé");
        log.info("🔹 DEBUG - bienId: {}", bienId);
        log.info("🔹 DEBUG - files count: {}", files != null ? files.length : 0);
        log.info("🔹 DEBUG - authentication: {}", authentication != null ? authentication.getName() : "null");

        try {
            // ✅ Même approche que BienController qui fonctionne
            String username = authentication.getName();
            Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Agence agence = utilisateur.getAgence();
            if (agence == null) {
                throw new RuntimeException("Agence non trouvée pour l'utilisateur");
            }

            if (files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Aucun fichier fourni"));
            }

            for (MultipartFile file : files) {
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Le fichier " + file.getOriginalFilename() + " dépasse 10MB"));
                }
            }

            List<MediaResponse> uploadedMedias = mediaService.uploadMultipleMedias(bienId, files);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", files.length + " média(s) uploadé(s)",
                    "medias", uploadedMedias));

        } catch (IOException e) {
            log.error("Erreur upload: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur inattendue: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Erreur: " + e.getMessage()));
        }
    }

    // 🔹 Upload simple
    @PostMapping("/upload-single")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public MediaResponse uploadMedia(
            @RequestParam("idBien") Long idBien,
            @RequestParam("typeMedia") String typeMedia,
            @RequestParam("file") MultipartFile file) throws IOException {
        return mediaService.uploadMedia(idBien, typeMedia, file);
    }

    // 🔹 Tous les médias - CORRIGÉ
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    @Transactional(readOnly = true)

    public ResponseEntity<?> getAllMedias(Authentication authentication) {

        log.info("🔍 BACKEND MÉDIAS - Début getAllMedias");
        log.info("🔍 BACKEND MÉDIAS - Authentication: {}", authentication != null ? authentication.getName() : "null");

        String username = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        log.info("🔍 BACKEND MÉDIAS - Utilisateur trouvé: {}, rôle: {}", username, utilisateur.getRole());

        Agence agence = utilisateur.getAgence();
        if (agence == null) {
            log.error("🔍 BACKEND MÉDIAS - Agence non trouvée pour l'utilisateur: {}", username);
            throw new RuntimeException("Agence non trouvée pour l'utilisateur");
        }

        log.info("🔍 BACKEND MÉDIAS - Agence trouvée: {}, ID: {}", agence.getNom(), agence.getId());

        List<MediaResponse> medias;

        if (isAdmin(utilisateur)) {
            log.info("🔍 BACKEND MÉDIAS - Admin/SuperAdmin: tous les médias chargés");
            medias = mediaRepository.findAll()
                    .stream()
                    .map(mediaService::mapToResponse)
                    .toList();
        } else {
            log.info("🔍 BACKEND MÉDIAS - Agent/Agence: médias filtrés par agence ID: {}", agence.getId());
            medias = mediaRepository
                    .findByBienAgenceIdAndIsDeletedFalse(agence.getId())
                    .stream()
                    .map(mediaService::mapToResponse)
                    .toList();
        }

        log.info("🔍 BACKEND MÉDIAS - Nombre de médias trouvés: {}", medias.size());

        medias.forEach(media -> {
            log.info("Média {}: ID={}, nomFichier={}, url={}, bien={}",
                    media.getId(),
                    media.getNomFichier(),
                    media.getUrl(),
                    media.getBien() != null ? media.getBien().getLibelle() : "NULL");
        });

        ResponseEntity<?> response = ResponseEntity.ok(Map.of(
                "success", true,
                "medias", medias,
                "total", medias.size()));

        log.info("🔍 BACKEND MÉDIAS - Réponse envoyée avec {} médias", medias.size());
        return response;
    }

    // 🔹 Médias par bien
    @GetMapping("/bien/{idBien}")
    public List<MediaResponse> mediasParBien(@PathVariable Long idBien) {
        log.info("🔍 BACKEND MÉDIAS - Début mediasParBien");
        log.info("🔍 BACKEND MÉDIAS - idBien: {}", idBien);
        List<MediaResponse> medias = mediaService.listerMediaParBien(idBien);
        log.info("🔍 BACKEND MÉDIAS - Nombre de médias trouvés: {}", medias.size());
        medias.forEach(media -> {
            log.info("🔍 BACKEND MÉDIAS - Média {}: ID={}, nomFichier={}, url={}, isDeleted={}, bien={}",
                    media.getId(),
                    media.getNomFichier(),
                    media.getUrl(),
                    media.getBien() != null ? media.getBien().getLibelle() : "NULL");
        });
        return medias;
    }

    // 🔹 Détail média - CORRIGÉ
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public ResponseEntity<?> getMediaById(@PathVariable Long id, Authentication authentication) {

        log.info("🔍 BACKEND MÉDIAS - Début getMediaById");
        log.info("🔍 BACKEND MÉDIAS - id: {}", id);
        log.info("🔍 BACKEND MÉDIAS - Authentication: {}", authentication != null ? authentication.getName() : "null");

        // ✅ Même approche que BienController qui fonctionne
        String username = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        log.info("🔍 BACKEND MÉDIAS - Utilisateur trouvé: {}, rôle: {}", username, utilisateur.getRole());

        Agence agence = utilisateur.getAgence();
        if (agence == null) {
            log.error("🔍 BACKEND MÉDIAS - Agence non trouvée pour l'utilisateur: {}", username);
            throw new RuntimeException("Agence non trouvée pour l'utilisateur");
        }

        log.info("🔍 BACKEND MÉDIAS - Agence trouvée: {}, ID: {}", agence.getNom(), agence.getId());

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Média non trouvé"));

        log.info("🔍 BACKEND MÉDIAS - Média trouvé: ID={}, nomFichier={}, url={}, isDeleted={}, bien={}",
                media.getId(),
                media.getNomFichier(),
                media.getUrl(),
                media.getIsDeleted(),
                media.getBien() != null ? media.getBien().getLibelle() : "NULL");

        // 🔥 Sécurité agence
        if (!utilisateur.getRole().toString().equals("ADMIN")
                && !utilisateur.getRole().toString().equals("SUPER_ADMIN")
                && !belongsToSameAgence(media, agence)) {
            log.error("🔍 BACKEND MÉDIAS - Accès non autorisé pour l'utilisateur: {}", username);
            throw new RuntimeException("Accès non autorisé");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "media", media));
    }

    // 🔹 Définir image principale - CORRIGÉ
    @PutMapping("/{id}/set-principal")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public ResponseEntity<?> setMediaPrincipal(@PathVariable Long id, Authentication authentication) {

        log.info("🔍 BACKEND MÉDIAS - Début setMediaPrincipal");
        log.info("🔍 BACKEND MÉDIAS - id: {}", id);
        log.info("🔍 BACKEND MÉDIAS - Authentication: {}", authentication != null ? authentication.getName() : "null");
        String username = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Agence agence = utilisateur.getAgence();
        if (agence == null) {
            throw new RuntimeException("Agence non trouvée pour l'utilisateur");
        }

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Média non trouvé"));

        if (!isAdmin(utilisateur) && !belongsToSameAgence(media, agence)) {
            throw new RuntimeException("Accès non autorisé");
        }

        if (media.getBien() != null) {
            List<Media> others = mediaRepository
                    .findByBienIdAndIsDeletedFalse(media.getBien().getId());

            others.forEach(m -> {
                m.setIsPrincipal(false);
                mediaRepository.save(m);
            });
        }

        media.setIsPrincipal(true);
        mediaRepository.save(media);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Image principale définie"));
    }

    // 🔹 Supprimer - CORRIGÉ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AGENCE', 'AGENT')")
    public ResponseEntity<?> supprimer(@PathVariable Long id, Authentication authentication) {

        // ✅ Même approche que BienController qui fonctionne
        String username = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Agence agence = utilisateur.getAgence();
        if (agence == null) {
            throw new RuntimeException("Agence non trouvée pour l'utilisateur");
        }

        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Média non trouvé"));

        if (!isAdmin(utilisateur) && !belongsToSameAgence(media, agence)) {
            throw new RuntimeException("Accès non autorisé");
        }

        mediaService.supprimerMedia(id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Média supprimé"));
    }

    // 🔥 MÉTHODES UTILITAIRES - CORRIGÉES

    private boolean isAdmin(Utilisateur utilisateur) {
        return utilisateur.getRole().toString().equals("ADMIN")
                || utilisateur.getRole().toString().equals("SUPER_ADMIN");
    }

    private boolean belongsToSameAgence(Media media, Agence agence) {
        return media.getBien() != null &&
                media.getBien().getAgence() != null &&
                media.getBien().getAgence().getId()
                        .equals(agence.getId());
    }
}
