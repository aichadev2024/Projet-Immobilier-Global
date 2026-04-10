package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.UtilisateurResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;

import java.util.List;
import java.util.UUID;

public interface UtilisateurService {

    Utilisateur creerUtilisateur(Utilisateur utilisateur);

    Utilisateur getUtilisateurParId(UUID id);

    Utilisateur supprimerUtilisateur(UUID id);

    Utilisateur mettreAJourUtilisateur(UUID id, Utilisateur utilisateur);

    List<UtilisateurResponse> listerUtilisateurs();

    Utilisateur getUtilisateurParNomUtilisateur(String nomUtilisateur);

    void changerMotDePasse(String nomUtilisateur, String currentPassword, String newPassword);

}
