package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Avis;
import com.projetimmo.projet_immobilier.entity.Reservation;
import com.projetimmo.projet_immobilier.enums.StatutReservation;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.StatutContact;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.ReservationRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.repository.ContactAgenceRepository;
import com.projetimmo.projet_immobilier.repository.AvisRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StatsController {

    private final BienRepository bienRepository;
    private final ReservationRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ContactAgenceRepository contactAgenceRepository;
    private final AvisRepository avisRepository;

    public StatsController(BienRepository bienRepository, 
                          ReservationRepository reservationRepository,
                          UtilisateurRepository utilisateurRepository,
                          ContactAgenceRepository contactAgenceRepository,
                          AvisRepository avisRepository) {
        this.bienRepository = bienRepository;
        this.reservationRepository = reservationRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.contactAgenceRepository = contactAgenceRepository;
        this.avisRepository = avisRepository;
    }

    @GetMapping("/utilisateur")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ResponseEntity<Map<String, Object>> getUtilisateurStats(Authentication authentication) {
        String email = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        
        Map<String, Object> stats = new HashMap<>();
        
        if (utilisateur != null) {
            // Total biens disponibles (annonces actives)
            long totalAnnonces = bienRepository.findByIsDeletedFalse().stream()
                    .filter(b -> b.getStatutBien().toString().equals("PUBLIE"))
                    .count();
            
            // Nombre de réservations de l'utilisateur
            long totalReservations = reservationRepository.countByUtilisateurAndIsDeletedFalse(utilisateur);
            
            // Visites confirmées (réservations avec statut CONFIRMEE)
            long visitesConfirmees = reservationRepository.countByUtilisateurAndStatutAndIsDeletedFalse(
                    utilisateur, StatutReservation.CONFIRMEE);
            
            // Visites en attente
            long visitesEnAttente = reservationRepository.countByUtilisateurAndStatutAndIsDeletedFalse(
                    utilisateur, StatutReservation.EN_ATTENTE);
            
            stats.put("totalAnnonces", totalAnnonces);
            stats.put("annoncesFavorites", totalReservations); // On utilise les réservations comme proxy
            stats.put("visitesConfirmees", visitesConfirmees);
            stats.put("visitesEnAttente", visitesEnAttente);
            stats.put("totalReservations", totalReservations);
            stats.put("recherchesRecentes", 0); // À implémenter si besoin
            stats.put("biensConsultes", 0); // À implémenter si besoin
        } else {
            // Fallback si utilisateur non trouvé
            stats.put("totalAnnonces", 0);
            stats.put("annoncesFavorites", 0);
            stats.put("visitesConfirmees", 0);
            stats.put("visitesEnAttente", 0);
            stats.put("totalReservations", 0);
            stats.put("recherchesRecentes", 0);
            stats.put("biensConsultes", 0);
        }
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/agence")
    @PreAuthorize("hasRole('AGENCE')")
    public ResponseEntity<Map<String, Object>> getAgenceStats(Authentication authentication) {
        String email = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        
        if (utilisateur == null || utilisateur.getAgence() == null) {
            return ResponseEntity.ok(getDefaultAgenceStats());
        }
        
        Agence agence = utilisateur.getAgence();
        UUID agenceId = agence.getId();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Statistiques des biens de l'agence
        long totalBiens = bienRepository.countByAgenceAndStatut(agenceId, null);
        long biensDisponibles = bienRepository.countByAgenceAndStatut(agenceId, StatutBien.DISPONIBLE);
        long biensVendus = bienRepository.countByAgenceAndStatut(agenceId, StatutBien.VENDU);
        long biensLoues = bienRepository.countByAgenceAndStatut(agenceId, StatutBien.LOUE);
        long biensEnAttente = bienRepository.countByAgenceAndStatut(agenceId, StatutBien.EN_ATTENTE);
        
        // Demandes de visite pour les biens de l'agence
        List<Reservation> reservationsAgence = reservationRepository.findByBienAgenceAndIsDeletedFalse(agence);
        long demandesVisite = reservationsAgence.size();
        long visitesConfirmees = reservationsAgence.stream()
                .filter(r -> r.getStatut() == StatutReservation.CONFIRMEE)
                .count();
        long visitesEnAttente = reservationsAgence.stream()
                .filter(r -> r.getStatut() == StatutReservation.EN_ATTENTE)
                .count();
        
        // Messages/contacts non lus
        long messagesNonLus = contactAgenceRepository.countByAgenceIdAndStatut(agenceId, StatutContact.LU);
        long totalMessages = contactAgenceRepository.findByAgenceIdOrderByDateContactDesc(agenceId).size();
        
        // Nouveaux clients (clients ayant fait une réservation ou contact récemment - 30 derniers jours)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long nouveauxClients = reservationRepository.findByBienAgenceAndIsDeletedFalse(agence).stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(thirtyDaysAgo))
                .map(r -> r.getUtilisateur().getId())
                .distinct()
                .count();
        
        // Note moyenne de l'agence
        List<Avis> avisAgence = avisRepository.findByAgenceIdOrderByDateCreationDesc(agenceId);
        double noteMoyenne = avisAgence.isEmpty() ? 0.0 : 
                avisAgence.stream().mapToInt(Avis::getNote).average().orElse(0.0);
        
        stats.put("totalAnnonces", totalBiens);
        stats.put("annoncesActives", biensDisponibles);
        stats.put("biensVendus", biensVendus);
        stats.put("biensLoues", biensLoues);
        stats.put("biensEnAttente", biensEnAttente);
        stats.put("demandesVisite", demandesVisite);
        stats.put("visitesConfirmees", visitesConfirmees);
        stats.put("visitesEnAttente", visitesEnAttente);
        stats.put("messagesNonLus", messagesNonLus);
        stats.put("totalMessages", totalMessages);
        stats.put("nouveauxClients", nouveauxClients);
        stats.put("noteMoyenne", Math.round(noteMoyenne * 10.0) / 10.0);
        stats.put("totalAvis", avisAgence.size());
        
        return ResponseEntity.ok(stats);
    }
    
    private Map<String, Object> getDefaultAgenceStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAnnonces", 0);
        stats.put("annoncesActives", 0);
        stats.put("biensVendus", 0);
        stats.put("biensLoues", 0);
        stats.put("biensEnAttente", 0);
        stats.put("demandesVisite", 0);
        stats.put("visitesConfirmees", 0);
        stats.put("visitesEnAttente", 0);
        stats.put("messagesNonLus", 0);
        stats.put("totalMessages", 0);
        stats.put("nouveauxClients", 0);
        stats.put("noteMoyenne", 0.0);
        stats.put("totalAvis", 0);
        return stats;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", 1247);
        stats.put("totalAgences", 89);
        stats.put("totalAnnonces", 3421);
        stats.put("activeUsers", 892);
        stats.put("pendingValidations", 12);
        stats.put("recentRegistrations", 45);
        return ResponseEntity.ok(stats);
    }
}
