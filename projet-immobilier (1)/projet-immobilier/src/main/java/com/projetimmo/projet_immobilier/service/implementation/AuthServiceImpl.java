package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.EnhancedRegisterRequest;
import com.projetimmo.projet_immobilier.dto.LoginRequest;
import com.projetimmo.projet_immobilier.dto.LoginResponse;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.RefreshToken;
import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.entity.Verification;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.enums.StatutVerification;
import com.projetimmo.projet_immobilier.enums.TypeDocumentAgence;
import com.projetimmo.projet_immobilier.enums.TypeVerification;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import com.projetimmo.projet_immobilier.repository.RefreshTokenRepository;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.repository.VerificationRepository;
import com.projetimmo.projet_immobilier.security.JwtService;
import com.projetimmo.projet_immobilier.service.AuditService;
import com.projetimmo.projet_immobilier.service.EmailValidationService;
import com.projetimmo.projet_immobilier.service.LoginAttemptService;
import com.projetimmo.projet_immobilier.service.OTPService;
import com.projetimmo.projet_immobilier.service.TokenBlacklistService;
import com.projetimmo.projet_immobilier.service.interfaces.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

        private final UtilisateurRepository utilisateurRepository;
        private final RoleRepository roleRepository;
        private final AgenceRepository agenceRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final RefreshTokenRepository refreshTokenRepository;
        private final VerificationRepository verificationRepository;

        private final EmailValidationService emailValidationService;
        private final LoginAttemptService loginAttemptService;
        private final AuditService auditService;
        private final OTPService otpService;
        private final TokenBlacklistService tokenBlacklistService;

        @Value("${admin.secret.key:}")
        private String adminSecretKey;

        @Value("${upload.dir:uploads/documents}")
        private String uploadDir;

        @Override
        public void register(EnhancedRegisterRequest request, HttpServletRequest httpRequest) {

                // 🛡️ SÉCURITÉ : Rate limiting (désactivé pour les tests)
                String clientIp = getClientIp(httpRequest);

                // 🛡️ SÉCURITÉ : Validation email
                if (!emailValidationService.isProfessionalEmail(request.getEmail())) {
                        log.warn("Tentative d'inscription avec email non valide: {}", request.getEmail());
                        throw new RuntimeException("Veuillez utiliser une adresse email professionnelle et valide.");
                }

                // 🛡️ SÉCURITÉ : Validation mot de passe
                EmailValidationService.PasswordValidationResult passwordResult = emailValidationService
                                .validatePasswordStrength(request.getPassword());
                if (!passwordResult.isValid()) {
                        log.warn("Mot de passe faible pour l'utilisateur: {}", request.getUsername());
                        throw new RuntimeException(String.join(" | ", passwordResult.getErrors()));
                }

                // 🛡️ SÉCURITÉ : Doublons
                if (utilisateurRepository.existsByNomUtilisateur(request.getUsername())) {
                        log.warn("Tentative d'inscription avec nom d'utilisateur existant: {}",
                                        request.getUsername());
                        throw new RuntimeException("Nom d'utilisateur déjà utilisé");
                }

                if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
                        log.warn("Tentative d'inscription avec email existant: {}", request.getEmail());
                        throw new RuntimeException("Cette adresse email est déjà utilisée");
                }

                // 🛡️ SÉCURITÉ : Validation du rôle
                Role role = roleRepository
                                .findByNom(request.getRoleType())
                                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));

                // 🛡️ SÉCURITÉ : Validation spécifique pour les agences
                if (request.isAgence()) {
                        validateAgenceRequest(request);
                }

                // 🏢 CRÉATION AGENCE : Si c'est une agence, créer l'entité Agence d'abord
                Agence agence = null;
                if (request.isAgence()) {
                        // Vérifier si l'email ou le téléphone de l'agence existe déjà
                        if (agenceRepository.existsByEmail(request.getEmail())) {
                                throw new RuntimeException("Une agence avec cet email existe déjà");
                        }
                        if (agenceRepository.existsByTelephone(request.getTelephoneAgence())) {
                                throw new RuntimeException("Une agence avec ce téléphone existe déjà");
                        }

                        agence = Agence.builder()
                                        .id(UUID.randomUUID())
                                        .nom(request.getNomAgence())
                                        .email(request.getEmail())
                                        .telephone(request.getTelephoneAgence())
                                        .adresse(request.getAdresseAgence())
                                        .description(request.getDescriptionAgence())
                                        .statut(StatutAgence.EN_ATTENTE_VERIFICATION)
                                        .isDeleted(false)
                                        .createdAt(LocalDateTime.now())
                                        .build();

                        agenceRepository.save(agence);
                }

                // 🛡️ SÉCURITÉ : Création de l'utilisateur
                Utilisateur utilisateur = Utilisateur.builder()
                                .id(UUID.randomUUID())
                                .nomUtilisateur(request.getUsername())
                                .email(request.getEmail())
                                .motDePasse(passwordEncoder.encode(request.getPassword()))
                                .nom(request.getNom())
                                .prenom(request.getPrenom())
                                .telephone(request.isAgence() ? request.getTelephoneAgence() : request.getTelephone())
                                .enabled(false) // Par défaut désactivé
                                .accountNonLocked(true)
                                .failedAttempt(0)
                                .statut(StatutUtilisateur.EN_ATTENTE_VALIDATION)
                                .isDeleted(false)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .role(role)
                                .agence(agence)
                                .build();

                utilisateurRepository.save(Objects.requireNonNull(utilisateur));

                log.info("Utilisateur créé avec succès: {} | Email: {}", request.getUsername(), request.getEmail());

                // 📧 ENVOI VALIDATION PAR EMAIL UNIQUEMENT
                try {
                        if (request.isUtilisateur() || request.isAgence() || request.isAdmin()) {
                                // Forcer l'envoi par email (plus fiable et gratuit)
                                otpService.generateAndSendOTP(utilisateur,
                                                com.projetimmo.projet_immobilier.enums.TypeCodeOTP.EMAIL);
                                log.info("📧 OTP envoyé par email pour validation: {}", request.getEmail());
                        }
                } catch (Exception e) {
                        log.error("Erreur d'envoi OTP par email: {}", e.getMessage());
                }

                auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.REGISTER,
                                request.getEmail(), "Inscription réussie", clientIp);
        }

        @Override
        @Transactional
        public void registerWithDocuments(EnhancedRegisterRequest request, MultipartFile registreCommerce,
                        MultipartFile pieceIdentite, MultipartFile nif, MultipartFile agrement, HttpServletRequest httpRequest) {

                log.info("📄 Inscription avec documents pour l'agence: {}", request.getNomAgence());

                // 🛡️ Vérifier que les documents obligatoires sont présents pour une agence
                if (request.isAgence()) {
                        if (registreCommerce == null || registreCommerce.isEmpty()) {
                                throw new RuntimeException("Le document RCCM/NINA est obligatoire");
                        }
                        if (pieceIdentite == null || pieceIdentite.isEmpty()) {
                                throw new RuntimeException("La pièce d'identité du responsable est obligatoire");
                        }
                        if (nif == null || nif.isEmpty()) {
                                throw new RuntimeException("Le document NIF est obligatoire");
                        }
                }

                // 📝 Étape 1: Effectuer l'inscription normale
                register(request, httpRequest);

                // 🔍 Étape 2: Récupérer l'utilisateur et l'agence créés
                Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé après inscription"));

                Agence agence = utilisateur.getAgence();
                if (agence == null && request.isAgence()) {
                        throw new RuntimeException("Agence non créée lors de l'inscription");
                }

                // 🛡️ SÉCURITÉ : Si c'est un utilisateur simple (pas d'agence), on arrête ici le traitement des documents
                if (agence == null) {
                        log.info("ℹ️ Inscription d'un utilisateur simple : aucune agence associée, les documents seront ignorés.");
                        return;
                }

                // 📁 Étape 3: Créer le répertoire de stockage si nécessaire
                Path uploadPath = Paths.get(uploadDir, "agences", agence.getId().toString());
                try {
                        if (!Files.exists(uploadPath)) {
                                Files.createDirectories(uploadPath);
                                log.info("📁 Répertoire créé: {}", uploadPath);
                        }
                } catch (IOException e) {
                        log.error("Erreur création répertoire: {}", e.getMessage());
                        throw new RuntimeException("Erreur lors de la création du répertoire de documents");
                }

                // 📄 Étape 4: Sauvegarder les documents et créer les entrées de vérification
                if (registreCommerce != null && !registreCommerce.isEmpty()) {
                        saveDocumentAndCreateVerification(agence, utilisateur, registreCommerce,
                                        TypeDocumentAgence.REGISTRE_COMMERCE, "RCCM / NINA");
                }

                if (pieceIdentite != null && !pieceIdentite.isEmpty()) {
                        saveDocumentAndCreateVerification(agence, utilisateur, pieceIdentite,
                                        TypeDocumentAgence.PIECE_IDENTITE_RESPONSABLE,
                                        "Pièce d'identité du responsable");
                }

                if (nif != null && !nif.isEmpty()) {
                        saveDocumentAndCreateVerification(agence, utilisateur, nif,
                                        TypeDocumentAgence.NIF, "NIF");
                }

                if (agrement != null && !agrement.isEmpty()) {
                        saveDocumentAndCreateVerification(agence, utilisateur, agrement,
                                        TypeDocumentAgence.AGREMENT, "Agrément");
                }

                log.info("✅ Documents sauvegardés et entrées de vérification créées pour l'agence: {}",
                                agence.getNom());

                auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.REGISTER,
                                request.getEmail(), "Inscription agence avec documents soumis",
                                getClientIp(httpRequest));
        }

        /**
         * Sauvegarde un document et crée une entrée de vérification
         */
        private void saveDocumentAndCreateVerification(Agence agence, Utilisateur utilisateur,
                        MultipartFile file, TypeDocumentAgence typeDocument, String description) {
                try {
                        // Générer un nom de fichier unique
                        String originalFilename = file.getOriginalFilename();
                        String extension = originalFilename != null && originalFilename.contains(".")
                                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                                        : ".pdf";
                        String filename = typeDocument.name() + "_" + UUID.randomUUID().toString() + extension;

                        // Chemin de stockage
                        Path uploadPath = Paths.get(uploadDir, "agences", agence.getId().toString());
                        Path filePath = uploadPath.resolve(filename);

                        // Sauvegarder le fichier
                        Files.copy(file.getInputStream(), filePath);
                        log.info("📄 Document sauvegardé: {}", filePath);

                        // Créer l'entrée de vérification
                        Verification verification = Verification.builder()
                                        .id(UUID.randomUUID())
                                        .agence(agence)
                                        .utilisateur(utilisateur)
                                        .type(TypeVerification.DOCUMENT)
                                        .typeDocumentAgence(typeDocument)
                                        .statut(StatutVerification.EN_ATTENTE)
                                        .documentUrl(filePath.toString())
                                        .commentaires(description
                                                        + " - En attente de vérification par l'administrateur")
                                        .dateDemande(LocalDateTime.now())
                                        .build();

                        verificationRepository.save(verification);
                        log.info("✅ Vérification créée pour {}: {}", typeDocument, verification.getId());

                } catch (IOException e) {
                        log.error("❌ Erreur sauvegarde document {}: {}", typeDocument, e.getMessage());
                        throw new RuntimeException("Erreur lors de la sauvegarde du document: " + description);
                }
        }

        @Override
        public Object login(LoginRequest request, HttpServletRequest httpRequest) {
                String clientIp = getClientIp(httpRequest);
                String loginId = request.getUsername();

                // 🛡️ SÉCURITÉ : Brute force check
                if (loginAttemptService.isBlocked(clientIp, loginId)) {
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_FAIL,
                                        loginId, "Compte bloqué", clientIp);
                        throw new RuntimeException(
                                        "Compte bloqué pour des raisons de sécurité. Veuillez réessayer plus tard.");
                }

                Utilisateur user = utilisateurRepository.findByEmail(loginId)
                                .or(() -> utilisateurRepository.findByNomUtilisateur(loginId))
                                .orElseThrow(() -> {
                                        loginAttemptService.recordFailedAttempt(clientIp, loginId);
                                        return new RuntimeException("Identifiants invalides");
                                });

                // Check password
                if (!passwordEncoder.matches(request.getPassword(), user.getMotDePasse())) {
                        loginAttemptService.recordFailedAttempt(clientIp, loginId);
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_FAIL,
                                        loginId, "Mot de passe incorrect", clientIp);
                        throw new RuntimeException("Identifiants invalides");
                }

                // Check if enabled - Si compte non activé, OTP obligatoire pour activation
                System.out.println("🔍 DEBUG login - User: " + user.getEmail() + " | Enabled: " + user.getEnabled()
                                + " | Statut: " + user.getStatut());
                if (user.getEnabled() != null && !user.getEnabled()) {
                        System.out.println("🔍 DEBUG login - Sending OTP because enabled=" + user.getEnabled());
                        // Force OTP validation pour activation - EMAIL pour AGENCE/ADMIN, SMS simulé
                        // pour UTILISATEUR
                        boolean isSimpleUser = user.getRole() != null
                                        && "UTILISATEUR".equalsIgnoreCase(user.getRole().getNom());
                        com.projetimmo.projet_immobilier.enums.TypeCodeOTP otpType = isSimpleUser
                                        ? com.projetimmo.projet_immobilier.enums.TypeCodeOTP.SMS
                                        : com.projetimmo.projet_immobilier.enums.TypeCodeOTP.EMAIL;
                        System.out.println("🔍 DEBUG login - OTP Type: " + otpType + " (isSimpleUser=" + isSimpleUser
                                        + ")");
                        otpService.generateAndSendOTP(user, otpType);
                        return java.util.Map.of("status", "PENDING_ACTIVATION", "message",
                                        "Compte non activé. Un code OTP vous a été envoyé par "
                                                        + (isSimpleUser ? "SMS (simulation)" : "email") + ".");
                }
                // Gérer le statut EN_ATTENTE_VALIDATION - permettre connexion mais avec
                // restrictions
                if (user.getStatut() == StatutUtilisateur.EN_ATTENTE_VALIDATION) {
                        String accessToken = jwtService.generateToken(user.getNomUtilisateur(),
                                        user.getRole().getNom());
                        String refreshTokenValue = UUID.randomUUID().toString();

                        RefreshToken refreshToken = RefreshToken.builder()
                                        .tokenHash(refreshTokenValue)
                                        .utilisateur(user)
                                        .expiration(LocalDateTime.now().plusDays(30))
                                        .revoked(false)
                                        .build();
                        refreshTokenRepository.save(refreshToken);
                        loginAttemptService.recordSuccessfulAttempt(clientIp, user.getEmail());
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_SUCCESS,
                                        user.getEmail(), "Login réussi - compte en attente de validation", clientIp);

                        // Retourner une réponse spéciale avec statut pending
                        java.util.Map<String, Object> response = new java.util.HashMap<>();
                        response.put("status", "PENDING_VALIDATION");
                        response.put("accessToken", accessToken);
                        response.put("refreshToken", refreshTokenValue);
                        response.put("tokenType", "Bearer");
                        response.put("expiresIn", 86400);
                        response.put("username", user.getNomUtilisateur());
                        response.put("role", user.getRole().getNom());
                        response.put("message",
                                        "Votre compte est en attente de validation par l'administration. Vous avez un accès limité.");
                        return response;
                }

                if (user.getStatut() != StatutUtilisateur.ACTIF) {
                        throw new RuntimeException("Compte inactif ou suspendu");
                }

                // Connexion directe - Générer les tokens immédiatement
                String accessToken = jwtService.generateToken(user.getNomUtilisateur(), user.getRole().getNom());
                String refreshTokenValue = UUID.randomUUID().toString();

                RefreshToken refreshToken = RefreshToken.builder()
                                .tokenHash(refreshTokenValue)
                                .utilisateur(user)
                                .expiration(LocalDateTime.now().plusDays(30))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(refreshToken);

                loginAttemptService.recordSuccessfulAttempt(clientIp, user.getEmail());

                auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_SUCCESS,
                                user.getEmail(), "Login réussi (sans OTP)", clientIp);

                return new LoginResponse(
                                accessToken,
                                refreshTokenValue,
                                "Bearer",
                                86400,
                                user.getNomUtilisateur(),
                                user.getRole().getNom());
        }

        @Override
        @org.springframework.transaction.annotation.Transactional
        public LoginResponse verifyOtp(com.projetimmo.projet_immobilier.dto.VerifyOtpRequest request,
                        HttpServletRequest httpRequest) {
                String clientIp = getClientIp(httpRequest);
                Utilisateur user = utilisateurRepository.findByEmail(request.getUsername())
                                .or(() -> utilisateurRepository.findByNomUtilisateur(request.getUsername()))
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (!otpService.validateOTP(user, request.getCode())) {
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.VERIFY_OTP,
                                        user.getEmail(), "Code OTP invalide", clientIp);
                        throw new RuntimeException("Code OTP incorrect ou expiré");
                }

                // OTP OK -> Activate if needed
                boolean wasActivated = false;
                System.out.println("🔍 DEBUG verifyOtp - User: " + user.getEmail() + " | Enabled: " + user.getEnabled()
                                + " | Statut: " + user.getStatut());
                if (!user.getEnabled() || user.getStatut() == StatutUtilisateur.EN_ATTENTE_VALIDATION) {
                        System.out.println("🔍 DEBUG - Calling activateUserAccount because enabled=" + user.getEnabled()
                                        + " or statut=" + user.getStatut());
                        otpService.activateUserAccount(user);
                        wasActivated = true;
                        // Recharger l'utilisateur pour s'assurer qu'on a les valeurs à jour
                        user = utilisateurRepository.findById(user.getId()).orElse(user);
                        System.out.println("🔍 DEBUG - After activation: enabled=" + user.getEnabled() + " | statut="
                                        + user.getStatut());
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.VERIFY_OTP,
                                        user.getEmail(), "Compte activé via OTP", clientIp);
                } else {
                        System.out.println("🔍 DEBUG - No activation needed, enabled=" + user.getEnabled()
                                        + " | statut=" + user.getStatut());
                }

                // Reset failed attempts as OTP was successful
                loginAttemptService.recordSuccessfulAttempt(clientIp, user.getEmail());

                // Après activation, générer les tokens pour connexion directe
                String accessToken = jwtService.generateToken(user.getNomUtilisateur(), user.getRole().getNom());
                String refreshTokenValue = UUID.randomUUID().toString();

                RefreshToken refreshToken = RefreshToken.builder()
                                .tokenHash(refreshTokenValue)
                                .utilisateur(user)
                                .expiration(LocalDateTime.now().plusDays(30))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(refreshToken);

                auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_SUCCESS,
                                user.getEmail(),
                                wasActivated ? "Compte activé et login réussi via OTP" : "Login réussi via OTP",
                                clientIp);

                return new LoginResponse(
                                accessToken,
                                refreshTokenValue,
                                "Bearer",
                                86400,
                                user.getNomUtilisateur(),
                                user.getRole().getNom());
        }

        @Override
        public void logout(String refreshTokenValue) {

                RefreshToken refreshToken = refreshTokenRepository
                                .findByTokenHash(refreshTokenValue)
                                .orElseThrow(() -> new RuntimeException("Token invalide"));

                refreshToken.setRevoked(true);
                refreshTokenRepository.save(refreshToken);
        }

        @Override
        public LoginResponse refreshToken(String refreshTokenValue) {

                // Récupérer le refresh token dans la base
                RefreshToken refreshToken = refreshTokenRepository
                                .findByTokenHash(refreshTokenValue)
                                .orElseThrow(() -> new RuntimeException("Refresh token invalide"));

                // Vérifier s'il est révoqué
                if (refreshToken.isRevoked()) {
                        throw new RuntimeException("Refresh token révoqué");
                }

                // Vérifier expiration
                if (refreshToken.getExpiration().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Refresh token expiré");
                }

                // Récupérer l'utilisateur associé
                Utilisateur utilisateur = refreshToken.getUtilisateur();

                if (utilisateur.getStatut() != StatutUtilisateur.ACTIF) {
                        throw new RuntimeException("Compte inactif");
                }

                // Générer un nouveau access token avec nomUtilisateur + rôle
                String newAccessToken = jwtService.generateToken(
                                utilisateur.getNomUtilisateur(),
                                utilisateur.getRole().getNom());

                // Retourner la réponse login avec accessToken, refreshToken et rôle
                return new LoginResponse(
                                newAccessToken,
                                refreshTokenValue,
                                "Bearer",
                                86400,
                                utilisateur.getNomUtilisateur(),
                                utilisateur.getRole().getNom());
        }

        @Override
        public void forgotPassword(String email) {

                Utilisateur user = utilisateurRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Aucun compte trouvé avec cette adresse email"));

                // Envoyer un code OTP à 6 chiffres par email
                try {
                        otpService.generateAndSendOTP(user, com.projetimmo.projet_immobilier.enums.TypeCodeOTP.EMAIL);
                        log.info("🔐 OTP de réinitialisation de mot de passe envoyé à: {}", email);
                } catch (Exception e) {
                        log.error("Erreur lors de l'envoi de l'OTP de réinitialisation: {}", e.getMessage());
                        throw new RuntimeException("Impossible d'envoyer le code de réinitialisation");
                }
        }

        @Override
        public void resetPassword(String email, String otp, String newPassword) {

                Utilisateur user = utilisateurRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                // Valider le code OTP (vérifie expiration et match)
                if (!otpService.validateOTP(user, otp)) {
                        auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.VERIFY_OTP,
                                        user.getEmail(), "Code OTP de réinitialisation invalide", "n/a");
                        throw new RuntimeException("Le code de vérification est incorrect ou a expiré");
                }

                // SÉCURITÉ : Validation force du mot de passe
                EmailValidationService.PasswordValidationResult passwordResult = emailValidationService
                                .validatePasswordStrength(newPassword);
                if (!passwordResult.isValid()) {
                        log.warn("Nouveau mot de passe faible lors de la réinitialisation: {}", user.getEmail());
                        throw new RuntimeException("Le mot de passe choisi est trop faible. "
                                        + String.join(" ", passwordResult.getErrors()));
                }

                user.setMotDePasse(passwordEncoder.encode(newPassword));
                utilisateurRepository.save(user);

                auditService.logSecurityEvent(com.projetimmo.projet_immobilier.enums.ActionAudit.LOGIN_SUCCESS,
                                user.getEmail(), "Mot de passe réinitialisé via OTP", "n/a");
        }

        @Override
        public void changePassword(String username, String oldPassword, String newPassword) {

                Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                // Vérifier l'ancien mot de passe
                if (!passwordEncoder.matches(oldPassword, utilisateur.getMotDePasse())) {
                        throw new RuntimeException("Ancien mot de passe incorrect");
                }

                // Vérifier que le nouveau mot de passe est différent
                if (passwordEncoder.matches(newPassword, utilisateur.getMotDePasse())) {
                        throw new RuntimeException("Le nouveau mot de passe doit être différent de l'ancien");
                }

                // Mettre à jour le mot de passe
                utilisateur.setMotDePasse(passwordEncoder.encode(newPassword));
                utilisateurRepository.save(utilisateur);
        }

        @Override
        public boolean validateToken(String token) {
                try {
                        return jwtService.isTokenValid(token);
                } catch (Exception e) {
                        return false;
                }
        }

        @Override
        public void revokeToken(String token) {
                // SÉCURITÉ : Implémentation de la révocation de token (blacklist)
                try {
                        // Validation du token avant révocation
                        if (token == null || token.trim().isEmpty()) {
                                throw new IllegalArgumentException("Token invalide");
                        }

                        // Vérifier que le token est valide avant de le révoquer
                        if (!jwtService.isTokenValid(token)) {
                                log.warn("Tentative de révocation d'un token invalide ou déjà expiré");
                                return;
                        }

                        // Extraire le username du token
                        String username = jwtService.extractUsername(token);
                        String tokenType = jwtService.extractTokenType(token);

                        // Vérifier que c'est bien un access token
                        if (!"access".equals(tokenType)) {
                                throw new IllegalArgumentException("Seuls les access tokens peuvent être révoqués");
                        }

                        // Ajouter le token à la blacklist
                        tokenBlacklistService.blacklistToken(token);

                        // Optionnel : Blacklister tous les tokens de l'utilisateur
                        tokenBlacklistService.blacklistAllUserTokens(username);

                        // Révoquer également le refresh token associé si possible
                        revokeUserRefreshTokens(username);

                        log.info("TOKEN RÉVOQUÉ - Token: {} | Username: {} | Heure: {}",
                                        token.substring(0, Math.min(10, token.length())) + "...", username,
                                        java.time.LocalDateTime.now());

                } catch (IllegalArgumentException e) {
                        log.warn("Erreur de validation lors de la révocation du token: {}", e.getMessage());
                        throw e;
                } catch (Exception e) {
                        log.error("Erreur lors de la révocation du token: {}", e.getMessage());
                        throw new RuntimeException("Impossible de révoquer le token");
                }
        }

        /**
         * Révoque tous les refresh tokens d'un utilisateur
         */
        private void revokeUserRefreshTokens(String username) {
                try {
                        Utilisateur utilisateur = utilisateurRepository.findByNomUtilisateur(username)
                                        .orElse(null);
                        if (utilisateur != null) {
                                // Marquer tous les refresh tokens de l'utilisateur comme révoqués
                                refreshTokenRepository.findByUtilisateurAndRevokedFalse(utilisateur)
                                                .forEach(token -> {
                                                        token.setRevoked(true);
                                                        refreshTokenRepository.save(token);
                                                });
                                log.info("Refresh tokens révoqués pour l'utilisateur: {}", username);
                        }
                } catch (Exception e) {
                        log.error("Erreur lors de la révocation des refresh tokens pour {}: {}", username,
                                        e.getMessage());
                }
        }

        /**
         * Valide les champs spécifiques pour une inscription agence
         */
        private void validateAgenceRequest(EnhancedRegisterRequest request) {
                if (request.getNomAgence() == null || request.getNomAgence().trim().isEmpty()) {
                        throw new RuntimeException("Le nom de l'agence est obligatoire");
                }
                if (request.getAdresseAgence() == null || request.getAdresseAgence().trim().isEmpty()) {
                        throw new RuntimeException("L'adresse de l'agence est obligatoire");
                }
                if (request.getTelephoneAgence() == null || request.getTelephoneAgence().trim().isEmpty()) {
                        throw new RuntimeException("Le téléphone de l'agence est obligatoire");
                }
        }

        /**
         * Récupère l'IP réelle du client
         */
        private String getClientIp(HttpServletRequest request) {
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
                        return xForwardedFor.split(",")[0].trim();
                }

                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
                        return xRealIp;
                }

                return request.getRemoteAddr();
        }
}
