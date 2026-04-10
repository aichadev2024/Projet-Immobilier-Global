package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.repository.RoleRepository;
import com.projetimmo.projet_immobilier.service.interfaces.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public Role trouverParNom(String nom) {
        return roleRepository.findByNom(nom)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable"));
    }

    @Override
    public Role getRoleParDefaut() {
        return trouverParNom("UTILISATEUR");
    }

}
