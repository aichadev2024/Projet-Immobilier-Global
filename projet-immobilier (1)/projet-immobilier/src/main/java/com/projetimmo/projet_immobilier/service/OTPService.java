package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.CodeOTP;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.enums.TypeCodeOTP;
import com.projetimmo.projet_immobilier.repository.CodeOTPRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final CodeOTPRepository codeOTPRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final SmsService smsService;
    private final BrevoService brevoService;

    @Transactional
    public String generateAndSendOTP(Utilisateur user, TypeCodeOTP type) {
        String code = String.format("%06d", new Random().nextInt(999999));
        String destinataire = (type == TypeCodeOTP.EMAIL) ? user.getEmail() : user.getTelephone();

        CodeOTP codeOTP = CodeOTP.builder()
                .code(code)
                .destinataire(destinataire)
                .utilisateur(user)
                .type(type)
                .dateGeneration(LocalDateTime.now())
                .dateExpiration(LocalDateTime.now().plusMinutes(10))
                .estUtilise(false)
                .build();

        codeOTPRepository.save(codeOTP);
        
        // 🛡️ LOGIQUE CONDITIONNELLE : Simulation pour UTILISATEUR, Email pour ADMIN/AGENCE
        boolean isSimpleUser = user.getRole() != null && "UTILISATEUR".equalsIgnoreCase(user.getRole().getNom());
        boolean isAdminOrAgence = user.getRole() != null && 
            ("ADMIN".equalsIgnoreCase(user.getRole().getNom()) || 
             "AGENCE".equalsIgnoreCase(user.getRole().getNom()) ||
             "AGENT".equalsIgnoreCase(user.getRole().getNom()));

        if (isSimpleUser) {
            // UTILISATEUR: Simulation dans les logs et DB uniquement
            log.info("📱 [SIMULATION OTP] Code pour UTILISATEUR {}: {}", user.getEmail(), code);
            log.info("📱 L'utilisateur doit consulter les logs ou la base de données pour récupérer le code OTP");
        } else if (isAdminOrAgence) {
            // ADMIN et AGENCE: Reçoivent toujours OTP par email
            log.info("📧 Envoi OTP par EMAIL pour ADMIN/AGENCE {}: {}", user.getEmail(), code);
            sendEmailOTP(user.getEmail(), user.getNomUtilisateur(), code);
        } else {
            // Fallback: autres rôles
            log.info("📱 [SIMULATION OTP] Code pour {}: {}", user.getEmail(), code);
        }

        log.info("🔐 OTP Processed for user: {} | Role: {} | Type: {}", 
            user.getEmail(), (user.getRole() != null ? user.getRole().getNom() : "NONE"), 
            isAdminOrAgence ? "EMAIL (forcé pour ADMIN/AGENCE)" : type);
        return code;
    }

    private void sendSmsOTP(String telephone, String code) {
        try {
            smsService.sendSms(telephone, "Votre code de validation ProjetImmo est: " + code + ". Il expire dans 10 minutes.");
        } catch (Exception e) {
            log.error("Failed to send SMS OTP: {}", e.getMessage());
            throw new RuntimeException("SMS Sending failed");
        }
    }

    private void sendEmailOTP(String email, String username, String code) {
        String subject = "Code de vérification - Projet Immobilier";
        String htmlContent = "<h1>Bonjour " + username + "</h1>" +
                "<p>Votre code de vérification est : <strong>" + code + "</strong></p>" +
                "<p>Ce code expire dans 10 minutes.</p>";
        brevoService.sendEmail(email, username, subject, htmlContent, "Votre code est : " + code);
    }

    public boolean validateOTP(Utilisateur user, String code) {
        CodeOTP codeOTP = codeOTPRepository
                .findFirstByUtilisateurAndEstUtiliseFalseOrderByDateGenerationDesc(user)
                .orElse(null);

        if (codeOTP == null || codeOTP.estExpire() || !codeOTP.getCode().equals(code)) {
            log.warn("🚨 Invalid or expired OTP for user: {}", user.getEmail());
            return false;
        }

        codeOTP.setEstUtilise(true);
        codeOTPRepository.save(codeOTP);
        return true;
    }

    @Transactional
    public void activateUserAccount(Utilisateur user) {
        user.setEnabled(true);
        
        // Pour les agences : vérifier si l'agence est déjà validée par un admin
        if (user.getRole() != null && user.getRole().getNom().equals("AGENCE")) {
            // Recharger l'utilisateur avec son agence pour éviter lazy loading
            Utilisateur userWithAgence = utilisateurRepository.findById(user.getId()).orElse(user);
            Agence agence = userWithAgence.getAgence();
            
            System.out.println("🔍 DEBUG activateUserAccount - Agence: " + (agence != null ? agence.getNom() : "null") + 
                " | Statut Agence: " + (agence != null ? agence.getStatut() : "N/A"));
            
            if (agence != null && agence.getStatut() == com.projetimmo.projet_immobilier.enums.StatutAgence.VERIFIEE) {
                // L'agence est validée, donc l'utilisateur devient aussi ACTIF
                user.setStatut(StatutUtilisateur.ACTIF);
                log.info("✅ Compte AGENCE {} activé - Agence déjà validée par admin", user.getEmail());
            } else if (user.getStatut() == StatutUtilisateur.ACTIF) {
                // Agence déjà validée par admin, ne pas changer le statut
                log.info("🏢 Compte AGENCE {} déjà validé (ACTIF), activation OTP sans changement de statut", user.getEmail());
            } else {
                // Première activation, agence en attente de validation admin
                user.setStatut(StatutUtilisateur.EN_ATTENTE_VALIDATION);
                log.info("🏢 Compte AGENCE {} activé mais en attente de validation administrative", user.getEmail());
            }
        } else {
            user.setStatut(StatutUtilisateur.ACTIF);
            log.info("✅ Compte {} (Role: {}) activé et actif", user.getEmail(), 
                (user.getRole() != null ? user.getRole().getNom() : "NONE"));
        }
        user.setUpdatedAt(LocalDateTime.now());
        utilisateurRepository.save(user);
    }

    public boolean canResendOTP(String destinataire) {
        return codeOTPRepository.findFirstByDestinataireOrderByDateGenerationDesc(destinataire)
                .map(otp -> otp.getDateGeneration().isBefore(LocalDateTime.now().minusMinutes(1)))
                .orElse(true);
    }
}
