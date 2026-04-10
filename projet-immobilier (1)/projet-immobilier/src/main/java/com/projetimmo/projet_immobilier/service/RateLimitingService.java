package com.projetimmo.projet_immobilier.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class RateLimitingService {
    
    // Stockage des tentatives par IP
    private final Map<String, AttemptRecord> ipAttempts = new ConcurrentHashMap<>();
    
    // Limites
    private static final int MAX_ATTEMPTS_PER_HOUR = 3;
    private static final int MAX_ATTEMPTS_PER_DAY = 10;
    private static final int BLOCK_DURATION_HOURS = 24;
    
    /**
     * Vérifie si l'IP est autorisée à faire une tentative d'inscription
     */
    public boolean canAttemptRegistration(String clientIp) {
        if (clientIp == null) {
            clientIp = "unknown";
        }
        
        AttemptRecord record = ipAttempts.computeIfAbsent(clientIp, k -> new AttemptRecord());
        
        // Nettoyer les anciennes tentatives
        record.cleanupOldAttempts();
        
        // Vérifier si l'IP est bloquée
        if (record.isBlocked()) {
            log.warn("IP bloquée tentant de s'inscrire: {}", clientIp);
            return false;
        }
        
        // Vérifier les limites
        if (record.getAttemptsLastHour() >= MAX_ATTEMPTS_PER_HOUR) {
            log.warn("IP dépassant la limite horaire: {} - {} tentatives", 
                    clientIp, record.getAttemptsLastHour());
            record.block();
            return false;
        }
        
        if (record.getAttemptsLastDay() >= MAX_ATTEMPTS_PER_DAY) {
            log.warn("IP dépassant la limite journalière: {} - {} tentatives", 
                    clientIp, record.getAttemptsLastDay());
            record.block();
            return false;
        }
        
        // Enregistrer la tentative
        record.addAttempt();
        return true;
    }
    
    /**
     * Enregistrement des tentatives pour une IP
     */
    private static class AttemptRecord {
        private final Map<LocalDateTime, String> attempts = new ConcurrentHashMap<>();
        private LocalDateTime blockedUntil = null;
        
        public void addAttempt() {
            attempts.put(LocalDateTime.now(), "registration_attempt");
        }
        
        public void cleanupOldAttempts() {
            LocalDateTime now = LocalDateTime.now();
            attempts.entrySet().removeIf(entry -> 
                entry.getKey().isBefore(now.minusDays(1)));
        }
        
        public long getAttemptsLastHour() {
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            return attempts.entrySet().stream()
                .filter(entry -> entry.getKey().isAfter(oneHourAgo))
                .count();
        }
        
        public long getAttemptsLastDay() {
            LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
            return attempts.entrySet().stream()
                .filter(entry -> entry.getKey().isAfter(oneDayAgo))
                .count();
        }
        
        public boolean isBlocked() {
            return blockedUntil != null && blockedUntil.isAfter(LocalDateTime.now());
        }
        
        public void block() {
            blockedUntil = LocalDateTime.now().plusHours(BLOCK_DURATION_HOURS);
        }
    }
}
