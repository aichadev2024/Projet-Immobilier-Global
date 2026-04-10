package com.projetimmo.projet_immobilier.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClientDashboardStatsDto {

    private long total;
    private long enAttente;
    private long confirmees;
    private long annulees;
}