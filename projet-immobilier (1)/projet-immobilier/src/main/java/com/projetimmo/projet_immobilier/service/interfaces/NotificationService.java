package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.NotificationResponse;
import com.projetimmo.projet_immobilier.entity.Reservation;
import com.projetimmo.projet_immobilier.entity.Bien;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(UUID utilisateurId);
    void markAsRead(Long id, UUID utilisateurId);
    void markAllAsRead(UUID utilisateurId);
    void createNotification(UUID utilisateurId, String titre, String message, String type);
    
    // Notifications spécifiques au workflow réservation
    void notifierAgenceNouvelleReservation(Reservation reservation);
    void notifierClientReservationConfirmee(Reservation reservation);
    void notifierClientReservationAnnulee(Reservation reservation);
    
    // Notification nouveau bien
    void notifierNouveauBien(Bien bien);
    
    // Compteur de notifications non lues
    long getNombreNotificationsNonLues(UUID utilisateurId);
}
