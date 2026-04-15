package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.service.interfaces.AvisService;
import com.projetimmo.projet_immobilier.dto.AvisRequest;
import com.projetimmo.projet_immobilier.dto.AvisResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AvisController {

    private final AvisService avisService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ResponseEntity<?> createAvis(@RequestBody AvisRequest request, Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(avisService.createAvis(request, user.getId()));
    }

    @GetMapping("/agence")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<?> getMesAvis(Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(avisService.getAvisForAgence(user.getId()));
    }

    @PutMapping("/{id}/repondre")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<?> repondreAvis(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        avisService.repondreAvis(id, body.get("reponse"), user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<?> changerStatut(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        avisService.changerStatutAvis(id, body.get("statut"), user.getId());
        return ResponseEntity.ok().build();
    }
}
