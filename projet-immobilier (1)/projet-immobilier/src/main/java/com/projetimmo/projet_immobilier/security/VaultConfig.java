package com.projetimmo.projet_immobilier.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class VaultConfig {

    @Value("${jwt.secret:}")
    private String jwtSecretFromEnv;

    @Value("${vault.enabled:false}")
    private boolean vaultEnabled;

    @Bean
    public SecretKey jwtSecretKey() {
        String secret = getSecretFromSource();
        
        if (secret == null || secret.trim().isEmpty()) {
            // Générer une clé sécurisée par défaut
            secret = generateSecureSecret();
            System.out.println("🔐 Clé JWT générée automatiquement (256 bits)");
        }
        
        byte[] decodedKey = Base64.getDecoder().decode(secret);
        return new SecretKeySpec(decodedKey, "HmacSHA256");
    }

    @Bean
    public SecretManager secretManager(SecretKey jwtSecretKey) {
        return new SecretManager(jwtSecretKey);
    }

    private String getSecretFromSource() {
        // Priorité 1: Variable d'environnement
        if (jwtSecretFromEnv != null && !jwtSecretFromEnv.trim().isEmpty()) {
            System.out.println("🔑 Secret récupéré depuis l'environnement");
            return jwtSecretFromEnv;
        }
        
        // Priorité 2: Vault (si activé)
        if (vaultEnabled) {
            try {
                String vaultSecret = getSecretFromVault();
                if (vaultSecret != null) {
                    System.out.println("🏛️ Secret récupéré depuis Vault");
                    return vaultSecret;
                }
            } catch (Exception e) {
                System.err.println("⚠️ Vault non disponible: " + e.getMessage());
            }
        }
        
        // Priorité 3: Fichier sécurisé local
        try {
            String fileSecret = getSecretFromSecureFile();
            if (fileSecret != null) {
                System.out.println("📁 Secret récupéré depuis le fichier sécurisé");
                return fileSecret;
            }
        } catch (Exception e) {
            System.err.println("⚠️ Fichier de secrets non trouvé: " + e.getMessage());
        }
        
        return null;
    }

    private String getSecretFromVault() {
        // Implémentation simplifiée pour Vault
        // Dans un environnement de production, utiliser Spring Vault
        return null; // Non implémenté pour l'instant
    }

    private String getSecretFromSecureFile() {
        // Implémentation pour lire depuis un fichier sécurisé
        try {
            java.nio.file.Path secretFile = java.nio.file.Paths.get("secrets/jwt.secret");
            if (java.nio.file.Files.exists(secretFile)) {
                return new String(java.nio.file.Files.readAllBytes(secretFile)).trim();
            }
        } catch (Exception e) {
            // Ignorer les erreurs de lecture de fichier
        }
        return null;
    }

    private String generateSecureSecret() {
        byte[] key = new byte[32]; // 256 bits pour HmacSHA256
        new java.security.SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }
}
