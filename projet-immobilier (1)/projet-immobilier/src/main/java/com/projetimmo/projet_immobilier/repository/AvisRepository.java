package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    List<Avis> findByAgenceIdOrderByDateCreationDesc(UUID agenceId);
    List<Avis> findByAgenceIdAndStatutOrderByDateCreationDesc(UUID agenceId, String statut);
    List<Avis> findByClientIdOrderByDateCreationDesc(UUID clientId);
}
