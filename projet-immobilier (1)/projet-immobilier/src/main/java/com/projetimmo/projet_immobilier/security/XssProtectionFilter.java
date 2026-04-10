package com.projetimmo.projet_immobilier.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * XSS Protection Filter
 * Adds security headers to prevent XSS attacks
 * Sanitizes input parameters to remove script tags
 */
@Component
@Order(4)
public class XssProtectionFilter implements Filter {

    // Pattern to detect script tags and event handlers
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "<script[^>]*>.*?</script>|" +
        "<script[^>]*>|" +
        "</script>|" +
        "javascript:|" +
        "on\\w+\\s*=|" +
        "<iframe[^>]*>|" +
        "<object[^>]*>|" +
        "<embed[^>]*>|" +
        "expression\\s*\\(|" +
        "eval\\s*\\(" +
        "<link[^>]*stylesheet[^>]*>|" +
        "<style[^>]*>.*?</style>",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Add XSS protection headers
        addSecurityHeaders(httpResponse);

        // Create wrapped request that sanitizes input
        XssRequestWrapper wrappedRequest = new XssRequestWrapper(httpRequest);

        chain.doFilter(wrappedRequest, response);
    }

    private void addSecurityHeaders(HttpServletResponse response) {
        // Prevent MIME sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Enable XSS filter in browser
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Content Security Policy - restrict sources of scripts
        response.setHeader("Content-Security-Policy",
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data: https:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';");

        // Prevent clickjacking
        response.setHeader("X-Frame-Options", "DENY");

        // Referrer policy
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    }

    /**
     * Request wrapper that sanitizes all input parameters
     */
    private static class XssRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {

        public XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return sanitize(value);
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;

            String[] sanitized = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                sanitized[i] = sanitize(values[i]);
            }
            return sanitized;
        }

        @Override
        public java.util.Map<String, String[]> getParameterMap() {
            java.util.Map<String, String[]> map = super.getParameterMap();
            java.util.Map<String, String[]> sanitizedMap = new java.util.HashMap<>();

            for (java.util.Map.Entry<String, String[]> entry : map.entrySet()) {
                String[] values = entry.getValue();
                String[] sanitized = new String[values.length];
                for (int i = 0; i < values.length; i++) {
                    sanitized[i] = sanitize(values[i]);
                }
                sanitizedMap.put(entry.getKey(), sanitized);
            }
            return sanitizedMap;
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            return sanitize(value);
        }

        private String sanitize(String input) {
            if (input == null) return null;

            // Remove script tags and event handlers
            String sanitized = XSS_PATTERN.matcher(input).replaceAll("");

            // HTML encode special characters
            sanitized = sanitized
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .replace("/", "&#x2F;");

            return sanitized;
        }
    }
}
