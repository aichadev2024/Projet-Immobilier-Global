package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.entity.Agence;

public interface VerificationService {

    // Vérification par email pour les administrateurs
    boolean verifierAdminParEmail(String email);

    // Vérification par SMS pour les utilisateurs
    boolean verifierUtilisateurParTelephone(String telephone, String code);

    // Vérification pour les agences (combinaison de plusieurs méthodes)
    boolean verifierAgence(Agence agence);

    // Génération de code de vérification SMS
    String genererCodeVerification();

    // Envoi de code de vérification par SMS
    boolean envoyerCodeVerification(String telephone, String code);

    // Vérification du code reçu
    boolean verifierCodeRecu(String telephone, String codeSaisi);
}
