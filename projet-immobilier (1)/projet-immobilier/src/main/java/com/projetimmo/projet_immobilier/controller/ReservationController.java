package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.ClientDashboardStatsDto;
import com.projetimmo.projet_immobilier.dto.ReservationRequest;
import com.projetimmo.projet_immobilier.dto.ReservationResponse;
import com.projetimmo.projet_immobilier.service.interfaces.ReservationService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ReservationResponse creer(@RequestBody ReservationRequest request) {
        return reservationService.creerReservation(request);
    }

    @GetMapping("/bien/{idBien}")
    public List<ReservationResponse> reservationsParBien(@PathVariable Long idBien) {
        return reservationService.listerReservationsParBien(idBien);
    }

    @PostMapping("/{id}/confirmer")
    @PreAuthorize("hasRole('AGENCE')")
    public void confirmer(@PathVariable Long id) {
        reservationService.confirmerReservation(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public void annuler(@PathVariable Long id) {
        reservationService.annulerReservation(id);
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public ClientDashboardStatsDto getDashboardStats() {
        return reservationService.getDashboardStats();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public List<ReservationResponse> mesReservations() {
        return reservationService.mesReservations();
    }

    @GetMapping("/utilisateur")
    @PreAuthorize("hasRole('UTILISATEUR')")
    public List<ReservationResponse> mesReservationsUtilisateur() {
        return reservationService.mesReservations();
    }

    @GetMapping("/agence")
    @PreAuthorize("hasRole('AGENCE')")
    public List<ReservationResponse> mesReservationsAgence() {
        return reservationService.mesReservationsAgence();
    }
}
