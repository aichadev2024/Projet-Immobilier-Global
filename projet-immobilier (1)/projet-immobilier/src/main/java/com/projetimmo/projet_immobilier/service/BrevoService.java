package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.config.BrevoConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Service
@Slf4j
public class BrevoService {

    private final RestTemplate restTemplate;
    private final BrevoConfig brevoConfig;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    @Autowired
    public BrevoService(BrevoConfig brevoConfig, RestTemplate restTemplate) {
        this.brevoConfig = brevoConfig;
        this.restTemplate = restTemplate;

        log.info("🔧 Brevo service initialisé avec l'API Key: {}",
                brevoConfig.getApiKey() != null
                        ? brevoConfig.getApiKey().substring(0, Math.min(10, brevoConfig.getApiKey().length())) + "..."
                        : "null");
    }

    private String getFrontendUrl() {
        return frontendUrl;
    }

    private String getBackendUrl() {
        return backendUrl;
    }

    public void sendEmail(String toEmail, String toName, String subject, String htmlContent, String textContent) {
        try {
            // Préparation des headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoConfig.getApiKey());

            // Construction du corps de la requête
            Map<String, Object> emailBody = Map.of(
                    "sender", Map.of(
                            "email", brevoConfig.getSenderEmail() != null ? brevoConfig.getSenderEmail() : "diarrassoubaa505@gmail.com",
                            "name", brevoConfig.getSenderName() != null ? brevoConfig.getSenderName() : "Projet Immobilier"),
                    "to", Collections.singletonList(Map.of(
                            "email", toEmail,
                            "name", toName)),
                    "subject", subject,
                    "htmlContent", htmlContent,
                    "textContent", textContent,
                    "replyTo", Map.of(
                            "email", "support@projetimmo.com"));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailBody, headers);

            // Envoi de la requête
            ResponseEntity<String> response = restTemplate.postForEntity(
                    brevoConfig.getUrl(),
                    request,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email envoyé avec succès à {} - Status: {} - Body: {}", toEmail, response.getStatusCode(), response.getBody());
            } else {
                log.error("❌ Erreur lors de l'envoi de l'email à {}: Status: {} - Body: {}", toEmail, response.getStatusCode(), response.getBody());
                throw new RuntimeException("Échec de l'envoi d'email: " + response.getStatusCode() + " - " + response.getBody());
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Impossible d'envoyer l'email via Brevo", e);
        }
    }

    public void sendValidationEmail(String email, String token, String username) {
        String subject = "Validation de votre compte - Projet Immobilier";

        String htmlContent = "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'><title>Validation de compte</title></head>" +
                "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;'>"
                +
                "<h1>Bienvenue " + username + " !</h1>" +
                "<p>Merci de vous être inscrit sur Projet Immobilier</p>" +
                "</div>" +
                "<div style='padding: 30px; background-color: #f9f9f9; border-radius: 10px; margin: 20px 0;'>" +
                "<h2 style='color: #333;'>Validation de votre compte</h2>" +
                "<p style='color: #666; line-height: 1.6;'>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>"
                +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + getBackendUrl() + "/auth/validate-account?token=" + token + "' " +
                "style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; " +
                "text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;'>Valider mon compte</a>" +
                "</div>" +
                "<div style='text-align: center; margin: 20px 0;'>" +
                "<p style='color: #666; font-size: 14px;'>Si le bouton ne fonctionne pas, copiez-collez ce lien :</p>" +
                "<p style='color: #007bff; font-size: 12px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;'>" +
                getBackendUrl() + "/auth/validate-account?token=" + token + "</p>" +
                "</div>" +
                "<p style='color: #999; font-size: 14px;'>Ce lien expirera dans 24 heures.</p>" +
                "</div>" +
                "<div style='border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;'>"
                +
                "<p>Cordialement,<br>L'équipe Projet Immobilier</p>" +
                "</div>" +
                "</body></html>";

        String textContent = "Bonjour " + username + ",\n\n" +
                "Veuillez cliquer sur le lien suivant pour valider votre compte :\n" +
                getBackendUrl() + "/auth/validate-account?token=" + token + "\n\n" +
                "Ce lien expirera dans 24 heures.\n\n" +
                "Cordialement,\n" +
                "L'équipe Projet Immobilier";

        sendEmail(email, username, subject, htmlContent, textContent);
    }

    public void sendAgentInvitationEmail(String email, String username, String tempPassword, String agenceNom) {
        String subject = "Invitation à rejoindre " + agenceNom + " - Projet Immobilier";
        String loginUrl = getFrontendUrl() + "/login";

        String htmlContent = "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'><title>Invitation Agent</title></head>" +
                "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;'>"
                +
                "<h1>Bienvenue dans l'équipe !</h1>" +
                "<p>Vous avez été invité à rejoindre <strong>" + agenceNom + "</strong></p>" +
                "</div>" +
                "<div style='padding: 30px; background-color: #f9f9f9; border-radius: 10px; margin: 20px 0;'>" +
                "<h2 style='color: #333;'>Vos identifiants de connexion</h2>" +
                "<p style='color: #666; line-height: 1.6;'>Votre compte a été créé avec les informations suivantes :</p>" +
                "<div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;'>" +
                "<p style='margin: 10px 0;'><strong>Email :</strong> " + email + "</p>" +
                "<p style='margin: 10px 0;'><strong>Mot de passe temporaire :</strong> <code style='background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 18px; color: #e74c3c;'>" + tempPassword + "</code></p>" +
                "</div>" +
                "<div style='background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;'>" +
                "<p style='color: #856404; margin: 0;'><strong>⚠️ Important :</strong> Vous devrez changer votre mot de passe lors de votre première connexion.</p>" +
                "</div>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + loginUrl + "' " +
                "style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; " +
                "text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;'>Se connecter</a>" +
                "</div>" +
                "</div>" +
                "<div style='border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;'>"
                +
                "<p>Cordialement,<br>L'équipe " + agenceNom + "</p>" +
                "</div>" +
                "</body></html>";

        String textContent = "Bienvenue dans l'équipe !\n\n" +
                "Vous avez été invité à rejoindre " + agenceNom + ".\n\n" +
                "Vos identifiants de connexion :\n" +
                "Email : " + email + "\n" +
                "Mot de passe temporaire : " + tempPassword + "\n\n" +
                "⚠️ Important : Vous devrez changer votre mot de passe lors de votre première connexion.\n\n" +
                "Connectez-vous sur : " + loginUrl + "\n\n" +
                "Cordialement,\n" +
                "L'équipe " + agenceNom;

        sendEmail(email, username, subject, htmlContent, textContent);
    }
}
