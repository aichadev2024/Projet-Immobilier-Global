package com.projetimmo.projet_immobilier.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * Path Traversal Protection Filter
 * Blocks requests containing path traversal sequences like ../ or ..\
 * Prevents attackers from accessing files outside the intended directory
 */
@Component
@Order(1)
public class PathTraversalFilter implements Filter {

    // Pattern to detect path traversal attempts
    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile(
        "(\\.\\./|\\.\\.\\\\|\\.\\./|\\.\\.\\\\|%2e%2e%2f|%2e%2e/|\\.\\./|\\.\\.\\\\)",
        Pattern.CASE_INSENSITIVE
    );

    // Pattern to detect null bytes (often used to bypass filters)
    private static final Pattern NULL_BYTE_PATTERN = Pattern.compile("\\x00|%00");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();

        // Check URI for path traversal
        if (containsPathTraversal(uri)) {
            httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN, "Path traversal attempt detected");
            return;
        }

        // Check query string for path traversal
        if (queryString != null && containsPathTraversal(queryString)) {
            httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN, "Path traversal in query parameters detected");
            return;
        }

        // Check all parameter values
        java.util.Enumeration<String> paramNames = httpRequest.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String[] values = httpRequest.getParameterValues(paramName);
            if (values != null) {
                for (String value : values) {
                    if (containsPathTraversal(value)) {
                        httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN, "Path traversal in parameters detected");
                        return;
                    }
                }
            }
        }

        chain.doFilter(request, response);
    }

    private boolean containsPathTraversal(String input) {
        if (input == null) return false;
        return PATH_TRAVERSAL_PATTERN.matcher(input).find() ||
               NULL_BYTE_PATTERN.matcher(input).find() ||
               input.toLowerCase().contains("../") ||
               input.toLowerCase().contains("..\\");
    }
}
