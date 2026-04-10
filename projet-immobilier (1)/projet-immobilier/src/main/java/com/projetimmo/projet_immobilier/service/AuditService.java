package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.entity.AuditLog;
import com.projetimmo.projet_immobilier.enums.ActionAudit;
import com.projetimmo.projet_immobilier.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    /**
     * Enregistre un événement de sécurité dans la base de données
     */
    @Transactional
    public void logSecurityEvent(ActionAudit action, String email, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .email(email)
                .details(details)
                .ip(ipAddress)
                .date(LocalDateTime.now())
                .build();
        
        auditLogRepository.save(auditLog);
        
        // Log structuré pour monitoring
        String logMessage = String.format(
                "SECURITY_AUDIT | Action: %s | User: %s | IP: %s | Details: %s",
                action, email, ipAddress, details
        );
        
        switch (action) {
            case LOGIN_SUCCESS:
            case REGISTER:
            case VERIFY_OTP:
            case LOGOUT:
                log.info(logMessage);
                break;
            case LOGIN_FAIL:
            case ACCOUNT_LOCKED:
                log.warn(logMessage);
                break;
            default:
                log.info(logMessage);
        }
    }
}
