package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.*;
import com.projetimmo.projet_immobilier.dto.EnhancedRegisterRequest;
import com.projetimmo.projet_immobilier.entity.ValidationToken;
import com.projetimmo.projet_immobilier.repository.ValidationTokenRepository;
import com.projetimmo.projet_immobilier.service.interfaces.AuthService;
import com.projetimmo.projet_immobilier.service.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final com.projetimmo.projet_immobilier.service.AccountValidationService accountValidationService;
    private final ValidationTokenRepository tokenRepository;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/login")
    public ResponseEntity<Object> login(
            @RequestBody @Valid LoginRequest request, HttpServletRequest httpRequest) {

        log.info("Tentative de connexion pour l'utilisateur: {}", request.getUsername());

        try {
            Object response = authService.login(request, httpRequest);
            log.info("Phase 1 de connexion réussie pour l'utilisateur: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Échec de connexion pour l'utilisateur {}: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(
            @RequestBody @Valid VerifyOtpRequest request, HttpServletRequest httpRequest) {

        log.info("Tentative de vérification OTP pour: {}", request.getUsername());

        try {
            LoginResponse response = authService.verifyOtp(request, httpRequest);
            log.info("OTP vérifié avec succès. Connexion établie pour: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Échec de vérification OTP pour {}: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody @Valid EnhancedRegisterRequest request,
            HttpServletRequest httpRequest) {

        log.info("Tentative d'inscription pour l'utilisateur: {}", request.getUsername());

        try {
            authService.register(request, httpRequest);
            log.info("Inscription réussie pour l'utilisateur: {}", request.getUsername());

            String message;
            String status;

            if (request.isUtilisateur()) {
                message = "Compte utilisateur créé avec succès! Un code de validation a été envoyé par SMS. Veuillez vérifier votre téléphone.";
                status = "PENDING_OTP_VALIDATION";
            } else if (request.isAgence()) {
                message = "Compte agence créé avec succès! Votre compte est en attente de validation par notre équipe. Vous recevrez un email une fois validé.";
                status = "PENDING_ADMIN_VALIDATION";
            } else if (request.isAdmin() || request.isSuperAdmin()) {
                message = "Compte administrateur créé avec succès! Votre compte est en attente de validation par notre équipe. Vous recevrez un email une fois validé.";
                status = "PENDING_ADMIN_VALIDATION";
            } else {
                message = "Compte créé avec succès!";
                status = "ACTIVE";
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", message,
                            "username", request.getUsername(),
                            "email", request.getEmail(),
                            "role", request.getRoleType(),
                            "status", status));
        } catch (Exception e) {
            log.warn("Échec d'inscription pour l'utilisateur {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "message", "Échec de l'inscription"));
        }
    }

    /**
     * Nouvelle méthode d'inscription avec support des documents (multipart/form-data)
     * Utilisée pour l'inscription des agences avec documents
     */
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> registerWithDocuments(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom,
            @RequestParam("telephone") String telephone,
            @RequestParam("roleType") String roleType,
            @RequestParam(value = "nomAgence", required = false) String nomAgence,
            @RequestParam(value = "adresseAgence", required = false) String adresseAgence,
            @RequestParam(value = "telephoneAgence", required = false) String telephoneAgence,
            @RequestParam(value = "descriptionAgence", required = false) String descriptionAgence,
            @RequestParam(value = "registreCommerce", required = false) MultipartFile registreCommerce,
            @RequestParam(value = "pieceIdentite", required = false) MultipartFile pieceIdentite,
            @RequestParam(value = "nif", required = false) MultipartFile nif,
            @RequestParam(value = "agrement", required = false) MultipartFile agrement,
            HttpServletRequest httpRequest) {

        log.info("Tentative d'inscription avec documents pour l'utilisateur: {}", username);

        try {
            // Créer la requête d'inscription
            EnhancedRegisterRequest request = new EnhancedRegisterRequest();
            request.setUsername(username);
            request.setEmail(email);
            request.setPassword(password);
            request.setNom(nom);
            request.setPrenom(prenom);
            request.setTelephone(telephone);
            request.setRoleType(roleType);
            request.setNomAgence(nomAgence);
            request.setAdresseAgence(adresseAgence);
            request.setTelephoneAgence(telephoneAgence);
            request.setDescriptionAgence(descriptionAgence);

            // Appeler le service d'inscription avec documents
            authService.registerWithDocuments(request, registreCommerce, pieceIdentite, nif, agrement, httpRequest);

            log.info("Inscription avec documents réussie pour l'utilisateur: {}", username);

            String message;
            String status;

            if (request.isUtilisateur()) {
                message = "Compte utilisateur créé avec succès! Un code de validation a été envoyé par SMS. Veuillez vérifier votre téléphone.";
                status = "PENDING_OTP_VALIDATION";
            } else if (request.isAgence()) {
                message = "Compte agence créé avec succès! Vos documents ont été soumis pour vérification. Un administrateur validera votre compte après vérification des documents.";
                status = "PENDING_DOCUMENTS_VERIFICATION";
            } else if (request.isAdmin() || request.isSuperAdmin()) {
                message = "Compte administrateur créé avec succès! Votre compte est en attente de validation par notre équipe. Vous recevrez un email une fois validé.";
                status = "PENDING_ADMIN_VALIDATION";
            } else {
                message = "Compte créé avec succès!";
                status = "ACTIVE";
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", message,
                            "username", username,
                            "email", email,
                            "role", roleType,
                            "status", status));
        } catch (Exception e) {
            log.warn("Échec d'inscription avec documents pour l'utilisateur {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "message", "Échec de l'inscription"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestBody @Valid RefreshTokenRequest request) {

        log.info("Tentative de rafraîchissement du token");

        try {
            LoginResponse response = authService.refreshToken(request.getRefreshToken());
            log.info("Token rafraîchi avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Échec du rafraîchissement du token: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        String username = userDetails.getUsername();
        log.info("Déconnexion de l'utilisateur: {}", username);

        // Implémentation de l'invalidation des tokens (blacklist)
        try {
            // Récupérer le token depuis l'en-tête Authorization
            String token = extractTokenFromRequest(request);
            if (token != null) {
                // Ajouter le token à la blacklist
                tokenBlacklistService.blacklistToken(token);
                log.info("Token ajouté à la blacklist pour l'utilisateur: {}", username);

                // Optionnel: blacklist tous les tokens de l'utilisateur
                tokenBlacklistService.blacklistAllUserTokens(username);
            }
        } catch (Exception e) {
            log.warn("Erreur lors de l'invalidation du token: {}", e.getMessage());
            // Continuer même si le blacklistage échoue
        }

        return ResponseEntity.ok(Map.of(
                "message", "Déconnexion réussie",
                "username", username));
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Retirer "Bearer "
        }
        return null;
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody @Valid ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        log.info("Tentative de changement de mot de passe pour l'utilisateur: {}", username);

        try {
            authService.changePassword(username, request.getCurrentPassword(), request.getNewPassword());
            log.info("Mot de passe changé avec succès pour l'utilisateur: {}", username);

            return ResponseEntity.ok(Map.of(
                    "message", "Mot de passe changé avec succès"));
        } catch (Exception e) {
            log.warn("Échec du changement de mot de passe pour l'utilisateur {}: {}", username, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "username", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities()));
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Auth endpoint is working",
                "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {

        log.info("Tentative d'envoi OTP de réinitialisation pour l'email: {}", request.getEmail());

        try {
            authService.forgotPassword(request.getEmail());
            log.info("Email de réinitialisation (OTP) envoyé pour: {}", request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "Si cet email correspond à un compte, un code de validation à 6 chiffres a été envoyé.",
                    "email", request.getEmail()));
        } catch (Exception e) {
            log.warn("Échec de l'envoi de l'OTP de réinitialisation pour {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {

        log.info("Tentative de réinitialisation avec OTP pour l'email: {}", request.getEmail());

        try {
            authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            log.info("Mot de passe réinitialisé avec succès pour: {}", request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
                    "status", "SUCCESS"));
        } catch (Exception e) {
            log.warn("Échec de la réinitialisation de mot de passe pour {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Impossible de réinitialiser le mot de passe"));
        }
    }

    @GetMapping("/validate-account")
    public ResponseEntity<Map<String, String>> validateAccount(
            @RequestParam String token) {

        log.info("Tentative de validation de compte avec token: {}", token);

        // 🔍 DEBUG : Vérifier le token dans la base
        ValidationToken validationToken = tokenRepository.findByToken(token).orElse(null);
        if (validationToken != null) {
            log.info("🔍 Token trouvé - Email: {}, Utilisé: {}, Expiration: {}, ID: {}",
                    validationToken.getEmail(),
                    validationToken.isUsed(),
                    validationToken.getExpiresAt(),
                    validationToken.getId());
        } else {
            log.warn("🚨 Token NON trouvé dans la base de données");
            // 🔍 DEBUG : Lister tous les tokens existants
            java.util.List<ValidationToken> allTokens = tokenRepository.findAll();
            log.info("📋 Nombre total de tokens dans la base: {}", allTokens.size());
            for (ValidationToken t : allTokens) {
                log.info("📋 Token existant - Email: {}, Token: {}, ID: {}",
                        t.getEmail(),
                        t.getToken(),
                        t.getId());
            }
        }

        try {
            boolean isValid = accountValidationService.validateAccount(token);

            if (isValid) {
                log.info("Compte validé avec succès pour le token: {}", token);
                return ResponseEntity.ok(Map.of(
                        "message", "Compte validé avec succès! Vous pouvez maintenant vous connecter.",
                        "status", "VALIDATED"));
            } else {
                log.warn("Échec de validation du token: {}", token);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Token invalide ou expiré",
                        "message", "Le lien de validation n'est plus valide. Veuillez demander un nouvel email."));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la validation du compte: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Erreur serveur lors de la validation",
                            "message", "Veuillez réessayer plus tard ou contacter le support."));
        }
    }

    @PostMapping("/revoke-token")
    public ResponseEntity<Map<String, String>> revokeToken(
            @RequestParam String token) {

        log.info("Tentative de révocation du token: {}", token.substring(0, Math.min(10, token.length())) + "...");

        try {
            authService.revokeToken(token);
            log.info("Token révoqué avec succès");

            return ResponseEntity.ok(Map.of(
                    "message", "Token révoqué avec succès",
                    "status", "REVOKED"));
        } catch (Exception e) {
            log.warn("Échec de la révocation du token: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Impossible de révoquer le token"));
        }
    }

    @PostMapping("/resend-validation")
    public ResponseEntity<Map<String, String>> resendValidation(
            @RequestParam String email) {

        log.info("Demande de renvoi de l'email de validation pour: {}", email);

        try {
            accountValidationService.resendValidationToken(email);
            log.info("Email de validation renvoyé pour: {}", email);

            return ResponseEntity.ok(Map.of(
                    "message", "Un nouvel email de validation a été envoyé à " + email,
                    "email", email));
        } catch (Exception e) {
            log.warn("Échec du renvoi de l'email de validation pour {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "message", "Impossible d'envoyer l'email de validation"));
        }
    }
}
