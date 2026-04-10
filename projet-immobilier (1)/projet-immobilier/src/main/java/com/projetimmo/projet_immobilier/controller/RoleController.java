package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Role;
import com.projetimmo.projet_immobilier.service.interfaces.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/default")
    public Role getRoleParDefaut() {
        return roleService.getRoleParDefaut();
    }
}
