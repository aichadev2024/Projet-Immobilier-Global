package com.projetimmo.projet_immobilier.dto;

import java.math.BigDecimal;

public record BienLoueDashboardDto(
        Long id,
        String libelle,
        String adresse,
        BigDecimal prix) {
}