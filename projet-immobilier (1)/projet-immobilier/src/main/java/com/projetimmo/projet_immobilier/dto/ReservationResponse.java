package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private LocalDateTime dateVisite;
    private String statut;
    private LocalDateTime dateReservation;
    private Long idBien;
    private String libelleBien;
    private String adresseBien;
    private UUID idClient;
    private String nomClient;
    private String prenomClient;
}
