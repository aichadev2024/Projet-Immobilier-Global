package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.DashboardStatsResponse;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.TypeBienRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

        private final UtilisateurRepository utilisateurRepository;
        private final BienRepository bienRepository;
        private final TypeBienRepository typeBienRepository;

        @Override
        public DashboardStatsResponse getStats() {

                // DEBUG: Afficher toutes les agences pour voir ce qu'il y a en base
                List<Utilisateur> allAgences = utilisateurRepository.findByRoleNom("AGENCE");
                System.out.println("=== DEBUG DASHBOARD ===");
                System.out.println("Nombre total d'agences trouvées: " + allAgences.size());
                for (Utilisateur agence : allAgences) {
                    System.out.println("Agence: " + agence.getNomUtilisateur() + 
                                     " | Email: " + agence.getEmail() + 
                                     " | Statut: " + agence.getStatut() + 
                                     " | Deleted: " + agence.getIsDeleted() +
                                     " | Role: " + (agence.getRole() != null ? agence.getRole().getNom() : "NULL"));
                }
                System.out.println("========================");

                // UTILISATEURS
                long totalUtilisateurs = utilisateurRepository.countByIsDeletedFalse();

                long comptesInactifs = utilisateurRepository.countByStatutAndIsDeletedFalse(
                                StatutUtilisateur.SUSPENDU);

                long agences = utilisateurRepository.countByRoleNom("AGENCE");

                long clients = utilisateurRepository.countByRole_NomAndIsDeletedFalse(
                                "UTILISATEUR");

                long typesBiens = typeBienRepository.countByIsDeletedFalse();

                long biensTotal = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted())
                                .count();

                long biensDisponibles = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.DISPONIBLE)
                                .count();

                long biensLoues = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.LOUE)
                                .count();

                long biensVendus = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.VENDU)
                                .count();

                long biensEnAttente = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.EN_ATTENTE)
                                .count();

                long biensValides = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.VALIDE)
                                .count();

                long biensRefuses = bienRepository.findAll()
                                .stream()
                                .filter(bien -> !bien.getIsDeleted() && bien.getStatutBien() == StatutBien.REFUSE)
                                .count();

                return DashboardStatsResponse.builder()
                                .totalUtilisateurs(totalUtilisateurs)
                                .comptesInactifs(comptesInactifs)
                                .agences(agences)
                                .clients(clients)
                                .typesBiens(typesBiens)
                                .biensTotal(biensTotal)
                                .biensDisponibles(biensDisponibles)
                                .biensLoues(biensLoues)
                                .biensVendus(biensVendus)
                                .biensEnAttente(biensEnAttente)
                                .biensValides(biensValides)
                                .biensRefuses(biensRefuses)
                                .build();
        }
}
