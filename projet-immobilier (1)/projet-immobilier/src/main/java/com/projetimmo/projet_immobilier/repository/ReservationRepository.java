package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Reservation;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutReservation;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Bien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByBienAndIsDeletedFalse(Bien bien);

    long countByUtilisateurAndIsDeletedFalse(Utilisateur utilisateur);

    List<Reservation> findByUtilisateurAndIsDeletedFalse(Utilisateur utilisateur);

    List<Reservation> findByBienAgenceAndIsDeletedFalse(Agence agence);

    long countByUtilisateurAndStatutAndIsDeletedFalse(
            Utilisateur utilisateur,
            StatutReservation statut);

    @Query("SELECT r FROM Reservation r " +
           "LEFT JOIN FETCH r.bien b " +
           "LEFT JOIN FETCH b.agence a " +
           "LEFT JOIN FETCH r.utilisateur u " +
           "WHERE r.id = :id")
    Optional<Reservation> findByIdWithRelations(@Param("id") Long id);
}
