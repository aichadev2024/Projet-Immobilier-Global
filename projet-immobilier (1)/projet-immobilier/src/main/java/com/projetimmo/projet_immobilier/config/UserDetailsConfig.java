package com.projetimmo.projet_immobilier.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class UserDetailsConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        // Aucun utilisateur en mémoire
        return username -> {
            throw new UnsupportedOperationException("Security disabled");
        };
    }
}
