package com.projetimmo.projet_immobilier.service;

import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class LoginAttemptService {

    private final UtilisateurRepository utilisateurRepository;

    // IP-based limiting remains in memory (standard practice for brute force)
    private final Map<String, AttemptRecord> ipAttempts = new ConcurrentHashMap<>();

    private static final int MAX_ATTEMPTS_PER_IP = 15;
    private static final int MAX_ATTEMPTS_PER_USER = 5;
    private static final int LOCK_TIME_DURATION_MINUTES = 15;

    /**
     * Records a failed login attempt. Locks user if threshold reached.
     */
    @Transactional
    public void recordFailedAttempt(String clientIp, String email) {
        // IP Record
        ipAttempts.computeIfAbsent(clientIp, k -> new AttemptRecord()).addAttempt();

        // User Record
        utilisateurRepository.findByEmail(email).ifPresent(user -> {
            int attempts = (user.getFailedAttempt() == 0 ? 0 : user.getFailedAttempt()) + 1;
            user.setFailedAttempt(attempts);

            if (attempts >= MAX_ATTEMPTS_PER_USER) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now().plusMinutes(LOCK_TIME_DURATION_MINUTES));
                log.warn("Account locked for user: {} due to too many failed attempts", email);
            }
            utilisateurRepository.save(user);
        });
    }

    /**
     * Resets failed attempts for a user on successful login.
     */
    @Transactional
    public void recordSuccessfulAttempt(String clientIp, String email) {
        ipAttempts.remove(clientIp);
        utilisateurRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedAttempt(0);
            user.setAccountNonLocked(true);
            user.setLockTime(null);
            utilisateurRepository.save(user);
        });
    }

    public boolean isBlocked(String clientIp, String email) {
        // Check IP block
        AttemptRecord ipRecord = ipAttempts.get(clientIp);
        if (ipRecord != null && ipRecord.getRecentAttempts() >= MAX_ATTEMPTS_PER_IP) {
            log.warn("IP blocked: {}", clientIp);
            return true;
        }

        // Check User block
        return utilisateurRepository.findByEmail(email)
                .map(user -> {
                    if (user.getAccountNonLocked() != null && user.getAccountNonLocked()) {
                        return false;
                    }
                    if (user.getLockTime() != null && user.getLockTime().isBefore(LocalDateTime.now())) {
                        // Lock expired
                        user.setAccountNonLocked(true);
                        user.setFailedAttempt(0);
                        user.setLockTime(null);
                        utilisateurRepository.save(user);
                        return false;
                    }
                    return true;
                }).orElse(false);
    }

    private static class AttemptRecord {
        private final Map<LocalDateTime, String> attempts = new ConcurrentHashMap<>();

        public void addAttempt() {
            attempts.put(LocalDateTime.now(), "attempt");
        }

        public long getRecentAttempts() {
            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
            return attempts.keySet().stream().filter(t -> t.isAfter(cutoff)).count();
        }
    }
}
