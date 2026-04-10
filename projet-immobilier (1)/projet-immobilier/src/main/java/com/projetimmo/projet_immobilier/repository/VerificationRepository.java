package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Verification;
import com.projetimmo.projet_immobilier.enums.StatutVerification;
import com.projetimmo.projet_immobilier.enums.TypeVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, UUID> {

    List<Verification> findByAgenceId(UUID idAgence);

    List<Verification> findByUtilisateurId(UUID idUtilisateur);

    List<Verification> findByStatut(StatutVerification statut);

    List<Verification> findByType(TypeVerification type);

    @Query("SELECT v FROM Verification v WHERE v.agence.id = :idAgence AND v.statut = :statut")
    List<Verification> findByAgenceIdAndStatut(@Param("idAgence") UUID idAgence,
            @Param("statut") StatutVerification statut);

    @Query("SELECT v FROM Verification v WHERE v.utilisateur.id = :idUtilisateur AND v.statut = :statut")
    List<Verification> findByUtilisateurIdAndStatut(@Param("idUtilisateur") UUID idUtilisateur,
            @Param("statut") StatutVerification statut);

    @Query("SELECT v FROM Verification v WHERE v.statut = 'EN_ATTENTE' ORDER BY v.dateDemande ASC")
    List<Verification> findVerificationsEnAttente();

    @Query("SELECT COUNT(v) FROM Verification v WHERE v.agence.id = :idAgence AND v.statut = 'APPROUVEE'")
    long countVerificationsApprouveesByAgence(@Param("idAgence") UUID idAgence);

    @Query("SELECT COUNT(v) FROM Verification v WHERE v.utilisateur.id = :idUtilisateur AND v.statut = 'APPROUVEE'")
    long countVerificationsApprouveesByUtilisateur(@Param("idUtilisateur") UUID idUtilisateur);

    @Query("SELECT v FROM Verification v WHERE (v.agence.id = :idAgence OR v.utilisateur.id = :idAgence) AND v.type = :type")
    List<Verification> findByEntiteIdAndType(@Param("idAgence") UUID idAgence, @Param("type") TypeVerification type);

    boolean existsByAgenceIdAndTypeAndStatut(UUID idAgence, TypeVerification type, StatutVerification statut);

    boolean existsByUtilisateurIdAndTypeAndStatut(UUID idUtilisateur, TypeVerification type, StatutVerification statut);
}
