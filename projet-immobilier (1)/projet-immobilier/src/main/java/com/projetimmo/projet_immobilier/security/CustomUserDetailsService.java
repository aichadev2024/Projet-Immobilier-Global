package com.projetimmo.projet_immobilier.security;

import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Utilisateur utilisateur = utilisateurRepository
                .findByNomUtilisateur(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        // Utiliser le rôle du JWT si disponible, sinon utiliser la base de données
        String roleNom = "UTILISATEUR"; // Valeur par défaut

        // Essayer d'extraire le rôle depuis le JWT (si disponible dans le contexte)
        try {
            // Pour l'instant, utiliser roleAgent puis role comme fallback
            roleNom = utilisateur.getRoleAgent() != null ? utilisateur.getRoleAgent().toUpperCase()
                    : utilisateur.getRole() != null ? utilisateur.getRole().getNom().toUpperCase() : "UTILISATEUR";
        } catch (Exception e) {
            // En cas d'erreur, utiliser la valeur par défaut
            roleNom = "UTILISATEUR";
        }

        return User.builder()
                .username(utilisateur.getNomUtilisateur())
                .password(utilisateur.getMotDePasse())
                .authorities("ROLE_" + roleNom) // Le rôle est déjà sans ROLE_
                .disabled(utilisateur.getStatut() != StatutUtilisateur.ACTIF)
                .build();
    }
}
