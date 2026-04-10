package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {

    Optional<BlacklistedToken> findByToken(String token);

    boolean existsByToken(String token);

    @Query("SELECT bt FROM BlacklistedToken bt WHERE bt.token = :token AND bt.expiresAt > :now")
    Optional<BlacklistedToken> findValidBlacklistedToken(@Param("token") String token, @Param("now") LocalDateTime now);

    @Query("SELECT bt FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
    List<BlacklistedToken> findExpiredTokens(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(bt) FROM BlacklistedToken bt WHERE bt.username = :username AND bt.expiresAt > :now")
    long countActiveTokensByUsername(@Param("username") String username, @Param("now") LocalDateTime now);

    void deleteByUsername(String username);
}
