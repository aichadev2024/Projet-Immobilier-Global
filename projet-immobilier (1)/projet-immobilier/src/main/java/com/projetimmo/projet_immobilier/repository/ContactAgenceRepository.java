package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.ContactAgence;
import com.projetimmo.projet_immobilier.enums.StatutContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactAgenceRepository extends JpaRepository<ContactAgence, Long> {

    List<ContactAgence> findByAgenceIdOrderByDateContactDesc(UUID agenceId);

    List<ContactAgence> findByClientIdOrderByDateContactDesc(UUID clientId);

    List<ContactAgence> findByAgenceIdAndStatutOrderByDateContactDesc(UUID agenceId, StatutContact statut);

    Optional<ContactAgence> findByBienIdAndClientId(Long bienId, UUID clientId);

    @Query("SELECT COUNT(c) FROM ContactAgence c WHERE c.agence.id = :agenceId AND c.statut = :statut")
    long countByAgenceIdAndStatut(@Param("agenceId") UUID agenceId, @Param("statut") StatutContact statut);

    @Query("SELECT COUNT(c) FROM ContactAgence c WHERE c.dateContact >= :startDate")
    long countContactsSince(@Param("startDate") LocalDateTime startDate);
}
