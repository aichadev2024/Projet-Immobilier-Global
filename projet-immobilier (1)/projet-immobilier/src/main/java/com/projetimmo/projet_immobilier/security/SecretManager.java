package com.projetimmo.projet_immobilier.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;

@Service
public class SecretManager {

    private final SecretKey jwtSecretKey;

    @Value("${database.password:}")
    private String dbPassword;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    public SecretManager(SecretKey jwtSecretKey) {
        this.jwtSecretKey = jwtSecretKey;
    }

    public String getJwtSecret() {
        return Base64.getEncoder().encodeToString(jwtSecretKey.getEncoded());
    }

    public String getDatabasePassword() {
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            return dbPassword;
        }
        
        // Fallback: récupérer depuis fichier sécurisé ou environnement
        return getSecretFromEnvOrFile("DATABASE_PASSWORD", "secrets/db.password");
    }

    public String getBrevoApiKey() {
        if (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) {
            return brevoApiKey;
        }
        
        // Fallback: récupérer depuis fichier sécurisé ou environnement
        return getSecretFromEnvOrFile("BREVO_API_KEY", "secrets/brevo.key");
    }

    private String getSecretFromEnvOrFile(String envVar, String filePath) {
        // Essayer variable d'environnement
        String envValue = System.getenv(envVar);
        if (envValue != null && !envValue.trim().isEmpty()) {
            return envValue;
        }
        
        // Essayer fichier sécurisé
        try {
            java.nio.file.Path file = java.nio.file.Paths.get(filePath);
            if (java.nio.file.Files.exists(file)) {
                return new String(java.nio.file.Files.readAllBytes(file)).trim();
            }
        } catch (Exception e) {
            // Ignorer les erreurs
        }
        
        throw new SecurityException("Secret non trouvé: " + envVar + " ou " + filePath);
    }

    public void rotateSecrets() {
        // Rotation automatique des secrets (implémentation simplifiée)
        System.out.println("🔄 Rotation des secrets - Implémentation simplifiée");
        
        // Dans un environnement de production, implémenter la vraie rotation
        // avec Vault ou autre gestionnaire de secrets
    }

    public boolean validateSecrets() {
        try {
            // Valider que tous les secrets sont accessibles
            getJwtSecret();
            getDatabasePassword();
            getBrevoApiKey();
            return true;
        } catch (Exception e) {
            System.err.println("❌ Validation des secrets échouée: " + e.getMessage());
            return false;
        }
    }
}
