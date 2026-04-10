package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.ValidationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ValidationTokenRepository extends JpaRepository<ValidationToken, Long> {
    
    Optional<ValidationToken> findByToken(String token);
    
    Optional<ValidationToken> findByEmail(String email);
    
    boolean existsByEmailAndUsedFalseAndExpiresAtAfter(String email, LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM ValidationToken vt WHERE vt.email = :email")
    void deleteByEmail(@Param("email") String email);
    
    @Query("SELECT vt FROM ValidationToken vt WHERE vt.used = false AND vt.expiresAt < :now")
    java.util.List<ValidationToken> findExpiredTokens(@Param("now") LocalDateTime now);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
