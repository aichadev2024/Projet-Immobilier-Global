package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.security.IpBlacklistFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Security Admin Controller
 * Manage security settings: IP blacklist, rate limits, etc.
 * Only accessible by SUPER_ADMIN
 */
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SecurityController {

    private final IpBlacklistFilter ipBlacklistFilter;

    /**
     * Add an IP to the blacklist
     */
    @PostMapping("/blacklist/ip")
    public ResponseEntity<Map<String, String>> addToBlacklist(@RequestBody Map<String, String> request) {
        String ip = request.get("ip");
        if (ip == null || ip.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "IP address required"));
        }

        ipBlacklistFilter.addToBlacklist(ip);
        return ResponseEntity.ok(Map.of("message", "IP " + ip + " added to blacklist"));
    }

    /**
     * Remove an IP from the blacklist
     */
    @DeleteMapping("/blacklist/ip/{ip}")
    public ResponseEntity<Map<String, String>> removeFromBlacklist(@PathVariable String ip) {
        ipBlacklistFilter.removeFromBlacklist(ip);
        return ResponseEntity.ok(Map.of("message", "IP " + ip + " removed from blacklist"));
    }

    /**
     * Get all blacklisted IPs
     */
    @GetMapping("/blacklist/ip")
    public ResponseEntity<Set<String>> getBlacklistedIps() {
        return ResponseEntity.ok(ipBlacklistFilter.getBlacklistedIps());
    }

    /**
     * Add an IP to the whitelist
     */
    @PostMapping("/whitelist/ip")
    public ResponseEntity<Map<String, String>> addToWhitelist(@RequestBody Map<String, String> request) {
        String ip = request.get("ip");
        if (ip == null || ip.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "IP address required"));
        }

        ipBlacklistFilter.addToWhitelist(ip);
        return ResponseEntity.ok(Map.of("message", "IP " + ip + " added to whitelist"));
    }

    /**
     * Get security status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSecurityStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("pathTraversalProtection", true);
        status.put("rateLimiting", true);
        status.put("ipBlacklist", true);
        status.put("xssProtection", true);
        status.put("bodyXssScanner", true);
        status.put("blacklistedIpsCount", ipBlacklistFilter.getBlacklistedIps().size());

        return ResponseEntity.ok(status);
    }
}
