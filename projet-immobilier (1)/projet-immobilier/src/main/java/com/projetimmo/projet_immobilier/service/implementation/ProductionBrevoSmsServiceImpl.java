package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.config.BrevoConfig;
import com.projetimmo.projet_immobilier.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Primary
@Profile("production")
@Slf4j
public class ProductionBrevoSmsServiceImpl implements SmsService {

    private final RestTemplate restTemplate;
    private final BrevoConfig brevoConfig;

    @Value("${brevo.sms.sender:ProjetImmo}")
    private String smsSender;

    @Autowired
    public ProductionBrevoSmsServiceImpl(BrevoConfig brevoConfig, RestTemplate restTemplate) {
        this.brevoConfig = brevoConfig;
        this.restTemplate = restTemplate;

        log.info("🔧 Production Brevo SMS service initialisé");
    }

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        try {
            // Nettoyer le numéro de téléphone
            String cleanedPhoneNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");

            log.info("📱 Envoi SMS Brevo vers: {} | Message: {}", cleanedPhoneNumber, message);

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
                log.info("✅ SMS envoyé avec succès via Brevo | Destinataire: {} | Response: {}",
                        cleanedPhoneNumber, response.getStatusCode());
                return true;
            } else {
                log.error("❌ Erreur lors de l'envoi SMS Brevo vers {}: {}",
                        cleanedPhoneNumber, response.getStatusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi SMS Brevo vers {}: {}",
                    phoneNumber, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean isServiceAvailable() {
        try {
            // Vérifier si les credentials Brevo sont configurés
            if (brevoConfig.getApiKey() == null || brevoConfig.getApiKey().trim().isEmpty() ||
                    brevoConfig.getApiKey().contains("placeholder")) {
                log.warn("⚠️ Service SMS Brevo non configuré - API key manquante");
                return false;
            }

            log.info("📱 Service SMS Brevo disponible: true");
            return true;

        } catch (Exception e) {
            log.error("❌ Erreur lors de la vérification du service SMS Brevo: {}", e.getMessage());
            return false;
        }
    }
}
