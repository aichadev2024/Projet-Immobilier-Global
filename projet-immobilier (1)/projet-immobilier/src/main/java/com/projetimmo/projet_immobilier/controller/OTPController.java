package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.OTPValidationRequest;
import com.projetimmo.projet_immobilier.dto.OTPRequest;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.TypeCodeOTP;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.OTPService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/otp")
@RequiredArgsConstructor
@Slf4j
public class OTPController {

    private final OTPService otpService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOTP(@RequestBody @Valid OTPRequest request) {
        log.info("📱 Demande d'envoi OTP pour l'utilisateur: {}", request.getUsername());
        
        try {
            Utilisateur user = utilisateurRepository.findByNomUtilisateur(request.getUsername())
                    .or(() -> utilisateurRepository.findByEmail(request.getUsername()))
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            String target = (user.getTelephone() != null && !user.getTelephone().isEmpty()) 
                    ? user.getTelephone() : user.getEmail();

            if (!otpService.canResendOTP(target)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Veuillez attendre avant de demander un nouveau code",
                    "message", "Un code a déjà été envoyé récemment"
                ));
            }

            // Déterminer le type d'envoi (SMS si téléphone dispo, sinon Email)
            TypeCodeOTP type = (user.getTelephone() != null && !user.getTelephone().isEmpty()) 
                    ? TypeCodeOTP.SMS : TypeCodeOTP.EMAIL;
            
            otpService.generateAndSendOTP(user, type);
            
            return ResponseEntity.ok(Map.of(
                "message", "Code de validation envoyé avec succès",
                "method", type.toString(),
                "destinataire", target,
                "expiresIn", "10 minutes"
            ));
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "message", "Impossible d'envoyer le code de validation"
            ));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, String>> validateOTP(@RequestBody @Valid OTPValidationRequest request) {
        log.info("🔐 Tentative de validation OTP pour le téléphone: {}", request.getTelephone());
        
        try {
            Utilisateur user = utilisateurRepository.findByTelephone(request.getTelephone())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ce numéro"));

            boolean isValid = otpService.validateOTP(user, request.getCode());
            
            if (isValid) {
                // Activer le compte utilisateur
                otpService.activateUserAccount(user);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Compte validé avec succès! Vous pouvez maintenant vous connecter.",
                    "status", "ACTIVE"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Code invalide ou expiré",
                    "message", "Veuillez vérifier votre code ou demander un nouveau code"
                ));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la validation OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "message", "Erreur lors de la validation du code"
            ));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<Map<String, String>> resendOTP(@RequestBody @Valid OTPRequest request) {
        return sendOTP(request); // Reuse send logic
    }
}
