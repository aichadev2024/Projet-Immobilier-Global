package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.RefreshToken;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUtilisateurNomUtilisateurAndRevokedFalse(String nomUtilisateur);
    
    List<RefreshToken> findByUtilisateurAndRevokedFalse(Utilisateur utilisateur);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.utilisateur.id = :utilisateurId")
    void deleteByUtilisateurId(UUID utilisateurId);
}
