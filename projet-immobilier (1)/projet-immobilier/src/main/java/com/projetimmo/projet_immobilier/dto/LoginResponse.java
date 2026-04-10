package com.projetimmo.projet_immobilier.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String access_token; // Changé pour correspondre au frontend
    private String refresh_token; // Changé pour correspondre au frontend
    private String token_type;
    private long expires_in;
    private String username;
    private String role;

    // Constructeur pour compatibilité existante
    public LoginResponse(String accessToken, String refreshToken, String role) {
        this.access_token = accessToken;
        this.refresh_token = refreshToken;
        this.token_type = "Bearer";
        this.expires_in = 86400; // 24 heures
        this.role = role;
    }
    
    // Constructeur pour ne rien casser
    public LoginResponse(String accessToken) {
        this.access_token = accessToken;
        this.refresh_token = null;
        this.token_type = "Bearer";
        this.expires_in = 86400;
    }
}
