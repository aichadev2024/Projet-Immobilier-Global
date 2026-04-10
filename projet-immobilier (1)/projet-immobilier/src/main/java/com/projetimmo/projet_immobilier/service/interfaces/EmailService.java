package com.projetimmo.projet_immobilier.service.interfaces;

public interface EmailService {
    void sendValidationEmail(String email, String token, String username);
}
