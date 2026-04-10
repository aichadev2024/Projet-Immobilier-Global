package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.entity.Role;

public interface RoleService {

    Role trouverParNom(String nom);

    Role getRoleParDefaut();
}
