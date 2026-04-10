package com.projetimmo.projet_immobilier.service;

public interface SmsService {
    
    /**
     * Envoie un SMS au numéro spécifié
     * @param phoneNumber Numéro de téléphone (format international)
     * @param message Contenu du message
     * @return true si l'envoi a réussi, false sinon
     */
    boolean sendSms(String phoneNumber, String message);
    
    /**
     * Vérifie si le service SMS est disponible
     * @return true si le service est configuré et disponible
     */
    boolean isServiceAvailable();
}
