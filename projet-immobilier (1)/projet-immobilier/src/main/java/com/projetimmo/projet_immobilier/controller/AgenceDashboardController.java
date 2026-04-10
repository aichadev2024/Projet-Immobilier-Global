package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.dto.AgencePropertyDashboardDto;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
import java.util.List;

import com.projetimmo.projet_immobilier.dto.BienLoueDashboardDto;
import com.projetimmo.projet_immobilier.dto.AgenceDashboardStatsDto;

@RestController
@RequestMapping("/api/agence/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCE')")
public class AgenceDashboardController {

        private final BienRepository bienRepository;
        private final UtilisateurRepository utilisateurRepository;

        // 
        @GetMapping("/stats")
        public AgenceDashboardStatsDto getStats(Authentication authentication) {
                Utilisateur user = utilisateurRepository.findByNomUtilisateur(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                UUID agenceId = user.getAgence().getId();

                // Utilisation de findAll() avec filtres stream pour éviter les erreurs HQL
                long total = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(agenceId))
                                .count();
                
                long disponibles = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(agenceId) && bien.getStatutBien() == StatutBien.DISPONIBLE)
                                .count();
                
                long loues = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(agenceId) && bien.getStatutBien() == StatutBien.LOUE)
                                .count();
                
                long vendus = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(agenceId) && bien.getStatutBien() == StatutBien.VENDU)
                                .count();

                return AgenceDashboardStatsDto.builder()
                                .biensTotal(total)
                                .biensDisponibles(disponibles)
                                .biensLoues(loues)
                                .biensVendus(vendus)
                                .build();
        }

        // 
        @GetMapping("/proprietes")
        public List<AgencePropertyDashboardDto> getProprietes(Authentication authentication) {
                Utilisateur user = utilisateurRepository.findByNomUtilisateur(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                return bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(user.getAgence().getId()))
                                .map(b -> new AgencePropertyDashboardDto(
                                                b.getId(),
                                                b.getLibelle(),
                                                b.getAdresse(),
                                                b.getPrixCalculer(),
                                                b.getStatutBien()))
                                .toList();
        }

        // 
        @GetMapping("/biens-loues")
        public List<BienLoueDashboardDto> getBiensLoues(Authentication authentication) {
                Utilisateur user = utilisateurRepository.findByNomUtilisateur(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                return bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getAgence().getId().equals(user.getAgence().getId()) && bien.getStatutBien() == StatutBien.LOUE)
                                .map(b -> new BienLoueDashboardDto(
                                                b.getId(),
                                                b.getLibelle(),
                                                b.getAdresse(),
                                                b.getPrixCalculer()))
                                .toList();
        }
}