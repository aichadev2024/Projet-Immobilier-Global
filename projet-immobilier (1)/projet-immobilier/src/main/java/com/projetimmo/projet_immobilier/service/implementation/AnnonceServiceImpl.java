package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.AnnonceRequest;
import com.projetimmo.projet_immobilier.dto.AnnonceResponse;
import com.projetimmo.projet_immobilier.entity.Annonce;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.repository.AnnonceRepository;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.MediaRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.AnnonceService;
import com.projetimmo.projet_immobilier.service.interfaces.NotificationService;
import com.projetimmo.projet_immobilier.entity.Media;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnonceServiceImpl implements AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final BienRepository bienRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MediaRepository mediaRepository;
    private final NotificationService notificationService;

    // ================= UTILISATEUR CONNECTÉ =================
    private Utilisateur getUtilisateurConnecte() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Utilisateur non authentifié");
        }

        return utilisateurRepository
                .findByNomUtilisateur(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }

    // ================= AGENCE CONNECTÉE =================
    private Agence getAgenceConnecte() {
        Utilisateur utilisateur = getUtilisateurConnecte();
        return utilisateur.getAgence();
    }

    // ================= MAPPING =================
    private List<String> getImages(Long idBien) {
        return mediaRepository.findByBienIdAndIsDeletedFalse(idBien)
                .stream()
                .map(Media::getUrl)
                .toList();
    }

    private AnnonceResponse mapToResponse(Annonce annonce) {
        Bien bien = annonce.getBien();
        Agence agence = bien.getAgence();
        
        return AnnonceResponse.builder()
                .id(annonce.getId())
                .typeAnnonce(annonce.getTypeAnnonce())
                .statut(annonce.getStatut())
                .titre(bien.getLibelle()) // Titre = libellé du bien
                .dateCreation(annonce.getCreatedAt() != null ? annonce.getCreatedAt().toString() : null)
                .idBien(bien.getId())
                .libelleBien(bien.getLibelle())
                .description(bien.getDescription())
                .prix(bien.getPrixCalculer())
                .superficie(null)
                .adresse(bien.getAdresse())
                .transactionType(bien.getTransactionType())
                .images(getImages(bien.getId()))
                .agenceNom(agence != null ? agence.getNom() : "Agence inconnue")
                .createdById(bien.getCreatedBy() != null ? bien.getCreatedBy().getId().toString() : null)
                .build();
    }

    // ================= CRÉER ANNONCE =================
    @Override
    @PreAuthorize("hasAnyRole('AGENCE', 'AGENT')")
    public AnnonceResponse creerAnnonce(AnnonceRequest request) {

        Utilisateur utilisateur = getUtilisateurConnecte();

        Bien bien = bienRepository.findById(
                Objects.requireNonNull(request.getIdBien(), "idBien obligatoire"))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        if (!bien.getAgence().getId().equals(utilisateur.getAgence().getId())) {
            throw new SecurityException("Ce bien ne vous appartient pas");
        }
        
        // Si c'est un agent, il ne peut créer d'annonce que pour ses propres biens
        if ("AGENT".equals(utilisateur.getRole().getNom())) {
            if (bien.getCreatedBy() == null || !bien.getCreatedBy().getId().equals(utilisateur.getId())) {
                throw new SecurityException("Action non autorisée : Vous ne pouvez créer des annonces que pour vos propres biens");
            }
        }

        Annonce annonce = Annonce.builder()
                .typeAnnonce(request.getTypeAnnonce())
                .statut(request.getStatut())
                .bien(bien)
                .build();

        Annonce saved = annonceRepository.save(Objects.requireNonNull(annonce));
        
        // Notifier tous les utilisateurs de la nouvelle annonce
        try {
            notificationService.notifierNouveauBien(bien);
        } catch (Exception e) {
            System.err.println("⚠️ Erreur notification nouvelle annonce: " + e.getMessage());
            // Ne pas bloquer la création si la notification échoue
        }

        return mapToResponse(saved);
    }

    // ================= MES ANNONCES =================
    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<AnnonceResponse> listerMesAnnonces() {

        Agence agence = getAgenceConnecte();

        return annonceRepository
                .findByBienAgenceIdAndIsDeletedFalse(agence.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ================= TOUTES LES ANNONCES =================
    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<AnnonceResponse> listerToutesAnnonces() {

        return annonceRepository
                .findByIsDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ================= GET PAR ID =================
    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public AnnonceResponse getAnnonceById(Long id) {

        Annonce annonce = annonceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Annonce introuvable"));
        return mapToResponse(annonce);
    }

    // ================= SUPPRESSION =================
    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public void supprimerAnnonce(Long id) {

        Utilisateur utilisateur = getUtilisateurConnecte();

        Annonce annonce = annonceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Annonce introuvable"));

        if (!annonce.getBien().getAgence().getId().equals(utilisateur.getAgence().getId())) {
            throw new SecurityException("Suppression non autorisée");
        }

        annonce.setIsDeleted(true);
        annonceRepository.save(annonce);
    }
}
