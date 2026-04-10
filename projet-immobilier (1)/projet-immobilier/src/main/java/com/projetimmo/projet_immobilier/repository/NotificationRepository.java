package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUtilisateurIdOrderByDateCreationDesc(UUID utilisateurId);
    long countByUtilisateurIdAndIsReadFalse(UUID utilisateurId);
    List<Notification> findByUtilisateurIdAndIsReadFalse(UUID utilisateurId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.utilisateur.id = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") UUID utilisateurId);
}
