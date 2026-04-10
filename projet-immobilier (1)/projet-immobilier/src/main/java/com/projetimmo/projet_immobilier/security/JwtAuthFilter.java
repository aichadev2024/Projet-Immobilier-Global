package com.projetimmo.projet_immobilier.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/") || 
               path.startsWith("/public/") ||
               path.equals("/health");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            
            log.debug("DEBUG - Token reçu: {}", token.substring(0, Math.min(50, token.length())) + "...");
            
            // Validation du token
            if (!jwtService.isTokenValid(token)) {
                log.error("DEBUG - Token invalide ou expiré");
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                    "Invalid or expired token", "JWT_INVALID");
                return;
            }

            String username = jwtService.extractUsername(token);
            String role = jwtService.extractRole(token);
            
            log.debug("DEBUG - Username extrait: {}", username);
            log.debug("DEBUG - Role extrait: {}", role);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                
                log.debug("DEBUG - Autorités créées: {}", authorities);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.info("User {} authenticated successfully with role {}", username, role);
            }

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                "Token expired", "JWT_EXPIRED");
            return;
        } catch (io.jsonwebtoken.security.SecurityException e) {
            log.error("JWT security exception: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                "Invalid token signature", "JWT_SECURITY");
            return;
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("JWT malformed: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, 
                "Malformed token", "JWT_MALFORMED");
            return;
        } catch (Exception e) {
            log.error("Unexpected error during JWT processing: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Authentication error", "JWT_ERROR");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, 
                                 String message, String errorCode) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> errorResponse = Map.of(
            "error", true,
            "message", message,
            "code", errorCode,
            "timestamp", System.currentTimeMillis()
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}