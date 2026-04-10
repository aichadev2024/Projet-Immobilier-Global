package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Annonce;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findByIsDeletedFalse();
    
    List<Annonce> findByBienAgenceIdAndIsDeletedFalse(UUID agenceId);
    
    // Plus de @Query complexes - utilisation des méthodes standards Spring Data
}
