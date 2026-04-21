package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.BienRequest;
import com.projetimmo.projet_immobilier.dto.BienResponse;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.TypeBien;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Annonce;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.StatutAnnonce;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import com.projetimmo.projet_immobilier.enums.TypeAnnonce;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.AnnonceRepository;
import com.projetimmo.projet_immobilier.repository.MediaRepository;
import com.projetimmo.projet_immobilier.repository.TypeBienRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.BienService;
import com.projetimmo.projet_immobilier.service.interfaces.NotificationService;
import com.projetimmo.projet_immobilier.entity.CaracteristiquesBien;
import com.projetimmo.projet_immobilier.entity.Media;

import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BienServiceImpl implements BienService {

    private final BienRepository bienRepository;
    private final TypeBienRepository typeBienRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MediaRepository mediaRepository;
    private final AnnonceRepository annonceRepository;
    private final NotificationService notificationService;

    // ===================== AGENCE CONNECTÉE =====================
    private Agence getAgenceConnecte() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        Utilisateur utilisateur = utilisateurRepository
                .findByNomUtilisateur(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Vérifier que c'est une agence ou un agent
        String role = utilisateur.getRole().getNom();
        if (!"AGENCE".equals(role) && !"AGENT".equals(role)) {
            throw new RuntimeException("Seul une agence ou un agent peut accéder aux biens");
        }

        // Vérifier que l'utilisateur a une agence associée
        if (utilisateur.getAgence() == null) {
            throw new RuntimeException("Vous n'êtes pas associé à une agence. Contactez votre administrateur.");
        }

        return utilisateur.getAgence();
    }

    // ===================== CALCUL COMMISSION =====================
    private BigDecimal calculerCommission(TypeBien typeBien, BigDecimal prix) {
        if (prix == null || prix.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Le prix doit être supérieur à 0");
        }

        switch (typeBien.getModeTarification()) {
            case FIXE:
                // Commission fixe (montant fixe en FCFA)
                return typeBien.getTarifBase();

            case POURCENTAGE:
                // Commission en pourcentage du prix (tarifBase = %)
                // Ex: tarifBase = 2.5, prix = 1000000 → commission = 25000
                return prix.multiply(typeBien.getTarifBase()).divide(new BigDecimal("100"), 2,
                        java.math.RoundingMode.HALF_UP);

            case GRATUIT:
                return BigDecimal.ZERO;

            default:
                throw new IllegalStateException("Mode de tarification inconnu: " + typeBien.getModeTarification());
        }
    }

    // ===================== MAPPING =====================
    private BienResponse mapToResponse(Bien bien) {
        return BienResponse.builder()
                .id(bien.getId())
                .libelle(bien.getLibelle())
                .description(bien.getDescription())
                .typeBien(bien.getTypeBien())
                .adresse(bien.getAdresse())
                .latitude(bien.getLatitude() != null ? bien.getLatitude().toString() : null)
                .longitude(bien.getLongitude() != null ? bien.getLongitude().toString() : null)
                .prix(bien.getPrix())
                .commission(bien.getCommission())
                .prixCalculer(bien.getPrixCalculer())
                .statutBien(bien.getStatutBien())
                .transactionType(bien.getTransactionType())
                .dateCreation(bien.getCreatedAt())
                .datePublication(null)
                .images(getImages(bien.getId()))
                .utilisateur(mapToAgenceInfo(bien.getAgence()))
                .createdById(bien.getCreatedBy() != null ? bien.getCreatedBy().getId().toString() : null)
                .createdByNom(bien.getCreatedBy() != null ? bien.getCreatedBy().getNom() : null)
                .createdByPrenom(bien.getCreatedBy() != null ? bien.getCreatedBy().getPrenom() : null)
                .commentaireVerification(bien.getCommentaireVerification())
                .caracteristiques(mapToCaracteristiquesInfo(bien.getCaracteristiques()))
                .superficie(bien.getSuperficie())
                .visitePayante(bien.getVisitePayante())
                .tarifVisite(bien.getTarifVisite())
                .build();
    }

    private BienResponse.CaracteristiquesInfo mapToCaracteristiquesInfo(CaracteristiquesBien carac) {
        if (carac == null)
            return null;

        return BienResponse.CaracteristiquesInfo.builder()
                .superficie(carac.getSuperficie())
                .nbChambres(carac.getNbChambres())
                .nbSallesDeBain(carac.getNbSallesBain())
                .nbParking(carac.getParking() ? 1 : 0)
                .meuble(carac.getMeuble())
                .balcon(carac.getBalcon())
                .jardin(carac.getJardin())
                .piscine(carac.getPiscine())
                .climatisation(false) // Non disponible dans l'entité
                .cuisineEquipee(carac.getCuisineEquipee())
                .wifi(carac.getWifi())
                .securite(carac.getGardien())
                .build();
    }

    // ===================== DÉTAILS COMPLETS AVEC MÉDIAS =====================
    @Override
    @Transactional(readOnly = true)
    public BienResponse getBienDetailsWithMedias(Long idBien) {
        Bien bien = bienRepository.findById(idBien)
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        // Force le chargement des caractéristiques
        if (bien.getCaracteristiques() != null) {
            bien.getCaracteristiques().getSuperficie();
        }

        return mapToResponse(bien);
    }

    private BienResponse.AgenceInfo mapToAgenceInfo(Agence agence) {
        if (agence == null)
            return null;

        return BienResponse.AgenceInfo.builder()
                .id(agence.getId().toString())
                .nom(agence.getNom())
                .email(agence.getEmail())
                .telephone(agence.getTelephone())
                .adresse(agence.getAdresse())
                .agence(BienResponse.AgenceDetails.builder()
                        .nom(agence.getNom())
                        .adresse(agence.getAdresse())
                        .telephone(agence.getTelephone())
                        .email(agence.getEmail())
                        .siteWeb(agence.getSiteWeb())
                        .visitePayante(null)  // Les champs visitePayante/tarifVisite sont maintenant dans Bien
                        .tarifVisite(null)
                        .build())
                .build();
    }

    // ===================== CRÉER =====================
    @Override
    @Transactional
    public BienResponse creerBien(BienRequest request) {

        Agence agence = getAgenceConnecte();

        System.out.println("DEBUG - idTypeBien reçu: " + request.getIdTypeBien());
        System.out.println("DEBUG - type de idTypeBien: "
                + (request.getIdTypeBien() != null ? request.getIdTypeBien().getClass().getSimpleName() : "null"));

        // Validation explicite du typeBien
        if (request.getIdTypeBien() == null) {
            throw new RuntimeException("Le type de bien est obligatoire");
        }

        TypeBien typeBien = typeBienRepository
                .findById(request.getIdTypeBien())
                .orElseThrow(() -> new RuntimeException("Type de bien introuvable"));

        System.out.println("DEBUG - TypeBien trouvé: " + typeBien);
        System.out.println("DEBUG - TypeBien ID: " + typeBien.getId());

        BigDecimal commission = calculerCommission(typeBien, request.getPrix());

        // Créer le bien en incluant typeBien directement.
        // La colonne `bien.type_bien_id` est NOT NULL, donc il ne faut pas sauvegarder
        // une entité sans typeBien (sinon SQL constraint error).
        boolean isAgenceVerifiee = agence.getStatut() == com.projetimmo.projet_immobilier.enums.StatutAgence.VERIFIEE;

        // Récupérer l'utilisateur connecté pour le champ createdBy
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur utilisateurConnecte = utilisateurRepository
                .findByNomUtilisateur(authentication.getName())
                .orElse(null);

        Bien bien = Bien.builder()
                .libelle(request.getLibelle())
                .description(request.getDescription())
                .adresse(request.getAdresse())
                .latitude(request.getLatitude() != null && !request.getLatitude().isBlank()
                        ? Double.valueOf(request.getLatitude())
                        : null)
                .longitude(request.getLongitude() != null && !request.getLongitude().isBlank()
                        ? Double.valueOf(request.getLongitude())
                        : null)
                .superficie(request.getSuperficie())
                .prix(request.getPrix())
                .commission(commission)
                .prixCalculer(request.getPrix().add(commission))
                .statutBien(StatutBien.DISPONIBLE) // Les biens sont directement disponibles
                .transactionType(request.getTransactionType())
                .visitePayante(request.getVisitePayante() != null ? request.getVisitePayante() : false)
                .tarifVisite(request.getVisitePayante() != null && request.getVisitePayante()
                        ? request.getTarifVisite()
                        : null)
                .agence(agence)
                .createdBy(utilisateurConnecte)
                .build();

        // Sécurité: s'assurer que la relation est bien présente avant persist.
        bien.setTypeBien(typeBien);

        Bien bienSauvegarde = bienRepository.save(bien);

        // Si l'agence est vérifiée, on crée l'annonce tout de suite
        if (isAgenceVerifiee) {
            TypeAnnonce typeAnnonce = bien.getTransactionType() == TransactionType.A_VENDRE
                    ? TypeAnnonce.VENTE
                    : TypeAnnonce.LOCATION;

            Annonce annonce = Annonce.builder()
                    .typeAnnonce(typeAnnonce)
                    .statut(StatutAnnonce.ACTIVE)
                    .bien(bienSauvegarde)
                    .isDeleted(false)
                    .build();

            annonceRepository.save(annonce);
            notificationService.notifierNouveauBien(bienSauvegarde);
            System.out.println("✅ Annonce automatique créée à la création pour le bien ID: " + bienSauvegarde.getId());
        }

        return mapToResponse(bienSauvegarde);
    }

    // ===================== MES BIENS =====================
    @Override
    @Transactional(readOnly = true)
    public List<BienResponse> listerMesBiens() {
        // Pour agences et agents : voir TOUS les biens de leur agence
        Agence agence = getAgenceConnecte();
        return bienRepository.findByAgenceIdAndIsDeletedFalse(agence.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BienResponse> listerBiens() {
        return bienRepository.findByIsDeletedFalse()
                .stream()
                .filter(bien -> !bien.getStatutBien().equals(StatutBien.LOUE) &&
                        !bien.getStatutBien().equals(StatutBien.VENDU) &&
                        !bien.getStatutBien().equals(StatutBien.INDISPONIBLE))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BienResponse> listerTousBiens() {
        // Pour admin - retourne tous les biens non supprimés, incluant LOUE et VENDU
        return bienRepository.findByIsDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private List<String> getImages(Long idBien) {
        return mediaRepository.findByBienIdAndIsDeletedFalse(idBien)
                .stream()
                .map(Media::getUrl)
                .toList();
    }

    @Override
    public BienResponse modifierBien(Long idBien, BienRequest request) {

        Agence agence = getAgenceConnecte();

        Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                .orElseThrow(() -> new RuntimeException("Bien introuvable"));

        // Vérifier les permissions
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur utilisateur = utilisateurRepository
                .findByNomUtilisateur(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String role = utilisateur.getRole().getNom();
        boolean isOwnerAgencies = bien.getAgence().getId().equals(agence.getId());

        if (!isOwnerAgencies) {
            throw new RuntimeException("Action non autorisée : Ce bien n'appartient pas à votre agence");
        }

        // Si c'est un agent, il ne peut modifier que ses propres biens
        if ("AGENT".equals(role)) {
            if (bien.getCreatedBy() == null || !bien.getCreatedBy().getId().equals(utilisateur.getId())) {
                throw new RuntimeException("Action non autorisée : Vous ne pouvez modifier que vos propres biens");
            }
        }
        // Le rôle 'AGENCE' a naturellement accès à tout ce qui appartient à l'agence
        // (déjà vérifié par isOwnerAgencies)

        // Mise à jour des champs
        bien.setLibelle(request.getLibelle());
        bien.setDescription(request.getDescription());
        bien.setAdresse(request.getAdresse());
        bien.setLatitude(request.getLatitude() != null && !request.getLatitude().isBlank()
                ? Double.valueOf(request.getLatitude())
                : null);
        bien.setLongitude(request.getLongitude() != null && !request.getLongitude().isBlank()
                ? Double.valueOf(request.getLongitude())
                : null);
        bien.setSuperficie(request.getSuperficie());
        bien.setTransactionType(request.getTransactionType());

        // Mise à jour du type de bien si nécessaire
        if (request.getIdTypeBien() != null && !request.getIdTypeBien().equals(bien.getTypeBien().getId())) {
            TypeBien typeBien = typeBienRepository
                    .findById(request.getIdTypeBien())
                    .orElseThrow(() -> new RuntimeException("Type de bien introuvable"));
            bien.setTypeBien(typeBien);
        }

        // Recalcul de la commission si le prix ou le type a changé
        if (request.getPrix() != null) {
            BigDecimal nouvelleCommission = calculerCommission(bien.getTypeBien(), request.getPrix());
            bien.setPrix(request.getPrix());
            bien.setCommission(nouvelleCommission);
            bien.setPrixCalculer(request.getPrix().add(nouvelleCommission));
        }

        // Mise à jour de la visite payante
        if (request.getVisitePayante() != null) {
            bien.setVisitePayante(request.getVisitePayante());
            bien.setTarifVisite(request.getVisitePayante() ? request.getTarifVisite() : null);
        }

        return mapToResponse(bienRepository.save(bien));
    }

    @Override
    public void supprimerBien(Long idBien) {

        Agence agence = getAgenceConnecte();

        Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                .orElseThrow(() -> new RuntimeException("Bien introuvable"));

        // Demande explicite: seul le rôle AGENCE peut supprimer
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur utilisateur = utilisateurRepository
                .findByNomUtilisateur(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!"AGENCE".equals(utilisateur.getRole().getNom())) {
            throw new RuntimeException(
                    "Action non autorisée : Seul le compte principal de l'agence peut supprimer un bien");
        }

        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new RuntimeException("Action non autorisée : Ce bien n'appartient pas à votre agence");
        }

        bien.setIsDeleted(true);
        bienRepository.save(bien);
    }

    @Override
    public List<BienResponse> getBiensByStatut(StatutBien statut) {
        return bienRepository.findByStatutBien(statut)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BienResponse> getBiensByTransactionType(TransactionType type) {
        return bienRepository.findByTransactionTypeAndIsDeletedFalse(type)
                .stream()
                .filter(bien -> !bien.getStatutBien().equals(StatutBien.LOUE) &&
                        !bien.getStatutBien().equals(StatutBien.VENDU) &&
                        !bien.getStatutBien().equals(StatutBien.INDISPONIBLE))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void validerBien(Long id) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        if (bien.getStatutBien() != StatutBien.EN_ATTENTE) {
            throw new RuntimeException("Seuls les biens en attente peuvent être validés");
        }

        // Valider le bien et le rendre disponible
        bien.setStatutBien(StatutBien.DISPONIBLE);
        bienRepository.save(bien);

        // Convertir TransactionType en TypeAnnonce
        TypeAnnonce typeAnnonce = bien.getTransactionType() == TransactionType.A_VENDRE
                ? TypeAnnonce.VENTE
                : TypeAnnonce.LOCATION;

        // Créer automatiquement une annonce active
        Annonce annonce = Annonce.builder()
                .typeAnnonce(typeAnnonce)
                .statut(StatutAnnonce.ACTIVE)
                .bien(bien)
                .isDeleted(false)
                .build();

        annonceRepository.save(annonce);

        // Notifier tous les utilisateurs du nouveau bien disponible

        System.out.println("✅ Bien approuvé par l'agence ID: " + bien.getId());
    }

    // ===================== VÉRIFICATION PAR L'AGENCE =====================

    @Override
    @Transactional(readOnly = true)
    public List<BienResponse> listerBiensEnAttenteValidation() {
        Agence agence = getAgenceConnecte();
        return bienRepository
                .findByAgenceIdAndStatutBienAndIsDeletedFalse(agence.getId(), StatutBien.EN_ATTENTE_VALIDATION)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void approuverBien(Long id, String commentaire) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        Agence agence = getAgenceConnecte();
        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new RuntimeException("Action non autorisée : Ce bien n'appartient pas à votre agence");
        }

        if (bien.getStatutBien() != StatutBien.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Seuls les biens en attente de validation peuvent être approuvés");
        }

        bien.setStatutBien(StatutBien.APPROUVE);
        if (commentaire != null && !commentaire.isBlank()) {
            bien.setCommentaireVerification(commentaire);
        }
        bienRepository.save(bien);

        TypeAnnonce typeAnnonce = bien.getTransactionType() == TransactionType.A_VENDRE
                ? TypeAnnonce.VENTE
                : TypeAnnonce.LOCATION;

        Annonce annonce = Annonce.builder()
                .typeAnnonce(typeAnnonce)
                .statut(StatutAnnonce.ACTIVE)
                .bien(bien)
                .isDeleted(false)
                .build();

        annonceRepository.save(annonce);

        if (bien.getCreatedBy() != null) {
            notificationService.createNotification(
                    UUID.fromString(bien.getCreatedBy().getId().toString()),
                    "Votre bien \"" + bien.getLibelle() + "\" a été approuvé",
                    "VERIFICATION",
                    bien.getId().toString());
        }

        System.out.println("✅ Bien approuvé par l'agence ID: " + bien.getId());
    }

    @Override
    @Transactional
    public void refuserBien(Long id) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        if (bien.getStatutBien() != StatutBien.EN_ATTENTE) {
            throw new RuntimeException("Seuls les biens en attente peuvent être refusés");
        }

        bien.setStatutBien(StatutBien.REFUSE);
        bienRepository.save(bien);

        System.out.println("❌ Bien refusé ID: " + bien.getId());
    }

    @Override
    @Transactional
    public void rejeterBien(Long id, String commentaire) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Bien non trouvé"));

        Agence agence = getAgenceConnecte();
        if (!bien.getAgence().getId().equals(agence.getId())) {
            throw new RuntimeException("Action non autorisée : Ce bien n'appartient pas à votre agence");
        }

        if (bien.getStatutBien() != StatutBien.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Seuls les biens en attente de validation peuvent être rejetés");
        }

        bien.setStatutBien(StatutBien.REJETE);
        bien.setCommentaireVerification(commentaire != null ? commentaire : "Aucun commentaire fourni");
        bienRepository.save(bien);

        if (bien.getCreatedBy() != null) {
            notificationService.createNotification(
                    UUID.fromString(bien.getCreatedBy().getId().toString()),
                    "Votre bien \"" + bien.getLibelle() + "\" a été rejeté. Motif: " + commentaire,
                    "VERIFICATION",
                    bien.getId().toString());
        }

        System.out.println("❌ Bien rejeté par l'agence ID: " + bien.getId() + " - Commentaire: " + commentaire);
    }
}