package com.projetimmo.projet_immobilier.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Body XSS Scanner Filter
 * Scans HTTP request bodies for XSS attacks
 * Detects script tags in POST/PUT request bodies (JSON, form data, etc.)
 */
@Component
@Order(5)
public class BodyXssScannerFilter implements Filter {

    // XSS patterns to detect in request body
    private static final Pattern XSS_BODY_PATTERN = Pattern.compile(
        "<script[^>]*>.*?</script>|" +
        "<script[^>]*>|" +
        "</script>|" +
        "javascript:|" +
        "on\\w+\\s*=\\s*\"[^\"]*\"|" +
        "on\\w+\\s*=\\s*'[^']*'|" +
        "on\\w+\\s*=\\s*[^\\s>]+|" +
        "<iframe[^>]*>|" +
        "<object[^>]*>|" +
        "<embed[^>]*>|" +
        "eval\\s*\\(|" +
        "expression\\s*\\(|" +
        "alert\\s*\\(|" +
        "confirm\\s*\\(|" +
        "prompt\\s*\\(|" +
        "document\\.cookie|" +
        "document\\.write|" +
        "window\\.location|" +
        "<link[^>]*stylesheet[^>]*>|" +
        "<style[^>]*>.*?</style>|" +
        "<!--.*?(?:-->)|" +
        "\\x3cscript|" +
        "\\x3Cscript|" +
        "%3Cscript|%3cscript|" +
        "&#x3C;script|&#x3c;script",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Only scan POST, PUT, PATCH requests
        String method = httpRequest.getMethod();
        if (!"POST".equals(method) && !"PUT".equals(method) && !"PATCH".equals(method)) {
            chain.doFilter(request, response);
            return;
        }

        // Wrap request to capture body
        ContentCachingRequestWrapper cachedRequest = new ContentCachingRequestWrapper(httpRequest);

        // Let the request proceed to populate the cache
        chain.doFilter(cachedRequest, response);

        // After chain, read the cached body and scan it
        byte[] body = cachedRequest.getContentAsByteArray();
        if (body.length > 0) {
            String bodyContent = new String(body, StandardCharsets.UTF_8);

            if (containsXss(bodyContent)) {
                // Log the attempt (in production, use proper logging)
                System.err.println("🛡️ XSS DETECTED in request body from " + getClientIp(httpRequest));
                System.err.println("Path: " + httpRequest.getRequestURI());

                // Send error response
                httpResponse.reset();
                httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                httpResponse.setContentType("application/json");
                httpResponse.setCharacterEncoding("UTF-8");
                httpResponse.getWriter().write(
                    "{\"error\":\"XSS detected\",\"message\":\"Malicious content detected in request body\"}"
                );
                return;
            }
        }
    }

    private boolean containsXss(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }

        // Check against XSS patterns
        if (XSS_BODY_PATTERN.matcher(content).find()) {
            return true;
        }

        // Check for encoded variations
        String lower = content.toLowerCase();
        if (lower.contains("<script") ||
            lower.contains("javascript:") ||
            lower.contains("onerror=") ||
            lower.contains("onload=") ||
            lower.contains("onclick=") ||
            lower.contains("onmouseover=") ||
            lower.contains("eval(") ||
            lower.contains("document.cookie")) {
            return true;
        }

        return false;
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
}
