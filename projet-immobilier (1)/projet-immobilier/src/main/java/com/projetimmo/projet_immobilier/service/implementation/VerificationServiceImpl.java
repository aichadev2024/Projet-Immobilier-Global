package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.CodeOTP;
import com.projetimmo.projet_immobilier.entity.Verification;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.enums.StatutVerification;
import com.projetimmo.projet_immobilier.enums.TypeCodeOTP;
import com.projetimmo.projet_immobilier.enums.TypeVerification;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import com.projetimmo.projet_immobilier.repository.CodeOTPRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.repository.VerificationRepository;
import com.projetimmo.projet_immobilier.service.SmsService;
import com.projetimmo.projet_immobilier.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.regex.Pattern;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VerificationServiceImpl implements VerificationService {

    private final AgenceRepository agenceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CodeOTPRepository codeOTPRepository;
    private final VerificationRepository verificationRepository;
    private final SmsService smsService;

    @Value("${verification.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${verification.email.enabled:true}")
    private boolean emailEnabled;

    @Override
    public boolean verifierAdminParEmail(String email) {
        log.info("Vérification admin par email: {}", email);

        if (!isValidEmail(email)) {
            log.warn("Format d'email invalide: {}", email);
            return false;
        }

        return utilisateurRepository.findByEmail(email)
                .map(utilisateur -> {
                    boolean isAdmin = utilisateur.getRole() != null &&
                            "ADMIN".equals(utilisateur.getRole().getNom());
                    if (isAdmin) {
                        log.info("Admin vérifié avec succès: {}", email);
                        return true;
                    }
                    log.warn("L'utilisateur n'est pas un admin: {}", email);
                    return false;
                })
                .orElse(false);
    }

    @Override
    public boolean verifierUtilisateurParTelephone(String telephone, String code) {
        log.info("Vérification utilisateur par téléphone: {}", telephone);

        if (!isValidTelephone(telephone)) {
            log.warn("Format de téléphone invalide: {}", telephone);
            return false;
        }

        // Vérifier le code OTP
        Optional<CodeOTP> codeOTP = codeOTPRepository.findValidCodeByDestinataireAndType(
                telephone, TypeCodeOTP.SMS, LocalDateTime.now());

        if (codeOTP.isEmpty()) {
            log.warn("Code de vérification invalide ou expiré pour: {}", telephone);
            return false;
        }

        if (!codeOTP.get().getCode().equals(code)) {
            log.warn("Code de vérification incorrect pour: {}", telephone);
            return false;
        }

        // Marquer le code comme utilisé
        CodeOTP otp = codeOTP.get();
        otp.setEstUtilise(true);
        codeOTPRepository.save(otp);

        // Vérifier que l'utilisateur existe
        boolean utilisateurExiste = utilisateurRepository.findByTelephone(telephone).isPresent();
        if (utilisateurExiste) {
            log.info("Utilisateur vérifié avec succès: {}", telephone);
            return true;
        }

        log.warn("Utilisateur non trouvé pour le téléphone: {}", telephone);
        return false;
    }

    @Override
    public boolean verifierAgence(Agence agence) {
        log.info("Vérification agence: {}", agence.getNom());

        // Vérification multi-critères pour les agences
        boolean critere1 = agence.getNina() != null && !agence.getNina().trim().isEmpty();
        boolean critere2 = agence.getEmail() != null && isValidEmail(agence.getEmail());
        boolean critere3 = agence.getTelephone() != null && isValidTelephone(agence.getTelephone());
        boolean critere4 = agence.getAdresse() != null && !agence.getAdresse().trim().isEmpty();

        // Vérifier que le NINA est unique
        boolean ninaUnique = true;
        if (agence.getNina() != null) {
            ninaUnique = !agenceRepository.existsByNina(agence.getNina()) ||
                    agenceRepository.findByNina(agence.getNina())
                            .map(existing -> existing.getId().equals(agence.getId()))
                            .orElse(true);
        }

        boolean verificationReussie = critere1 && critere2 && critere3 && critere4 && ninaUnique;

        if (verificationReussie) {
            log.info("Agence vérifiée avec succès: {}", agence.getNom());
            agence.setStatut(StatutAgence.VERIFIEE);

            // Créer une entrée de vérification
            Verification verification = Verification.builder()
                    .agence(agence)
                    .type(TypeVerification.LICENCE)
                    .statut(StatutVerification.APPROUVEE)
                    .dateTraitement(LocalDateTime.now())
                    .traitePar("SYSTEM_AUTO")
                    .commentaires("Vérification automatique réussie")
                    .build();
            verificationRepository.save((Objects.requireNonNull(verification)));
        } else {
            log.warn("Échec de la vérification de l'agence: {}", agence.getNom());
            agence.setStatut(StatutAgence.REJETEE);

            // Créer une entrée de vérification rejetée
            Verification verification = Verification.builder()
                    .agence(agence)
                    .type(TypeVerification.LICENCE)
                    .statut(StatutVerification.REJETTEE)
                    .dateTraitement(LocalDateTime.now())
                    .traitePar("SYSTEM_AUTO")
                    .commentaires("Vérification automatique échouée")
                    .build();
            verificationRepository.save(Objects.requireNonNull(verification));
        }

        return verificationReussie;
    }

    @Override
    public String genererCodeVerification() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    @Override
    public boolean envoyerCodeVerification(String telephone, String code) {
        log.info("Envoi du code de vérification pour: {}", telephone);

        try {
            // Créer et sauvegarder le code OTP
            CodeOTP codeOTP = CodeOTP.builder()
                    .code(code)
                    .destinataire(telephone)
                    .type(TypeCodeOTP.SMS)
                    .dateGeneration(LocalDateTime.now())
                    .dateExpiration(LocalDateTime.now().plusMinutes(10))
                    .estUtilise(false)
                    .build();

            codeOTPRepository.save(Objects.requireNonNull(codeOTP));

            if (!smsEnabled) {
                log.info("Mode simulation: Code de vérification pour {} est: {}", telephone, code);
                return true;
            }

            log.info("Envoi du code de vérification {} au téléphone: {}", code, telephone);

            // Intégration avec le service SMS (Brevo)
            String message = "Votre code de vérification est: " + code;
            boolean smsEnvoye = smsService.sendSms(telephone, message);

            if (!smsEnvoye) {
                log.error("Échec de l'envoi du SMS au téléphone: {}", telephone);
                return false;
            }

            log.info("SMS envoyé avec succès au téléphone: {}", telephone);

            return true;
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi du SMS au téléphone: {}", telephone, e);
            return false;
        }
    }

    @Override
    public boolean verifierCodeRecu(String telephone, String codeSaisi) {
        return verifierUtilisateurParTelephone(telephone, codeSaisi);
    }

    // Nouvelles méthodes pour la gestion des vérifications

    public Verification creerVerification(UUID idAgence, TypeVerification type, String documentUrl) {
        Agence agence = agenceRepository.findById(Objects.requireNonNull(idAgence))
                .orElseThrow(() -> new IllegalArgumentException("Agence non trouvée: " + idAgence));

        Verification verification = Verification.builder()
                .agence(agence)
                .type(type)
                .statut(StatutVerification.EN_ATTENTE)
                .documentUrl(documentUrl)
                .dateDemande(LocalDateTime.now())
                .build();

        return verificationRepository.save(Objects.requireNonNull(verification));
    }

    public List<Verification> getVerificationsEnAttente() {
        return verificationRepository.findVerificationsEnAttente();
    }

    public List<Verification> getVerificationsByAgence(UUID idAgence) {
        return verificationRepository.findByAgenceId(idAgence);
    }

    public Verification approuverVerification(UUID idVerification, String traitePar, String commentaires) {
        Verification verification = verificationRepository.findById(Objects.requireNonNull(idVerification))
                .orElseThrow(() -> new IllegalArgumentException("Vérification non trouvée: " + idVerification));

        verification.setStatut(StatutVerification.APPROUVEE);
        verification.setDateTraitement(LocalDateTime.now());
        verification.setTraitePar(traitePar);
        verification.setCommentaires(commentaires);

        return verificationRepository.save(verification);
    }

    public Verification rejeterVerification(UUID idVerification, String traitePar, String commentaires) {
        Verification verification = verificationRepository.findById(Objects.requireNonNull(idVerification))
                .orElseThrow(() -> new IllegalArgumentException("Vérification non trouvée: " + idVerification));

        verification.setStatut(StatutVerification.REJETTEE);
        verification.setDateTraitement(LocalDateTime.now());
        verification.setTraitePar(traitePar);
        verification.setCommentaires(commentaires);

        return verificationRepository.save(verification);
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$";
        return Pattern.matches(emailRegex, email);
    }

    private boolean isValidTelephone(String telephone) {
        String telephoneRegex = "^(\\+\\d{1,3}[- ]?)?\\d{10,15}$";
        return Pattern.matches(telephoneRegex, telephone.replaceAll("\\s", ""));
    }
}
