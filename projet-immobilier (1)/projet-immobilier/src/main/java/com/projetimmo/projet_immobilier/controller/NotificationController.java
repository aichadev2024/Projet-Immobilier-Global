package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.service.interfaces.NotificationService;
import com.projetimmo.projet_immobilier.dto.NotificationResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class NotificationController {

    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMesNotifications(Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body("Utilisateur non trouvé");
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getId()));
    }

    @GetMapping("/non-lues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getNombreNotificationsNonLues(Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(0L);
        return ResponseEntity.ok(notificationService.getNombreNotificationsNonLues(user.getId()));
    }

    @PutMapping("/{id}/marquer-lu")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> marquerCommeLu(@PathVariable Long id, Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/marquer-toutes-lues")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> marquerToutesLues(Authentication auth) {
        Utilisateur user = utilisateurRepository.findByNomUtilisateur(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
