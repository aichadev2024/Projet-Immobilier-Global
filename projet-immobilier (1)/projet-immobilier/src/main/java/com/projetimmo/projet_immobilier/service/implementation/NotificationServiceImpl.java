package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.NotificationResponse;
import com.projetimmo.projet_immobilier.entity.*;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import com.projetimmo.projet_immobilier.repository.NotificationRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID utilisateurId) {
        return notificationRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public void markAsRead(Long id, UUID utilisateurId) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        if (!notif.getUtilisateur().getId().equals(utilisateurId)) {
            throw new RuntimeException("Accès refusé");
        }
        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID utilisateurId) {
        int updated = notificationRepository.markAllAsReadForUser(utilisateurId);
        System.out.println("✅ " + updated + " notifications marquées comme lues pour l'utilisateur " + utilisateurId);
    }

    @Override
    @Transactional
    public void createNotification(UUID utilisateurId, String titre, String message, String type) {
        Utilisateur user = utilisateurRepository.findById(utilisateurId).orElseThrow();
        Notification notif = Notification.builder()
                .utilisateur(user).titre(titre).message(message).type(type).isRead(false).build();
        notificationRepository.save(notif);
    }

    @Override
    @Transactional
    public void notifierAgenceNouvelleReservation(Reservation reservation) {
        Bien bien = reservation.getBien();
        Agence agence = bien.getAgence();
        Utilisateur client = reservation.getUtilisateur();

        // Vérifier que l'agence existe et a des utilisateurs
        if (agence == null || agence.getUtilisateurs() == null || agence.getUtilisateurs().isEmpty()) {
            System.err.println("⚠️ Agence sans utilisateurs - notification ignorée");
            return;
        }

        // Notifier le premier utilisateur de l'agence (le manager)
        Utilisateur managerAgence = agence.getUtilisateurs().get(0);

        String titre = "Nouvelle réservation reçue";
        String message = String.format(
            "%s %s a réservé le bien \"%s\" pour le %s.",
            client.getPrenom(),
            client.getNom(),
            bien.getLibelle(),
            reservation.getDateVisite().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        );

        Notification notif = Notification.builder()
                .utilisateur(managerAgence)
                .titre(titre)
                .message(message)
                .type("RESERVATION")
                .lien("/agence/rendez-vous")
                .entityId(reservation.getId())
                .isRead(false)
                .build();
        
        notificationRepository.save(notif);
    }

    @Override
    @Transactional
    public void notifierClientReservationConfirmee(Reservation reservation) {
        try {
            Utilisateur client = reservation.getUtilisateur();
            Bien bien = reservation.getBien();

            if (client == null || bien == null) {
                System.err.println("⚠️ Données manquantes pour la notification de confirmation");
                return;
            }

            String statutBienStr = "réservé";
            if (bien.getStatutBien() != null) {
                statutBienStr = bien.getStatutBien() == StatutBien.LOUE ? "loué" : "vendu";
            }

            String titre = "Réservation confirmée";
            String message = String.format(
                "Votre réservation pour \"%s\" a été confirmée. Le bien est maintenant marqué comme %s.",
                bien.getLibelle() != null ? bien.getLibelle() : "le bien",
                statutBienStr
            );

            Notification notif = Notification.builder()
                    .utilisateur(client)
                    .titre(titre)
                    .message(message)
                    .type("CONFIRMATION")
                    .lien("/user/mes-reservations")
                    .entityId(reservation.getId())
                    .isRead(false)
                    .build();
            
            notificationRepository.save(notif);
        } catch (Exception e) {
            System.err.println("⚠️ Erreur dans notifierClientReservationConfirmee: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional
    public void notifierClientReservationAnnulee(Reservation reservation) {
        Utilisateur client = reservation.getUtilisateur();
        Bien bien = reservation.getBien();

        String titre = "Réservation annulée";
        String message = String.format(
            "Votre réservation pour \"%s\" a été annulée.",
            bien.getLibelle()
        );

        Notification notif = Notification.builder()
                .utilisateur(client)
                .titre(titre)
                .message(message)
                .type("ANNULATION")
                .lien("/user/mes-reservations")
                .entityId(reservation.getId())
                .isRead(false)
                .build();
        
        notificationRepository.save(notif);
    }

    @Override
    @Transactional
    public void notifierNouveauBien(Bien bien) {
        String titre = "Nouveau bien disponible";
        String message = String.format(
            "Un nouveau bien \"%s\" à %s est maintenant disponible en %s.",
            bien.getLibelle(),
            bien.getAdresse(),
            bien.getTransactionType() == TransactionType.A_LOUER ? "location" : "vente"
        );

        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        
        for (Utilisateur utilisateur : utilisateurs) {
            // Vérifier que l'utilisateur a un rôle et que c'est un UTILISATEUR
            if (utilisateur.getRole() != null && "UTILISATEUR".equals(utilisateur.getRole().getNom())) {
                Notification notif = Notification.builder()
                        .utilisateur(utilisateur)
                        .titre(titre)
                        .message(message)
                        .type("NOUVEAU_BIEN")
                        .lien("/annonces/" + bien.getId())
                        .entityId(bien.getId())
                        .isRead(false)
                        .build();
                
                notificationRepository.save(notif);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getNombreNotificationsNonLues(UUID utilisateurId) {
        return notificationRepository.countByUtilisateurIdAndIsReadFalse(utilisateurId);
    }

    private NotificationResponse mapToResponse(Notification n) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        String dateStr = "";
        try {
            if (n.getDateCreation() != null) {
                dateStr = n.getDateCreation().format(formatter);
            } else {
                // Fallback si dateCreation est null
                dateStr = LocalDateTime.now().format(formatter);
                System.out.println("⚠️ DateCreation null pour notification " + n.getId() + ", utilisation de la date actuelle");
            }
        } catch (Exception e) {
            dateStr = "Date inconnue";
            System.err.println("❌ Erreur formatage date notification " + n.getId() + ": " + e.getMessage());
        }
        
        return NotificationResponse.builder()
                .id(n.getId())
                .titre(n.getTitre() != null ? n.getTitre() : "")
                .message(n.getMessage() != null ? n.getMessage() : "")
                .type(n.getType() != null ? n.getType() : "INFO")
                .isRead(n.getIsRead() != null ? n.getIsRead() : false)
                .lien(n.getLien())
                .entityId(n.getEntityId())
                .date(dateStr)
                .build();
    }
}
