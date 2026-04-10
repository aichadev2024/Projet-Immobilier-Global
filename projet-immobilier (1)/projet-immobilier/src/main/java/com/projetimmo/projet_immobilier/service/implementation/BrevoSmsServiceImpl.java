package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.config.BrevoConfig;
import com.projetimmo.projet_immobilier.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class BrevoSmsServiceImpl implements SmsService {

    private final RestTemplate restTemplate;
    private final BrevoConfig brevoConfig;

    @Value("${brevo.sms.enabled:true}")
    private boolean brevoSmsEnabled;

    @Value("${brevo.sms.sender:ProjetImmo}")
    private String smsSender;

    @Autowired
    public BrevoSmsServiceImpl(BrevoConfig brevoConfig, RestTemplate restTemplate) {
        this.brevoConfig = brevoConfig;
        this.restTemplate = restTemplate;

        log.info("🔧 Brevo SMS service initialisé avec l'API Key: {}",
                brevoConfig.getApiKey() != null
                        ? brevoConfig.getApiKey().substring(0, Math.min(10, brevoConfig.getApiKey().length())) + "..."
                        : "null");
    }

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        if (!isServiceAvailable()) {
            log.warn("Service SMS Brevo non configuré ou désactivé - Mode simulation");
            return simulateSms(phoneNumber, message);
        }

        // Nettoyer le numéro de téléphone
        String cleanedPhoneNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");

        try {
            // Préparation des headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoConfig.getApiKey());

            // Construction du corps de la requête pour l'API SMS Brevo
            Map<String, Object> smsBody = Map.of(
                    "sender", smsSender,
                    "recipient", cleanedPhoneNumber,
                    "content", message,
                    "type", "transactional");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(smsBody, headers);

            // URL de l'API SMS Brevo
            String smsApiUrl = "https://api.brevo.com/v3/transactionalSMS/sms";

            // Envoi de la requête
            ResponseEntity<String> response = restTemplate.postForEntity(
                    smsApiUrl,
                    request,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ SMS envoyé avec succès via Brevo vers {} - Response: {}", cleanedPhoneNumber,
                        response.getStatusCode());
                return true;
            } else {
                log.error("❌ Erreur lors de l'envoi du SMS via Brevo vers {}: {}", cleanedPhoneNumber,
                        response.getStatusCode());
                return false;
            }

        } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
            log.error("❌ Erreur 400 Bad Request - Numéro invalide: {}. Format Brevo attendu: +22393915199",
                    cleanedPhoneNumber);
            return false;

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi du SMS via Brevo vers {}: {}", cleanedPhoneNumber, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean isServiceAvailable() {
        return brevoSmsEnabled &&
                brevoConfig.getApiKey() != null && !brevoConfig.getApiKey().trim().isEmpty() &&
                smsSender != null && !smsSender.trim().isEmpty();
    }

    private boolean simulateSms(String phoneNumber, String message) {
        log.info("SIMULATION SMS Brevo - Destinataire: {}, Message: {}", phoneNumber, message);

        // En mode développement, on simule toujours un succès
        return true;
    }
}
