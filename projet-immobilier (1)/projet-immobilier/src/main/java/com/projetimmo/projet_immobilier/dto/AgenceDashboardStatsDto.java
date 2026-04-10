package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;

@Builder
public record AgenceDashboardStatsDto(
        long biensTotal,
        long biensDisponibles,
        long biensLoues,
        long biensVendus) {
}