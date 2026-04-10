package com.projetimmo.projet_immobilier.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiter Filter
 * Limits requests to 100 per minute per IP address
 * Prevents brute force attacks, API abuse, and DDoS
 */
@Component
@Order(2)
public class RateLimitFilter implements Filter {

    // Maximum requests per window
    private static final int MAX_REQUESTS = 100;

    // Time window in seconds (1 minute)
    private static final long WINDOW_SECONDS = 60;

    // Store request counts per IP
    private final Map<String, IpRequestData> ipRequestMap = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIp(httpRequest);
        long now = Instant.now().getEpochSecond();

        IpRequestData requestData = ipRequestMap.computeIfAbsent(clientIp, k -> new IpRequestData(now, 0));

        synchronized (requestData) {
            // Reset if window has passed
            if (now - requestData.windowStart >= WINDOW_SECONDS) {
                requestData.windowStart = now;
                requestData.requestCount = 0;
            }

            // Check limit
            if (requestData.requestCount >= MAX_REQUESTS) {
                long retryAfter = WINDOW_SECONDS - (now - requestData.windowStart);
                httpResponse.setHeader("Retry-After", String.valueOf(retryAfter));
                httpResponse.sendError(
                    429, // Too Many Requests
                    "Rate limit exceeded. Max " + MAX_REQUESTS + " requests per " + WINDOW_SECONDS + " seconds."
                );
                return;
            }

            requestData.requestCount++;
        }

        // Add rate limit headers
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS));
        httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(MAX_REQUESTS - requestData.requestCount));

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

    private static class IpRequestData {
        long windowStart;
        int requestCount;

        IpRequestData(long windowStart, int requestCount) {
            this.windowStart = windowStart;
            this.requestCount = requestCount;
        }
    }
}
