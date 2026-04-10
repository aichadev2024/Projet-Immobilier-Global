package com.projetimmo.projet_immobilier.config;

import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        String[] roles = {"ADMIN", "SUPER_ADMIN", "AGENCE", "AGENT", "UTILISATEUR"};

        for (String roleNom : roles) {

            boolean roleExiste = roleRepository
                    .findByNom(roleNom)
                    .isPresent();

            if (!roleExiste) {
                Role role = Role.builder()
                        .nom(roleNom)
                        .status("ACTIF")
                        .build();

                roleRepository.save(Objects.requireNonNull(role));
            }
        }

        System.out.println("✅ Rôles initialisés avec succès");
    }
}
