package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgenceRepository extends JpaRepository<Agence, UUID> {

    Optional<Agence> findByEmail(String email);

    Optional<Agence> findByTelephone(String telephone);

    Optional<Agence> findByNumeroLicence(String numeroLicence);

    List<Agence> findByStatut(StatutAgence statut);

    List<Agence> findByVille(String ville);

    @Query("SELECT a FROM Agence a WHERE a.isDeleted = false")
    List<Agence> findActiveAgences();

    @Query("SELECT a FROM Agence a WHERE a.isDeleted = false AND a.statut = :statut")
    List<Agence> findActiveAgencesByStatut(@Param("statut") StatutAgence statut);

    @Query("SELECT a FROM Agence a WHERE a.isDeleted = false AND (LOWER(a.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(a.ville) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Agence> searchAgences(@Param("searchTerm") String searchTerm);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);

    boolean existsByNumeroLicence(String numeroLicence);
    
    boolean existsByNinea(String ninea);
    
    List<Agence> findByIsDeletedFalse();

    Optional<Agence> findByUtilisateursNomUtilisateur(String nomUtilisateur);

    @Query("SELECT a FROM Agence a JOIN a.utilisateurs u WHERE u.id = :agentId AND a.isDeleted = false")
    Optional<Agence> findByAgentId(@Param("agentId") UUID agentId);
}
