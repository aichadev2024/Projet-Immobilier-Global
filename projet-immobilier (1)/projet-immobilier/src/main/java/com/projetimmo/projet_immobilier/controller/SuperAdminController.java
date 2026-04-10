package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.entity.SuperAdminRequest;
import com.projetimmo.projet_immobilier.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/superadmin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> requestSuperAdmin(@Valid @RequestBody SuperAdminRequest request, Authentication authentication) {
        try {
            // Récupérer l'utilisateur connecté
            String username = authentication.getName();
            request.setRequestedBy(UUID.fromString(username)); // Adapter selon votre système
            
            SuperAdminRequest savedRequest = superAdminService.createRequest(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande de super administrateur soumise avec succès");
            response.put("requestId", savedRequest.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la demande de super admin", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<SuperAdminRequest>> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<SuperAdminRequest> requests;
        
        if (search != null && !search.trim().isEmpty()) {
            requests = superAdminService.searchRequests(search, pageable);
        } else {
            requests = superAdminService.getAllRequests(pageable);
        }
        
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/requests/{requestId}/validate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> validateRequest(@PathVariable Long requestId, Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            superAdminService.validateRequest(requestId, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande validée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la validation de la demande", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/requests/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId, 
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {
        
        try {
            String motif = requestBody.get("motif");
            String adminUsername = authentication.getName();
            
            superAdminService.rejectRequest(requestId, motif, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande rejetée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors du rejet de la demande", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = superAdminService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des statistiques", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/requests/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getPendingRequests() {
        try {
            var pendingRequests = superAdminService.getPendingRequests();
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des demandes en attente", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
