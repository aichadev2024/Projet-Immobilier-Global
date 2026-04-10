package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BienRepository extends JpaRepository<Bien, Long> {

    // Méthodes de base
    List<Bien> findByIsDeletedFalse();
    List<Bien> findByStatutBien(StatutBien statutBien);
    List<Bien> findByTransactionTypeAndIsDeletedFalse(TransactionType transactionType);
    List<Bien> findByAgenceIdAndIsDeletedFalse(UUID agenceId);
    
    // Nouvelles méthodes pour la gestion des biens
    List<Bien> findByTypeBienLibelle(String categorie);
    
    // Recherche combinée
    @Query("SELECT b FROM Bien b WHERE b.statutBien = :statut AND b.typeBien.libelle = :categorie")
    List<Bien> findByStatutAndCategorie(@Param("statut") StatutBien statut, @Param("categorie") String categorie);
    
    // Recherche par prix
    @Query("SELECT b FROM Bien b WHERE b.prixCalculer BETWEEN :min AND :max AND b.statutBien = 'DISPONIBLE'")
    List<Bien> findByPrixRange(@Param("min") Double min, @Param("max") Double max);
    
    // Recherche avancée
    @Query("SELECT b FROM Bien b LEFT JOIN b.caracteristiques cb WHERE " +
           "(:categorie IS NULL OR b.typeBien.libelle = :categorie) AND " +
           "(:minPrix IS NULL OR b.prixCalculer >= :minPrix) AND " +
           "(:maxPrix IS NULL OR b.prixCalculer <= :maxPrix) AND " +
           "(:minSurface IS NULL OR cb.superficie >= :minSurface) AND " +
           "(:maxSurface IS NULL OR cb.superficie <= :maxSurface) AND " +
           "(:nbChambres IS NULL OR cb.nbChambres = :nbChambres) AND " +
           "b.statutBien = 'DISPONIBLE'")
    List<Bien> searchBiens(@Param("categorie") String categorie,
                           @Param("minPrix") Double minPrix,
                           @Param("maxPrix") Double maxPrix,
                           @Param("minSurface") Integer minSurface,
                           @Param("maxSurface") Integer maxSurface,
                           @Param("nbChambres") Integer nbChambres);
    
    // Statistiques
    @Query("SELECT COUNT(b) FROM Bien b WHERE b.agence.id = :agenceId AND b.statutBien = :statut")
    Long countByAgenceAndStatut(@Param("agenceId") UUID agenceId, @Param("statut") StatutBien statut);
    
    // Biens en attente de validation (pour admin)
    @Query("SELECT b FROM Bien b WHERE b.statutBien = 'EN_ATTENTE' ORDER BY b.createdAt DESC")
    List<Bien> findBiensEnAttenteValidation();
    
    // Derniers biens publiés
    @Query("SELECT b FROM Bien b WHERE b.statutBien = 'DISPONIBLE' ORDER BY b.createdAt DESC")
    List<Bien> findDerniersBiensPublies();
}