package com.projetimmo.projet_immobilier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    private Long idBien;
    private LocalDateTime dateVisite;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
}
