package com.projetimmo.projet_immobilier.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP Blacklist Filter
 * Blocks requests from blacklisted IP addresses
 * Can block malicious users, botnets, or specific regions
 */
@Component
@Order(3)
public class IpBlacklistFilter implements Filter {

    // Blacklisted IPs (in production, load from database or config file)
    private final Set<String> blacklistedIps = ConcurrentHashMap.newKeySet();

    // Whitelisted IPs that bypass the blacklist (admin IPs, etc.)
    private final Set<String> whitelistedIps = ConcurrentHashMap.newKeySet();

    public IpBlacklistFilter() {
        // Add example blacklisted IPs (reserved/private ranges for demo)
        // In production, load from database or external source
        blacklistedIps.add("192.168.0.100"); // Example malicious IP

        // Add whitelisted IPs
        whitelistedIps.add("127.0.0.1");
        whitelistedIps.add("0:0:0:0:0:0:0:1"); // IPv6 localhost
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIp(httpRequest);

        // Check whitelist first
        if (whitelistedIps.contains(clientIp)) {
            chain.doFilter(request, response);
            return;
        }

        // Check blacklist
        if (isBlacklisted(clientIp)) {
            httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN,
                "Access denied. Your IP address has been blacklisted.");
            return;
        }

        // Check if IP is in a blocked region (CIDR block check)
        if (isInBlockedRange(clientIp)) {
            httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN,
                "Access denied. Requests from your region are not allowed.");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private boolean isBlacklisted(String ip) {
        return blacklistedIps.contains(ip);
    }

    private boolean isInBlockedRange(String ip) {
        // Example: block specific CIDR ranges
        // In production, implement proper CIDR matching
        // For now, simple prefix matching as demo
        String[] blockedRanges = {"10.0.0.", "172.16."};
        for (String range : blockedRanges) {
            if (ip.startsWith(range)) {
                return true;
            }
        }
        return false;
    }

    // Admin methods to manage blacklist
    public void addToBlacklist(String ip) {
        blacklistedIps.add(ip);
    }

    public void removeFromBlacklist(String ip) {
        blacklistedIps.remove(ip);
    }

    public void addToWhitelist(String ip) {
        whitelistedIps.add(ip);
    }

    public Set<String> getBlacklistedIps() {
        return Set.copyOf(blacklistedIps);
    }
}
