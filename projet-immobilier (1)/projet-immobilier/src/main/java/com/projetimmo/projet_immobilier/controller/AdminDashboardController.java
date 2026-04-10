package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.DashboardStatsResponse;
import com.projetimmo.projet_immobilier.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/stats")
    public DashboardStatsResponse getDashboardStats() {
        return dashboardService.getStats();
    }
}
