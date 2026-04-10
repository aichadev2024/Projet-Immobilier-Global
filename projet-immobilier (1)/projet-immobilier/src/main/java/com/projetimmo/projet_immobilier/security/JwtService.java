package com.projetimmo.projet_immobilier.security;

import com.projetimmo.projet_immobilier.service.TokenBlacklistService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretManager secretManager;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtService(SecretManager secretManager, TokenBlacklistService tokenBlacklistService) {
        this.secretManager = secretManager;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Value("${jwt.expiration:86400000}") // 24 heures par défaut
    private long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 jours pour refresh token
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        String secret = secretManager.getJwtSecret();
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // GENERATE ACCESS TOKEN
    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("type", "access");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // GENERATE REFRESH TOKEN
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .claim("type", "refresh")
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // EXTRACT USERNAME
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // EXTRACT ROLE
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // EXTRACT TOKEN TYPE
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    // EXPIRATION DATE
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // GENERIC CLAIM EXTRACTION
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // EXTRACT ALL CLAIMS
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // TOKEN VALIDATION
    public boolean isTokenValid(String token) {
        try {
            // SÉCURITÉ : Vérifier si le token est blacklisté
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                return false;
            }
            
            String tokenType = extractTokenType(token);
            if (!"access".equals(tokenType)) {
                return false;
            }
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // REFRESH TOKEN VALIDATION
    public boolean isRefreshTokenValid(String token) {
        try {
            String tokenType = extractTokenType(token);
            if (!"refresh".equals(tokenType)) {
                return false;
            }
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // TOKEN EXPIRED CHECK
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // TOKEN TIME UNTIL EXPIRATION
    public long getTimeUntilExpiration(String token) {
        return extractExpiration(token).getTime() - System.currentTimeMillis();
    }
}