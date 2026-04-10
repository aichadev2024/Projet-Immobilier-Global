package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.service.interfaces.EmailService;
import com.projetimmo.projet_immobilier.service.BrevoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final BrevoService brevoService;

    @Autowired
    public EmailServiceImpl(BrevoService brevoService) {
        this.brevoService = brevoService;
    }

    @Override
    public void sendValidationEmail(String email, String token, String username) {
        try {
            log.info("📧 Envoi de l'email de validation à {} via Brevo API", email);
            brevoService.sendValidationEmail(email, token, username);
            log.info("✅ Email de validation envoyé avec succès à {}", email);
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email de validation à {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Impossible d'envoyer l'email de validation", e);
        }
    }
}
