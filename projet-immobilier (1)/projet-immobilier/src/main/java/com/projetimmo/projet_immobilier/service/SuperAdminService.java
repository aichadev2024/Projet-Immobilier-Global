package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.entity.SuperAdminRequest;
import com.projetimmo.projet_immobilier.repository.SuperAdminRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SuperAdminService {

    private final SuperAdminRequestRepository requestRepository;

    public SuperAdminRequest createRequest(SuperAdminRequest request) {
        // Vérifier si une demande existe déjà pour cet email ou username
        if (requestRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Une demande existe déjà pour cet email");
        }
        
        if (requestRepository.existsByNomUtilisateur(request.getNomUtilisateur())) {
            throw new RuntimeException("Une demande existe déjà pour ce nom d'utilisateur");
        }
        
        return requestRepository.save(request);
    }

    public Page<SuperAdminRequest> getAllRequests(Pageable pageable) {
        return requestRepository.findAllOrderByCreatedAtDesc(pageable);
    }

    public Page<SuperAdminRequest> searchRequests(String search, Pageable pageable) {
        return requestRepository.findBySearch(search, pageable);
    }

    public List<SuperAdminRequest> getPendingRequests() {
        return requestRepository.findByStatutOrderByCreatedAtDesc(SuperAdminRequest.RequestStatut.EN_ATTENTE);
    }

    public void validateRequest(Long requestId, String validatedBy) {
        SuperAdminRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        if (request.getStatut() != SuperAdminRequest.RequestStatut.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }
        
        request.setStatut(SuperAdminRequest.RequestStatut.VALIDEE);
        request.setValidatedBy(UUID.fromString(validatedBy)); // Adapter selon votre système
        request.setValidatedAt(LocalDateTime.now());
        
        requestRepository.save(request);
        
        // TODO: Créer l'utilisateur super admin ici
        // createSuperAdminUser(request);
        
        log.info("Demande de super admin {} validée par {}", requestId, validatedBy);
    }

    public void rejectRequest(Long requestId, String motif, String rejectedBy) {
        SuperAdminRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        if (request.getStatut() != SuperAdminRequest.RequestStatut.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }
        
        request.setStatut(SuperAdminRequest.RequestStatut.REFUSEE);
        request.setMotifRefus(motif);
        request.setValidatedBy(UUID.fromString(rejectedBy)); // Adapter selon votre système
        request.setValidatedAt(LocalDateTime.now());
        
        requestRepository.save(request);
        
        log.info("Demande de super admin {} rejetée par {} - motif: {}", requestId, rejectedBy, motif);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long total = requestRepository.count();
        long enAttente = requestRepository.countByStatut(SuperAdminRequest.RequestStatut.EN_ATTENTE);
        long validees = requestRepository.countByStatut(SuperAdminRequest.RequestStatut.VALIDEE);
        long refusees = requestRepository.countByStatut(SuperAdminRequest.RequestStatut.REFUSEE);
        
        stats.put("total", total);
        stats.put("enAttente", enAttente);
        stats.put("validees", validees);
        stats.put("refusees", refusees);
        stats.put("tauxValidation", total > 0 ? (double) validees / total * 100 : 0);
        
        return stats;
    }
    
    /*
    private void createSuperAdminUser(SuperAdminRequest request) {
        // Logique pour créer le compte super admin
        // Utilisateur utilisateur = new Utilisateur();
        // utilisateur.setNom(request.getNom());
        // utilisateur.setPrenom(request.getPrenom());
        // utilisateur.setEmail(request.getEmail());
        // utilisateur.setNomUtilisateur(request.getNomUtilisateur());
        // utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        // utilisateur.setRole(Role.SUPER_ADMIN);
        // utilisateur.setStatut(StatutUtilisateur.ACTIF);
        // utilisateurRepository.save(utilisateur);
    }
    */
}
