package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.MediaRequest;
import com.projetimmo.projet_immobilier.dto.MediaResponse;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.Media;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.MediaRepository;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import com.projetimmo.projet_immobilier.service.interfaces.MediaService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.projetimmo.projet_immobilier.enums.TypeMedia;

@Service
@RequiredArgsConstructor
@Transactional
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final BienRepository bienRepository;
    private final AgenceRepository agenceRepository;

    private final String uploadDir = "uploads/biens";

    private Agence getAgenceConnecte() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return agenceRepository
                .findByUtilisateursNomUtilisateur(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Agence introuvable pour l'utilisateur"));
    }

    @Override
    public MediaResponse mapToResponse(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .typeMedia(media.getTypeMedia())
                .url(media.getUrl())
                .nomFichier(media.getNomFichier())
                .bien(MediaResponse.BienInfo.builder()
                        .id(media.getBien().getId())
                        .libelle(media.getBien().getLibelle())
                        .build())
                .build();
    }

    // ================= AJOUT MEDIA =================
    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public MediaResponse ajouterMedia(MediaRequest request) {

        Agence agence = getAgenceConnecte();

        Bien bien = bienRepository.findById(Objects.requireNonNull(request.getIdBien()))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new SecurityException("Ce bien n'appartient pas à votre agence");
        }

        Media media = Media.builder()
                .typeMedia(request.getTypeMedia())
                .url(request.getUrl())
                .bien(bien)
                .build();

        return mapToResponse(mediaRepository.save(Objects.requireNonNull(media)));
    }

    // ================= UPLOAD MEDIA =================
    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public MediaResponse uploadMedia(Long idBien, String type, MultipartFile file) throws IOException {
        Agence agence = getAgenceConnecte();

        Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new SecurityException("Ce bien n'appartient pas à votre agence");
        }

        // Get file name and extension
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Generate a unique filename
        String newFilename = UUID.randomUUID().toString() + extension;

        // Ensure the upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save the file locally
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Generate the URL to access the file
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/biens/")
                .path(newFilename)
                .toUriString();

        // Save media record to the DB
        Media media = Media.builder()
                .typeMedia(TypeMedia.valueOf(type.toUpperCase()))
                .url(fileDownloadUri)
                .bien(bien)
                .build();

        return mapToResponse(mediaRepository.save(Objects.requireNonNull(media)));
    }

    // ================= MEDIA PAR BIEN =================
    @Override
    @Transactional(readOnly = true)
    public List<MediaResponse> listerMediaParBien(Long idBien) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        return mediaRepository.findByBienAndIsDeletedFalse(bien)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ================= SUPPRESSION =================
    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public void supprimerMedia(Long id) {

        Agence agence = getAgenceConnecte();

        Media media = mediaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Media introuvable"));

        if (!media.getBien().getAgence().getId().equals(agence.getId())) {
            throw new SecurityException("Suppression non autorisée");
        }

        media.setIsDeleted(true);
        mediaRepository.save(media);
    }

    // ================= UPLOAD MULTIPLE =================
    @Override
    @Transactional
    public List<MediaResponse> uploadMultipleMedias(Long bienId, MultipartFile[] files) throws IOException {
        Bien bien = bienRepository.findById(Objects.requireNonNull(bienId))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        Agence agence = getAgenceConnecte();

        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new SecurityException("Ce bien n'appartient pas à votre agence");
        }

        List<MediaResponse> uploadedMedias = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                try {
                    // Déterminer le type de média
                    String typeMedia = determineMediaType(file);

                    // Upload du fichier
                    MediaResponse mediaResponse = uploadMediaSingleFile(file, bien, typeMedia);
                    uploadedMedias.add(mediaResponse);
                } catch (Exception e) {
                    // Continuer avec les autres fichiers même si un échoue
                    System.err.println(
                            "Erreur lors de l'upload du fichier " + file.getOriginalFilename() + ": " + e.getMessage());
                }
            }
        }

        return uploadedMedias;
    }

    private String determineMediaType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return TypeMedia.DOCUMENT.toString();
        }

        if (contentType.startsWith("image/")) {
            return TypeMedia.IMAGE.toString();
        } else if (contentType.startsWith("video/")) {
            return TypeMedia.VIDEO.toString();
        } else {
            return TypeMedia.DOCUMENT.toString();
        }
    }

    private MediaResponse uploadMediaSingleFile(MultipartFile file, Bien bien, String typeMedia) throws IOException {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Generate a unique filename
        String newFilename = UUID.randomUUID().toString() + extension;

        // Ensure the upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save the file locally
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Generate the URL to access the file
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/biens/")
                .path(newFilename)
                .toUriString();

        // Save media record to the DB
        Media media = Media.builder()
                .nomFichier(originalFilename)
                .url(fileDownloadUri)
                .typeMedia(TypeMedia.valueOf(typeMedia.toUpperCase()))
                .tailleFichier(file.getSize())
                .bien(bien)
                .build();

        return mapToResponse(mediaRepository.save(Objects.requireNonNull(media)));
    }
}
