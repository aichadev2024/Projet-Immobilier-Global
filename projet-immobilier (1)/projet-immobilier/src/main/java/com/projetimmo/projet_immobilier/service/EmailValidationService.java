package com.projetimmo.projet_immobilier.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class EmailValidationService {

    // Domaines temporaires blacklistés
    private static final List<String> TEMPORARY_EMAIL_DOMAINS = Arrays.asList(
            "10minutemail.com", "tempmail.org", "guerrillamail.com", "mailinator.com",
            "yopmail.com", "maildrop.cc", "temp-mail.org", "throwaway.email",
            "mailnesia.com", "tempmail.de", "tempmail.net", "20minutemail.com",
            "fakemailgenerator.com", "emailfake.com", "tempmailaddress.com");

    // Mots de passe courants blacklistés
    private static final List<String> COMMON_PASSWORDS = Arrays.asList(
            "password", "123456", "123456789", "12345678", "12345", "1234567",
            "1234567890", "1234", "qwerty", "abc123", "password123", "admin",
            "letmein", "welcome", "monkey", "1234567890", "password1", "qwerty123");

    /**
     * Valide si l'email est professionnel et non temporaire
     */
    public boolean isProfessionalEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();

        // Vérifier si le domaine est dans la blacklist
        if (TEMPORARY_EMAIL_DOMAINS.contains(domain) ||
                TEMPORARY_EMAIL_DOMAINS.stream().anyMatch(domain::contains)) {
            log.warn("Tentative d'inscription avec email temporaire: {}", email);
            return false;
        }

        // Vérifier si c'est un email de fournisseur grand public
        if (isConsumerEmail(email)) {
            log.info("Inscription avec email grand public acceptée: {}", email);
            return true; // On accepte les emails grand public mais on log
        }

        return true;
    }

    /**
     * Vérifie si c'est un email de fournisseur grand public
     */
    private boolean isConsumerEmail(String email) {
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        return domain.startsWith("gmail.") || domain.startsWith("yahoo.") ||
                domain.startsWith("hotmail.") || domain.startsWith("outlook.") ||
                domain.startsWith("aol.") || domain.startsWith("icloud.");
    }

    /**
     * Valide la complexité du mot de passe
     */
    public PasswordValidationResult validatePasswordStrength(String password) {
        PasswordValidationResult result = new PasswordValidationResult();

        if (password == null || password.length() < 12) {
            result.setValid(false);
            result.addError("Le mot de passe doit contenir au moins 12 caractères");
            return result;
        }

        // Vérifier si c'est un mot de passe courant
        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            result.setValid(false);
            result.addError("Ce mot de passe est trop courant, veuillez en choisir un autre");
            return result;
        }

        // Vérifier la complexité
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(c -> !Character.isLetterOrDigit(c));

        if (!hasUpper) {
            result.addError("Le mot de passe doit contenir au moins une majuscule");
        }

        if (!hasLower) {
            result.addError("Le mot de passe doit contenir au moins une minuscule");
        }

        if (!hasDigit) {
            result.addError("Le mot de passe doit contenir au moins un chiffre");
        }

        if (!hasSpecial) {
            result.addError("Le mot de passe doit contenir au moins un caractère spécial");
        }

        // Vérifier les séquences
        if (hasSequentialPattern(password)) {
            result.addError("Le mot de passe ne doit pas contenir de séquences (123, abc, etc.)");
        }

        result.setValid(result.getErrors().isEmpty());
        return result;
    }

    /**
     * Détecte les séquences dans le mot de passe
     */
    private boolean hasSequentialPattern(String password) {
        String lowerPassword = password.toLowerCase();

        // Séquences numériques
        for (int i = 0; i < lowerPassword.length() - 2; i++) {
            char c1 = lowerPassword.charAt(i);
            char c2 = lowerPassword.charAt(i + 1);
            char c3 = lowerPassword.charAt(i + 2);

            if (Character.isDigit(c1) && Character.isDigit(c2) && Character.isDigit(c3)) {
                int n1 = c1 - '0';
                int n2 = c2 - '0';
                int n3 = c3 - '0';

                if ((n2 == n1 + 1 && n3 == n2 + 1) || (n2 == n1 - 1 && n3 == n2 - 1)) {
                    return true;
                }
            }
        }

        // Séquences alphabétiques
        for (int i = 0; i < lowerPassword.length() - 2; i++) {
            char c1 = lowerPassword.charAt(i);
            char c2 = lowerPassword.charAt(i + 1);
            char c3 = lowerPassword.charAt(i + 2);

            if (Character.isLetter(c1) && Character.isLetter(c2) && Character.isLetter(c3)) {
                if ((c2 == c1 + 1 && c3 == c2 + 1) || (c2 == c1 - 1 && c3 == c2 - 1)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Résultat de validation de mot de passe
     */
    public static class PasswordValidationResult {
        private boolean valid = true;
        private List<String> errors = new java.util.ArrayList<>();

        // Getters et setters
        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void addError(String error) {
            this.errors.add(error);
        }
    }
}
