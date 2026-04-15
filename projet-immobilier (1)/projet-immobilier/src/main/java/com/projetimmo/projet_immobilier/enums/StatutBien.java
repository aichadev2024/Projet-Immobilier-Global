package com.projetimmo.projet_immobilier.enums;

public enum StatutBien {

    DISPONIBLE,
    LOUE,
    VENDU,
    INDISPONIBLE,
    EN_ATTENTE,
    VALIDE,
    REFUSE,
    // 🔒 Statuts de vérification par l'agence
    EN_ATTENTE_VALIDATION,  // En attente de vérification par l'agence
    APPROUVE,               // Validé et publié par l'agence
    REJETE                  // Refusé par l'agence
}
