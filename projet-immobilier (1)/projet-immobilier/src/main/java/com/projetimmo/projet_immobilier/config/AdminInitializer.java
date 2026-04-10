// SUPPRIMÉ: La création automatique de super admin est désactivée
// Les admins doivent être créés manuellement via l'interface ou l'API
/*
package com.projetimmo.projet_immobilier.config;

import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class AdminInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:admin@entreprise.com}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-username:admin}")
    private String defaultAdminUsername;

    @Value("${app.admin.default-password:Admin2024!}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-nom:Administrateur}")
    private String defaultAdminNom;

    @Value("${app.admin.default-prenom:Entreprise}")
    private String defaultAdminPrenom;

    @Override
    @Transactional
    public void run(String... args) {
        
        // Vérifier si un super admin existe déjà
        boolean superAdminExists = utilisateurRepository.findByRoleNom("SUPER_ADMIN")
                .stream()
                .anyMatch(u -> !u.getIsDeleted() && u.getStatut() == StatutUtilisateur.ACTIF);

        if (!superAdminExists) {
            log.info("🚨 Aucun super admin trouvé - Nettoyage et création du super admin par défaut...");
            
            // Supprimer d'abord tous les super admins existants
            var existingSuperAdmins = utilisateurRepository.findByRoleNom("SUPER_ADMIN")
                    .stream()
                    .filter(u -> !u.getIsDeleted())
                    .toList();
            
            if (!existingSuperAdmins.isEmpty()) {
                log.info("🧹 Suppression de {} super admins existants...", existingSuperAdmins.size());
                for (Utilisateur existingSA : existingSuperAdmins) {
                    try {
                        utilisateurRepository.delete(existingSA);
                        log.info("✅ Super admin {} supprimé", existingSA.getNomUtilisateur());
                    } catch (Exception e) {
                        log.error("❌ Erreur suppression du super admin {}: {}", existingSA.getNomUtilisateur(), e.getMessage());
                    }
                }
                // Forcer le flush
                utilisateurRepository.flush();
                log.info("✅ Super admins existants supprimés avec succès");
            }
            
            // Récupérer le rôle SUPER_ADMIN
            Role superAdminRole = roleRepository.findByNom("SUPER_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rôle SUPER_ADMIN non trouvé"));

            // Créer le super admin par défaut
            Utilisateur superAdmin = Utilisateur.builder()
                    .id(UUID.randomUUID())
                    .nomUtilisateur(defaultAdminUsername)
                    .email(defaultAdminEmail)
                    .motDePasse(passwordEncoder.encode(defaultAdminPassword))
                    .nom(defaultAdminNom)
                    .prenom(defaultAdminPrenom)
                    .telephone("0000000000")
                    .photoProfil(null)
                    .statut(StatutUtilisateur.ACTIF)
                    .isDeleted(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .role(superAdminRole)
                    .build();

            utilisateurRepository.save(Objects.requireNonNull(superAdmin));
            
            log.info("✅ Super admin créé avec succès !");
            log.info("📧 Email: {}", defaultAdminEmail);
            log.info("👤 Username: {}", defaultAdminUsername);
            log.info("👑 Ce super admin peut maintenant gérer tout le système");
            log.info("⚠️  LES IDENTIFIANTS DOIVENT ÊTRE CHANGÉS IMMÉDIATEMENT !");
            
        } else {
            log.info("✅ Un super admin existe déjà - Pas de création de super admin par défaut");
        }
    }
}
*/
