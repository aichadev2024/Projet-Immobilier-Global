package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.UtilisateurService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Utilisateur creerUtilisateur(Utilisateur utilisateur) {

        // Vérifier unicité email
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Vérifier unicité username
        if (utilisateurRepository.findByNomUtilisateur(utilisateur.getNomUtilisateur()).isPresent()) {
            throw new RuntimeException("Nom d'utilisateur déjà utilisé");
        }

        // 🔒 Forcer le rôle CLIENT (pas modifiable)
        Role role = roleRepository.findByNom("UTILISATEUR")
                .orElseThrow(() -> new RuntimeException("Rôle CLIENT introuvable"));

        // 🔐 Encoder mot de passe
        utilisateur.setMotDePasse(
                passwordEncoder.encode(utilisateur.getMotDePasse()));

        utilisateur.setRole(role);
        utilisateur.setStatut(utilisateur.getStatut() == null ? null : utilisateur.getStatut());
        utilisateur.setCreatedAt(LocalDateTime.now());

        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public Utilisateur getUtilisateurParId(UUID id) {
        return utilisateurRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    @Override
    public List<UtilisateurResponse> listerUtilisateurs() {
        return utilisateurRepository.findAllByIsDeletedFalse()
                .stream()
                .map(user -> UtilisateurResponse.builder()
                        .id(user.getId())
                        .prenom(user.getPrenom())
                        .nom(user.getNom())
                        .email(user.getEmail())
                        .telephone(user.getTelephone())
                        .nomUtilisateur(user.getNomUtilisateur())
                        .role(user.getRole().getNom())
                        .statut(user.getStatut().name())
                        .createdAt(user.getCreatedAt())
                        .photoProfil(user.getPhotoProfil())
                        .build())
                .toList();
    }

    @Override
    public Utilisateur supprimerUtilisateur(UUID id) {
        Utilisateur utilisateur = getUtilisateurParId(id);
        utilisateur.setIsDeleted(true);
        utilisateur.setDeletedAt(LocalDateTime.now());
        return utilisateurRepository.save(utilisateur);
    }

    @Override
    public Utilisateur mettreAJourUtilisateur(UUID id, Utilisateur utilisateur) {

        Utilisateur existing = getUtilisateurParId(id);

        // Vérifier email unique
        if (!existing.getEmail().equals(utilisateur.getEmail()) &&
                utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Vérifier username unique
        if (!existing.getNomUtilisateur().equals(utilisateur.getNomUtilisateur()) &&
                utilisateurRepository.findByNomUtilisateur(utilisateur.getNomUtilisateur()).isPresent()) {
            throw new RuntimeException("Nom d'utilisateur déjà utilisé");
        }

        existing.setPrenom(utilisateur.getPrenom());
        existing.setNom(utilisateur.getNom());
        existing.setEmail(utilisateur.getEmail());
        existing.setTelephone(utilisateur.getTelephone());
        existing.setNomUtilisateur(utilisateur.getNomUtilisateur());
        existing.setPhotoProfil(utilisateur.getPhotoProfil());

        // 🔐 Mot de passe optionnel
        if (utilisateur.getMotDePasse() != null && !utilisateur.getMotDePasse().isEmpty()) {
            existing.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        }

        // 🚫 ROLE NON MODIFIABLE

        return utilisateurRepository.save(existing);
    }

    // Implémentation
    @Override
    public Utilisateur getUtilisateurParNomUtilisateur(String nomUtilisateur) {
        return utilisateurRepository.findByNomUtilisateur(nomUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    @Override
    public void changerMotDePasse(String nomUtilisateur, String currentPassword, String newPassword) {
        Utilisateur utilisateur = getUtilisateurParNomUtilisateur(nomUtilisateur);
        
        // Vérifier le mot de passe actuel
        if (!passwordEncoder.matches(currentPassword, utilisateur.getMotDePasse())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }
        
        // Encoder et sauvegarder le nouveau mot de passe
        utilisateur.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(utilisateur);
    }
}
