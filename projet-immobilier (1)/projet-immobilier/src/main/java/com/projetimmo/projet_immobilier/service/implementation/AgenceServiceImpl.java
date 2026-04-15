package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.enums.StatutAgence;
import com.projetimmo.projet_immobilier.repository.AgenceRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.service.interfaces.AgenceService;
import com.projetimmo.projet_immobilier.service.interfaces.BienService;
import com.projetimmo.projet_immobilier.dto.AgentCreateRequest;
import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.service.BrevoService;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgenceServiceImpl implements AgenceService {

    private final AgenceRepository agenceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.projetimmo.projet_immobilier.repository.BienRepository bienRepository;
    private final BienService bienService;
    private final BrevoService brevoService;

    @Override
    @Transactional(readOnly = true)
    public Optional<Agence> getAgenceById(UUID id) {
        return agenceRepository.findById((Objects.requireNonNull(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Agence> getAgenceByEmail(String email) {
        return agenceRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Agence> getAgenceByTelephone(String telephone) {
        return agenceRepository.findByTelephone(telephone);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Agence> getAllAgences() {
        return agenceRepository.findActiveAgences();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Agence> getAgencesByStatut(StatutAgence statut) {
        return agenceRepository.findActiveAgencesByStatut(statut);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Agence> getAgencesByVille(String ville) {
        return agenceRepository.findByVille(ville);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Agence> searchAgences(String searchTerm) {
        return agenceRepository.searchAgences(searchTerm);
    }

    @Override
    public Agence updateAgence(UUID id, Agence agence) {
        log.info("Updating agency with id: {}", id);

        Agence existingAgence = agenceRepository.findById((Objects.requireNonNull(id)))
                .orElseThrow(() -> new IllegalArgumentException("Agency not found with id: " + id));

        if (!existingAgence.getEmail().equals(agence.getEmail()) && existsByEmail(agence.getEmail())) {
            throw new IllegalArgumentException("Agency with email " + agence.getEmail() + " already exists");
        }

        if (agence.getTelephone() != null && !existingAgence.getTelephone().equals(agence.getTelephone())
                && existsByTelephone(agence.getTelephone())) {
            throw new IllegalArgumentException("Agency with telephone " + agence.getTelephone() + " already exists");
        }

        existingAgence.setNom(agence.getNom());
        existingAgence.setEmail(agence.getEmail());
        existingAgence.setTelephone(agence.getTelephone());
        existingAgence.setAdresse(agence.getAdresse());
        existingAgence.setVille(agence.getVille());
        existingAgence.setPays(agence.getPays());
        existingAgence.setCodePostal(agence.getCodePostal());
        existingAgence.setNumeroLicence(agence.getNumeroLicence());
        existingAgence.setSiteWeb(agence.getSiteWeb());
        existingAgence.setLogoUrl(agence.getLogoUrl());
        existingAgence.setDescription(agence.getDescription());

        return agenceRepository.save(existingAgence);
    }

    @Override
    public void deleteAgence(UUID id) {
        log.info("Deleting agency with id: {}", id);
        agenceRepository.deleteById((Objects.requireNonNull(id)));
    }

    @Override
    public void softDeleteAgence(UUID id) {
        log.info("Soft deleting agency with id: {}", id);
        Agence agence = agenceRepository.findById((Objects.requireNonNull(id)))
                .orElseThrow(() -> new IllegalArgumentException("Agency not found with id: " + id));
        agence.setIsDeleted(true);
        agence.setDeletedAt(LocalDateTime.now());
        agenceRepository.save(agence);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return agenceRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByTelephone(String telephone) {
        return agenceRepository.existsByTelephone(telephone);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByNumeroLicence(String numeroLicence) {
        return agenceRepository.existsByNumeroLicence(numeroLicence);
    }

    @Override
    public Agence verifierAgence(UUID id) {
        log.info("Verifying agency with id: {}", id);
        Agence agence = agenceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Agency not found with id: " + id));
        agence.setStatut(StatutAgence.VERIFIEE);
        Agence savedAgence = agenceRepository.save(agence);
        
        // Valider rétroactivement tous les biens en attente de cette agence
        try {
            List<com.projetimmo.projet_immobilier.entity.Bien> biensEnAttente = bienRepository.findByAgenceIdAndIsDeletedFalse(id).stream()
                    .filter(b -> b.getStatutBien() == com.projetimmo.projet_immobilier.enums.StatutBien.EN_ATTENTE)
                    .toList();
            
            for (com.projetimmo.projet_immobilier.entity.Bien bien : biensEnAttente) {
                bienService.validerBien(bien.getId());
            }
            log.info("Validated {} pending properties for agency {}", biensEnAttente.size(), id);
        } catch (Exception e) {
            log.error("Error during retroactive property validation for agency {}: {}", id, e.getMessage());
            // On ne bloque pas la validation de l'agence si celle des biens échoue
        }
        
        return savedAgence;
    }

    @Override
    public Agence suspendreAgence(UUID id) {
        log.info("Suspending agency with id: {}", id);
        Agence agence = agenceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Agency not found with id: " + id));
        agence.setStatut(StatutAgence.SUSPENDUE);
        return agenceRepository.save(agence);
    }

    @Override
    public Agence rejeterAgence(UUID id) {
        log.info("Rejecting agency with id: {}", id);
        Agence agence = agenceRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Agency not found with id: " + id));
        agence.setStatut(StatutAgence.REJETEE);
        return agenceRepository.save(agence);
    }

    @Override
    @Transactional(readOnly = true)
    public Agence getMyProfile(String username) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateurWithAgence(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        // Vérifier si l'utilisateur est une agence ou un agent
        String role = user.getRole().getNom();
        Agence agence = user.getAgence();
        
        if (agence == null) {
            // Si c'est un agent sans agence chargée, chercher via le repository
            if ("AGENT".equals(role)) {
                // Essayer de trouver l'agence associée à cet agent
                Optional<Agence> agenceOpt = agenceRepository.findByAgentId(user.getId());
                if (agenceOpt.isPresent()) {
                    return agenceOpt.get();
                }
            }
            throw new IllegalArgumentException("Veuillez finaliser la configuration de votre agence.");
        }
        return agence;
    }

    @Override
    public Agence updateMyProfile(String username, Agence agenceData) {
        Agence agence = getMyProfile(username);
        agence.setNom(agenceData.getNom() != null ? agenceData.getNom() : agence.getNom());
        agence.setEmail(agenceData.getEmail() != null ? agenceData.getEmail() : agence.getEmail());
        agence.setTelephone(agenceData.getTelephone() != null ? agenceData.getTelephone() : agence.getTelephone());
        agence.setAdresse(agenceData.getAdresse() != null ? agenceData.getAdresse() : agence.getAdresse());
        agence.setVille(agenceData.getVille() != null ? agenceData.getVille() : agence.getVille());
        agence.setPays(agenceData.getPays() != null ? agenceData.getPays() : agence.getPays());
        agence.setCodePostal(agenceData.getCodePostal() != null ? agenceData.getCodePostal() : agence.getCodePostal());
        agence.setNumeroLicence(agenceData.getNumeroLicence() != null ? agenceData.getNumeroLicence() : agence.getNumeroLicence());
        agence.setSiteWeb(agenceData.getSiteWeb() != null ? agenceData.getSiteWeb() : agence.getSiteWeb());
        agence.setLogoUrl(agenceData.getLogoUrl() != null ? agenceData.getLogoUrl() : agence.getLogoUrl());
        agence.setDescription(agenceData.getDescription() != null ? agenceData.getDescription() : agence.getDescription());
        agence.setNinea(agenceData.getNinea() != null ? agenceData.getNinea() : agence.getNinea());
        agence.setHorairesOuverture(agenceData.getHorairesOuverture() != null ? agenceData.getHorairesOuverture() : agence.getHorairesOuverture());
        agence.setVisitePayante(agenceData.getVisitePayante() != null ? agenceData.getVisitePayante() : agence.getVisitePayante());
        agence.setTarifVisite(agenceData.getTarifVisite() != null ? agenceData.getTarifVisite() : agence.getTarifVisite());

        return agenceRepository.save(agence);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilisateurResponse> getMyAgents(String username) {
        Agence agence = getMyProfile(username);
        return utilisateurRepository.findByAgenceAndIsDeletedFalse(agence).stream()
                .map(u -> UtilisateurResponse.builder()
                        .id(u.getId())
                        .prenom(u.getPrenom())
                        .nom(u.getNom())
                        .email(u.getEmail())
                        .telephone(u.getTelephone())
                        .nomUtilisateur(u.getNomUtilisateur())
                        .role(u.getRole().getNom())
                        .statut(u.getStatut().name())
                        .photoProfil(u.getPhotoProfil())
                        .dateEmbauche(u.getDateEmbauche())
                        .biensGeres(u.getBiensGeres())
                        .ventesRealisees(u.getVentesRealisees())
                        .specialite(u.getSpecialite())
                        .permis(u.getPermis())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public UtilisateurResponse createMyAgent(String username, AgentCreateRequest request) {
        Agence agence = getMyProfile(username);
        
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        
        com.projetimmo.projet_immobilier.entity.Role role = roleRepository.findByNom("AGENT")
                .orElseThrow(() -> new IllegalArgumentException("Role AGENT non trouvé"));

        // Générer un mot de passe temporaire aléatoire
        String tempPassword = "Agent" + UUID.randomUUID().toString().substring(0, 8);
        
        Utilisateur agent = Utilisateur.builder()
                .id(UUID.randomUUID())
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .nomUtilisateur(request.getEmail()) 
                .motDePasse(passwordEncoder.encode(tempPassword)) 
                .statut(com.projetimmo.projet_immobilier.enums.StatutUtilisateur.EN_ATTENTE_VALIDATION)
                .enabled(false)
                .accountNonLocked(true)
                .role(role)
                .agence(agence)
                .specialite(request.getSpecialite())
                .permis(request.getPermis())
                .dateEmbauche(java.time.LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();
                
        agent = utilisateurRepository.save(agent);
        
        // Envoyer email d'invitation avec le mot de passe temporaire
        try {
            String fullName = agent.getPrenom() + " " + agent.getNom();
            brevoService.sendAgentInvitationEmail(agent.getEmail(), fullName, tempPassword, agence.getNom());
            log.info("📧 Email d'invitation envoyé à l'agent : {}", agent.getEmail());
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email d'invitation : {}", e.getMessage());
            // On ne bloque pas la création de l'agent si l'email échoue
        }
        
        return UtilisateurResponse.builder()
                .id(agent.getId())
                .prenom(agent.getPrenom())
                .nom(agent.getNom())
                .email(agent.getEmail())
                .telephone(agent.getTelephone())
                .nomUtilisateur(agent.getNomUtilisateur())
                .role(agent.getRole().getNom())
                .statut(agent.getStatut().name())
                .dateEmbauche(agent.getDateEmbauche())
                .build();
    }

    @Override
    public void deleteMyAgent(String username, UUID agentId) {
        Agence agence = getMyProfile(username);
        Utilisateur agent = utilisateurRepository.findByIdAndAgenceAndIsDeletedFalse(agentId, agence)
                .orElseThrow(() -> new IllegalArgumentException("Agent non trouvé ou n'appartient pas à cette agence"));
                
        agent.setIsDeleted(true);
        agent.setDeletedAt(LocalDateTime.now());
        utilisateurRepository.save(agent);
    }
}
