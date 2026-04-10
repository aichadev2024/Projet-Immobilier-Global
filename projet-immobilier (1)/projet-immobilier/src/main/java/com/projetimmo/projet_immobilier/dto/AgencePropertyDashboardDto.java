package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.StatutBien;
import java.math.BigDecimal;

public record AgencePropertyDashboardDto(
        Long id,
        String libelle,
        String adresse,
        BigDecimal prixCalculer,
        StatutBien statutBien) {
}