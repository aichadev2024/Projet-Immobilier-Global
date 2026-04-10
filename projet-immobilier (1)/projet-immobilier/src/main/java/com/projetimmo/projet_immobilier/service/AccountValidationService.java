package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.entity.ValidationToken;
import com.projetimmo.projet_immobilier.repository.ValidationTokenRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountValidationService {

    private final UtilisateurRepository utilisateurRepository;
    private final ValidationTokenRepository tokenRepository;
    private final EmailService emailService;

    /**
     * Crée et envoie un token de validation par email
     */
    @Transactional
    public void createAndSendValidationToken(String email, String username) {
        // Supprimer les anciens tokens
        tokenRepository.deleteByEmail(email);

        // Créer le nouveau token
        String tokenValue = UUID.randomUUID().toString();
        ValidationToken token = ValidationToken.builder()
                .token(tokenValue)
                .email(email)
                .username(username)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();

        tokenRepository.save(Objects.requireNonNull(token));

        // Envoyer l'email
        try {
            emailService.sendValidationEmail(Objects.requireNonNull(email), Objects.requireNonNull(tokenValue),
                    Objects.requireNonNull(username));
            log.info("Email de validation envoyé pour: {}", email);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de validation pour {}: {}", email, e.getMessage());
            // On ne bloque pas l'inscription si l'email échoue
        }
    }

    /**
     * Valide le compte avec le token reçu
     */
    public boolean validateAccount(String token) {
        ValidationToken validationToken = tokenRepository.findByToken(token)
                .orElse(null);

        if (validationToken == null) {
            log.warn("Tentative de validation avec token inexistant: {}", token);
            return false;
        }

        if (validationToken.isUsed()) {
            log.warn("Tentative de validation avec token déjà utilisé: {}", token);
            return false;
        }

        if (validationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Tentative de validation avec token expiré: {}", token);
            tokenRepository.delete(validationToken);
            return false;
        }

        // Activer le compte utilisateur
        utilisateurRepository.findByEmail(validationToken.getEmail())
                .ifPresent(user -> {
                    user.setStatut(com.projetimmo.projet_immobilier.enums.StatutUtilisateur.ACTIF);
                    utilisateurRepository.save(user);
                    log.info("Compte activé pour l'utilisateur: {}", user.getNomUtilisateur());
                });

        // Marquer le token comme utilisé
        validationToken.setUsed(true);
        tokenRepository.save(validationToken);

        return true;
    }

    /**
     * Vérifie si un compte est en attente de validation
     */
    public boolean isPendingValidation(String email) {
        return tokenRepository.existsByEmailAndUsedFalseAndExpiresAtAfter(email, LocalDateTime.now());
    }

    /**
     * Renvoie un token de validation
     */
    public void resendValidationToken(String email) {
        if (!isPendingValidation(email)) {
            throw new RuntimeException("Aucune validation en attente pour cet email");
        }

        utilisateurRepository.findByEmail(email).ifPresent(user -> {
            createAndSendValidationToken(email, user.getNomUtilisateur());
            log.info("Token de validation renvoyé pour: {}", email);
        });
    }
}
