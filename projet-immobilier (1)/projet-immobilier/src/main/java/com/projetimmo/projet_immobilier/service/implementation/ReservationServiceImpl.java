package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.ClientDashboardStatsDto;
import com.projetimmo.projet_immobilier.dto.ReservationRequest;
import com.projetimmo.projet_immobilier.dto.ReservationResponse;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.Reservation;
import com.projetimmo.projet_immobilier.enums.StatutReservation;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.ReservationRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.NotificationService;
import com.projetimmo.projet_immobilier.service.interfaces.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

        private final ReservationRepository reservationRepository;
        private final BienRepository bienRepository;
        private final UtilisateurRepository utilisateurRepository;
        private final NotificationService notificationService;

        // 🔹 Récupérer l'utilisateur connecté
        private Utilisateur getUtilisateurConnecte() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                return utilisateurRepository
                                .findByNomUtilisateur(auth.getName())
                                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
        }

        // 🔹 Mapper Entité → DTO
        private ReservationResponse mapToResponse(Reservation reservation) {
                return ReservationResponse.builder()
                                .id(reservation.getId())
                                .dateVisite(reservation.getDateVisite())
                                .statut(reservation.getStatut().name())
                                .dateReservation(reservation.getDateReservation())
                                .idBien(reservation.getBien().getId())
                                .libelleBien(reservation.getBien().getLibelle())
                                .adresseBien(reservation.getBien().getAdresse())
                                .idClient(reservation.getUtilisateur().getId())
                                .nomClient(reservation.getUtilisateur().getNom())
                                .prenomClient(reservation.getUtilisateur().getPrenom())
                                .build();
        }

        // 🔹 Créer une réservation
        @Override
        public ReservationResponse creerReservation(ReservationRequest request) {
                Utilisateur client = getUtilisateurConnecte();

                Bien bien = bienRepository.findById(Objects.requireNonNull(request.getIdBien()))
                                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

                // Use dateDebut if provided, otherwise fall back to dateVisite for backward
                // compatibility
                LocalDateTime dateVisite = request.getDateDebut() != null ? request.getDateDebut()
                                : request.getDateVisite();

                Reservation reservation = Reservation.builder()
                                .dateVisite(dateVisite)
                                .statut(StatutReservation.EN_ATTENTE) // Enum
                                .dateReservation(LocalDateTime.now())
                                .utilisateur(client)
                                .bien(bien)
                                .build();

                Reservation saved = reservationRepository.save(Objects.requireNonNull(reservation));

                // Notifier l'agence de la nouvelle réservation
                try {
                        notificationService.notifierAgenceNouvelleReservation(saved);
                } catch (Exception e) {
                        System.err.println("⚠️ Erreur notification nouvelle réservation: " + e.getMessage());
                        e.printStackTrace();
                        // Ne pas bloquer la création si la notification échoue
                }

                return mapToResponse(saved);
        }

        @Override
        @Transactional(readOnly = true)
        public List<ReservationResponse> listerReservationsParBien(Long idBien) {
                Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

                return reservationRepository.findByBienAndIsDeletedFalse(bien)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @PreAuthorize("hasRole('AGENCE')")
        @Transactional
        public void confirmerReservation(Long id) {
                Utilisateur utilisateurAgence = getUtilisateurConnecte();
                System.out.println(
                                "🔍 DEBUG confirmerReservation - User: " + utilisateurAgence.getEmail() + ", Agence: "
                                                + (utilisateurAgence.getAgence() != null
                                                                ? utilisateurAgence.getAgence().getNom()
                                                                : "null"));

                // Vérifier que l'agence est bien associée à l'utilisateur
                if (utilisateurAgence.getAgence() == null) {
                        throw new SecurityException("Vous n'êtes pas associé à une agence");
                }

                Reservation reservation = reservationRepository.findByIdWithRelations(Objects.requireNonNull(id))
                                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

                System.out.println("🔍 DEBUG confirmerReservation - Réservation trouvée: " + reservation.getId()
                                + ", Statut: " + reservation.getStatut());

                // Charger explicitement le bien et son agence pour éviter
                // LazyInitializationException
                Bien bien = reservation.getBien();
                if (bien == null) {
                        throw new IllegalStateException("Réservation sans bien associé");
                }

                System.out.println("🔍 DEBUG confirmerReservation - Bien: " + bien.getId() + ", Libellé: "
                                + bien.getLibelle());

                // Forcer le chargement des relations avec rechargement depuis la base si
                // nécessaire
                Agence agenceBien = bien.getAgence();
                if (agenceBien == null) {
                        System.out.println("⚠️ DEBUG - Agence null sur bien, tentative de rechargement...");
                        // Essayer de recharger le bien avec son agence
                        Bien bienWithAgence = bienRepository.findById(bien.getId()).orElse(null);
                        if (bienWithAgence != null) {
                                agenceBien = bienWithAgence.getAgence();
                                bien = bienWithAgence;
                                System.out.println("✅ DEBUG - Bien rechargé, agence: "
                                                + (agenceBien != null ? agenceBien.getNom() : "null"));
                        }
                }

                if (agenceBien == null) {
                        throw new SecurityException("Ce bien n'est associé à aucune agence");
                }

                System.out.println("🔍 DEBUG confirmerReservation - Agence du bien: " + agenceBien.getId() + ", Nom: "
                                + agenceBien.getNom());
                System.out.println("🔍 DEBUG confirmerReservation - Agence de l'utilisateur: "
                                + utilisateurAgence.getAgence().getId());

                // Vérifier que l'agence est propriétaire du bien
                if (!agenceBien.getId().equals(utilisateurAgence.getAgence().getId())) {
                        System.out.println("❌ DEBUG confirmerReservation - Non autorisé: agence bien ("
                                        + agenceBien.getId() + ") != agence user ("
                                        + utilisateurAgence.getAgence().getId() + ")");
                        throw new SecurityException(
                                        "Confirmation non autorisée - vous n'êtes pas propriétaire de ce bien");
                }

                // Vérifier que la réservation est en attente
                if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
                        System.out.println("❌ DEBUG confirmerReservation - Réservation déjà traitée: "
                                        + reservation.getStatut());
                        throw new IllegalStateException("Seules les réservations en attente peuvent être confirmées");
                }

                // Mettre à jour le statut de la réservation
                reservation.setStatut(StatutReservation.CONFIRMEE);
                reservationRepository.save(reservation);
                System.out.println("✅ DEBUG confirmerReservation - Statut réservation mis à jour: CONFIRMEE");

                // Notifier le client que sa réservation est confirmée
                try {
                        System.out.println("🔍 DEBUG confirmerReservation - Envoi notification...");
                        notificationService.notifierClientReservationConfirmee(reservation);
                        System.out.println("✅ DEBUG confirmerReservation - Notification envoyée");
                } catch (Exception e) {
                        System.err.println("⚠️ Erreur notification confirmation: " + e.getMessage());
                        e.printStackTrace();
                        // Ne pas bloquer la confirmation si la notification échoue
                }

                System.out.println("✅ Réservation confirmée avec succès - Bien " + bien.getId() + " marqué comme "
                                + bien.getStatutBien());
        }

        // 🔹 Annuler une réservation
        @Override
        @Transactional
        public void annulerReservation(Long id) {
                Utilisateur client = getUtilisateurConnecte();

                Reservation reservation = reservationRepository.findByIdWithRelations(Objects.requireNonNull(id))
                                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable"));

                if (!reservation.getUtilisateur().getId().equals(client.getId())) {
                        throw new SecurityException("Annulation non autorisée");
                }

                reservation.setIsDeleted(true);
                reservation.setDeletedAt(LocalDateTime.now());
                reservation.setStatut(StatutReservation.ANNULEE);
                reservationRepository.save(reservation);

                // Notifier le client que sa réservation est annulée
                try {
                        notificationService.notifierClientReservationAnnulee(reservation);
                } catch (Exception e) {
                        System.err.println("⚠️ Erreur notification annulation: " + e.getMessage());
                        // Ne pas bloquer l'annulation si la notification échoue
                }
        }

        @Override
        @Transactional(readOnly = true)
        public ClientDashboardStatsDto getDashboardStats() {

                Utilisateur client = getUtilisateurConnecte();

                long total = reservationRepository
                                .countByUtilisateurAndIsDeletedFalse(client);

                long enAttente = reservationRepository
                                .countByUtilisateurAndStatutAndIsDeletedFalse(
                                                client, StatutReservation.EN_ATTENTE);

                long confirmees = reservationRepository
                                .countByUtilisateurAndStatutAndIsDeletedFalse(
                                                client, StatutReservation.CONFIRMEE);

                long annulees = reservationRepository
                                .countByUtilisateurAndStatutAndIsDeletedFalse(
                                                client, StatutReservation.ANNULEE);

                return new ClientDashboardStatsDto(
                                total,
                                enAttente,
                                confirmees,
                                annulees);
        }

        @Override
        @Transactional(readOnly = true)
        public List<ReservationResponse> mesReservations() {

                Utilisateur client = getUtilisateurConnecte();

                return reservationRepository
                                .findByUtilisateurAndIsDeletedFalse(client)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        @PreAuthorize("hasRole('AGENCE')")
        public List<ReservationResponse> mesReservationsAgence() {
                Utilisateur utilisateurAgence = getUtilisateurConnecte();
                if (utilisateurAgence.getAgence() == null) {
                        throw new IllegalStateException("Utilisateur agence sans agence associée");
                }
                return reservationRepository
                                .findByBienAgenceAndIsDeletedFalse(utilisateurAgence.getAgence())
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }
}
