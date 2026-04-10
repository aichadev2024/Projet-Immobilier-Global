package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {

    private long totalUtilisateurs;
    private long comptesInactifs;
    private long agences;
    private long clients;

    private long typesBiens;

    private long biensTotal;
    private long biensDisponibles;
    private long biensLoues;
    private long biensVendus;
    private long biensEnAttente;
    private long biensValides;
    private long biensRefuses;

}
