package com.projetimmo.projet_immobilier.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.projetimmo.projet_immobilier.security.RedisTokenBlacklistService;

@Service
@Slf4j
public class TokenBlacklistService {

    private final RedisTokenBlacklistService redisTokenBlacklistService;

    public TokenBlacklistService(RedisTokenBlacklistService redisTokenBlacklistService) {
        this.redisTokenBlacklistService = redisTokenBlacklistService;
    }

    /**
     * Ajoute un token à la blacklist via Redis
     */
    public void blacklistToken(String token) {
        try {
            redisTokenBlacklistService.blacklistToken(token);
            log.info("Token ajouté à la blacklist Redis: {}", token.substring(0, Math.min(10, token.length())) + "...");
        } catch (Exception e) {
            log.error("Erreur lors du blacklistage du token: {}", e.getMessage());
        }
    }

    /**
     * Vérifie si un token est blacklisté via Redis
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            return redisTokenBlacklistService.isTokenBlacklisted(token);
        } catch (Exception e) {
            log.error("Erreur lors de la vérification du token blacklisté: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Ajoute tous les tokens d'un utilisateur à la blacklist via Redis
     */
    public void blacklistAllUserTokens(String username) {
        try {
            redisTokenBlacklistService.blacklistAllUserTokens(username);
            log.info("Tous les tokens de l'utilisateur {} blacklistés via Redis", username);
        } catch (Exception e) {
            log.error("Erreur lors du blacklistage des tokens de l'utilisateur {}: {}", username, e.getMessage());
        }
    }

    /**
     * Nettoie les tokens expirés de la blacklist (géré automatiquement par Redis
     * TTL)
     */
    public void cleanupExpiredTokens() {
        try {
            redisTokenBlacklistService.cleanupExpiredTokens();
            log.debug("Nettoyage des tokens expirés - Géré automatiquement par Redis TTL");
        } catch (Exception e) {
            log.error("Erreur lors du nettoyage des tokens expirés: {}", e.getMessage());
        }
    }

    /**
     * Compte le nombre de tokens blacklistés via Redis
     */
    public long getBlacklistedTokenCount() {
        try {
            return redisTokenBlacklistService.getBlacklistedTokenCount();
        } catch (Exception e) {
            log.error("Erreur lors du comptage des tokens blacklistés: {}", e.getMessage());
            return 0;
        }
    }
}
