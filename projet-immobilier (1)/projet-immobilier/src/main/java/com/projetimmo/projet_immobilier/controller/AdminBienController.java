package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.BienResponse;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.service.interfaces.BienService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/biens")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // 🔐 Protection globale
public class AdminBienController {

    private final BienService bienService;

    @GetMapping
    public List<BienResponse> getTousLesBiens() {
        return bienService.listerTousBiens(); // Admin voit tous les biens incluant LOUE et VENDU
    }

    @GetMapping("/en-attente")
    public List<BienResponse> getBiensEnAttente() {
        return bienService.getBiensByStatut(StatutBien.EN_ATTENTE);
    }

    @PutMapping("/{id}/valider")
    public void valider(@PathVariable Long id) {
        bienService.validerBien(id);
    }

    @PutMapping("/{id}/refuser")
    public void refuser(@PathVariable Long id) {
        bienService.refuserBien(id);
    }
}