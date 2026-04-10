package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.DocumentBien;
import com.projetimmo.projet_immobilier.enums.StatutDocumentBien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentBienRepository extends JpaRepository<DocumentBien, UUID> {

    List<DocumentBien> findByBienId(Long bienId);

    List<DocumentBien> findByAgenceId(UUID agenceId);

    List<DocumentBien> findByBienIdAndStatut(Long bienId, StatutDocumentBien statut);

    @Query("SELECT d FROM DocumentBien d WHERE d.bien.id = :bienId AND d.type = :type")
    Optional<DocumentBien> findByBienIdAndType(@Param("bienId") Long bienId, @Param("type") String type);

    long countByBienIdAndStatut(Long bienId, StatutDocumentBien statut);

    @Query("SELECT COUNT(d) FROM DocumentBien d WHERE d.bien.id = :bienId AND d.statut = 'VERIFIE'")
    long countVerifiedByBienId(@Param("bienId") Long bienId);

    @Query("SELECT COUNT(d) > 0 FROM DocumentBien d WHERE d.bien.id = :bienId AND d.statut = 'EN_ATTENTE'")
    boolean hasPendingDocuments(@Param("bienId") Long bienId);

    @Query("SELECT d FROM DocumentBien d WHERE d.statut = 'EN_ATTENTE' ORDER BY d.dateSoumission DESC")
    List<DocumentBien> findAllPendingDocuments();
}
