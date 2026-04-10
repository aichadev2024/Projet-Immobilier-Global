package com.projetimmo.projet_immobilier.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisTokenBlacklistService {

    // Stockage en mémoire avec TTL manuel
    private final Map<String, LocalDateTime> blacklistedTokens = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> userBlacklistedTokens = new ConcurrentHashMap<>();
    
    private static final String BLACKLIST_PREFIX = "blacklist:token:";
    private static final String USER_TOKENS_PREFIX = "blacklist:user:";
    private static final long DEFAULT_EXPIRATION_HOURS = 24;

    @Value("${redis.enabled:false}")
    private boolean redisEnabled;

    /**
     * Ajoute un token à la blacklist (mémoire ou Redis)
     */
    public void blacklistToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return;
        }

        try {
            String key = BLACKLIST_PREFIX + token;
            LocalDateTime expirationTime = LocalDateTime.now().plusHours(DEFAULT_EXPIRATION_HOURS);
            
            if (redisEnabled) {
                // Utiliser Redis si disponible
                blacklistTokenInRedis(token, key, expirationTime);
            } else {
                // Utiliser la mémoire sinon
                blacklistedTokens.put(token, expirationTime);
                System.out.println("📝 Token blacklisté en mémoire: " + token.substring(0, Math.min(10, token.length())) + "...");
            }
            
        } catch (Exception e) {
            // Fallback vers mémoire en cas d'erreur Redis
            blacklistedTokens.put(token, LocalDateTime.now().plusHours(DEFAULT_EXPIRATION_HOURS));
            System.err.println("⚠️ Erreur Redis, fallback vers mémoire: " + e.getMessage());
        }
    }

    /**
     * Vérifie si un token est blacklisté
     */
    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            if (redisEnabled) {
                return isTokenBlacklistedInRedis(token);
            } else {
                return isTokenBlacklistedInMemory(token);
            }
        } catch (Exception e) {
            // Fallback vers mémoire en cas d'erreur Redis
            System.err.println("⚠️ Erreur vérification Redis, fallback vers mémoire: " + e.getMessage());
            return isTokenBlacklistedInMemory(token);
        }
    }

    /**
     * Ajoute tous les tokens d'un utilisateur à la blacklist
     */
    public void blacklistAllUserTokens(String username) {
        if (username == null || username.trim().isEmpty()) {
            return;
        }

        try {
            String userKey = USER_TOKENS_PREFIX + username;
            LocalDateTime expirationTime = LocalDateTime.now().plusHours(DEFAULT_EXPIRATION_HOURS);
            
            if (redisEnabled) {
                blacklistAllUserTokensInRedis(username, userKey, expirationTime);
            } else {
                userBlacklistedTokens.put(username, expirationTime);
                System.out.println("📝 Tous les tokens de l'utilisateur " + username + " blacklistés en mémoire");
            }
            
        } catch (Exception e) {
            // Fallback vers mémoire
            userBlacklistedTokens.put(username, LocalDateTime.now().plusHours(DEFAULT_EXPIRATION_HOURS));
            System.err.println("⚠️ Erreur Redis blacklist utilisateur, fallback vers mémoire: " + e.getMessage());
        }
    }

    /**
     * Vérifie si un utilisateur a ses tokens blacklistés
     */
    public boolean areUserTokensBlacklisted(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        try {
            if (redisEnabled) {
                return areUserTokensBlacklistedInRedis(username);
            } else {
                return areUserTokensBlacklistedInMemory(username);
            }
        } catch (Exception e) {
            // Fallback vers mémoire
            return areUserTokensBlacklistedInMemory(username);
        }
    }

    /**
     * Supprime un token de la blacklist
     */
    public void removeFromBlacklist(String token) {
        if (token == null || token.trim().isEmpty()) {
            return;
        }

        try {
            if (redisEnabled) {
                removeFromBlacklistInRedis(token);
            } else {
                blacklistedTokens.remove(token);
                System.out.println("📝 Token retiré de la blacklist mémoire: " + token.substring(0, Math.min(10, token.length())) + "...");
            }
        } catch (Exception e) {
            // Fallback vers mémoire
            blacklistedTokens.remove(token);
            System.err.println("⚠️ Erreur retrait Redis, fallback vers mémoire: " + e.getMessage());
        }
    }

    /**
     * Nettoie les tokens expirés
     */
    public void cleanupExpiredTokens() {
        if (!redisEnabled) {
            cleanupExpiredTokensInMemory();
        } else {
            System.out.println("🔄 Nettoyage des tokens expirés - Géré par Redis TTL");
        }
    }

    /**
     * Compte le nombre de tokens blacklistés
     */
    public long getBlacklistedTokenCount() {
        try {
            if (redisEnabled) {
                return getBlacklistedTokenCountInRedis();
            } else {
                cleanupExpiredTokensInMemory();
                return blacklistedTokens.size();
            }
        } catch (Exception e) {
            // Fallback vers mémoire
            cleanupExpiredTokensInMemory();
            return blacklistedTokens.size();
        }
    }

    /**
     * Vide complètement la blacklist
     */
    public void clearBlacklist() {
        try {
            if (redisEnabled) {
                clearBlacklistInRedis();
            } else {
                blacklistedTokens.clear();
                userBlacklistedTokens.clear();
                System.out.println("📝 Blacklist mémoire vidée complètement");
            }
        } catch (Exception e) {
            // Fallback vers mémoire
            blacklistedTokens.clear();
            userBlacklistedTokens.clear();
            System.err.println("⚠️ Erreur vidage Redis, fallback vers mémoire: " + e.getMessage());
        }
    }

    // ===== MÉTHODES MÉMOIRE =====

    private boolean isTokenBlacklistedInMemory(String token) {
        LocalDateTime expiration = blacklistedTokens.get(token);
        if (expiration == null) return false;
        
        if (expiration.isBefore(LocalDateTime.now())) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

    private boolean areUserTokensBlacklistedInMemory(String username) {
        LocalDateTime expiration = userBlacklistedTokens.get(username);
        if (expiration == null) return false;
        
        if (expiration.isBefore(LocalDateTime.now())) {
            userBlacklistedTokens.remove(username);
            return false;
        }
        return true;
    }

    private void cleanupExpiredTokensInMemory() {
        LocalDateTime now = LocalDateTime.now();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
        userBlacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }

    // ===== MÉTHODES REDIS (STUBS) =====

    private void blacklistTokenInRedis(String token, String key, LocalDateTime expirationTime) {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        System.out.println("🏛️ Token blacklisté dans Redis: " + token.substring(0, Math.min(10, token.length())) + "...");
    }

    private boolean isTokenBlacklistedInRedis(String token) {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        return false;
    }

    private void blacklistAllUserTokensInRedis(String username, String userKey, LocalDateTime expirationTime) {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        System.out.println("🏛️ Tous les tokens de l'utilisateur " + username + " blacklistés dans Redis");
    }

    private boolean areUserTokensBlacklistedInRedis(String username) {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        return false;
    }

    private void removeFromBlacklistInRedis(String token) {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        System.out.println("🏛️ Token retiré de la blacklist Redis: " + token.substring(0, Math.min(10, token.length())) + "...");
    }

    private long getBlacklistedTokenCountInRedis() {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        return 0;
    }

    private void clearBlacklistInRedis() {
        // Implémentation Redis à ajouter quand les dépendances seront disponibles
        System.out.println("🏛️ Blacklist Redis vidée complètement");
    }
}
