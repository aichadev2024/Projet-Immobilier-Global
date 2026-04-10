package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.ClientDashboardStatsDto;
import com.projetimmo.projet_immobilier.dto.ReservationRequest;
import com.projetimmo.projet_immobilier.dto.ReservationResponse;
import java.util.List;

public interface ReservationService {
    ReservationResponse creerReservation(ReservationRequest request);

    List<ReservationResponse> listerReservationsParBien(Long idBien);

    void confirmerReservation(Long id);

    void annulerReservation(Long id);

    List<ReservationResponse> mesReservations();

    List<ReservationResponse> mesReservationsAgence();

    ClientDashboardStatsDto getDashboardStats();
}
