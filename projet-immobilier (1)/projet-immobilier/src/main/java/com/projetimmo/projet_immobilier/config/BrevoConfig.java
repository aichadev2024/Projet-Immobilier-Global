package com.projetimmo.projet_immobilier.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "brevo")
@Data
public class BrevoConfig {
    
    private String apiKey;
    private String url;
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
        System.out.println("🔧 Brevo API Key set: " + (apiKey != null ? apiKey.substring(0, Math.min(10, apiKey.length())) + "..." : "null"));
    }
    
    public void setUrl(String url) {
        this.url = url;
        System.out.println("🔧 Brevo URL set: " + url);
    }
}
