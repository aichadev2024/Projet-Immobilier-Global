package com.projetimmo.projet_immobilier.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.*;
import org.springframework.security.web.csrf.*;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final CustomUserDetailsService customUserDetailsService;
        private final CsrfTokenRepository csrfTokenRepository;
        private final CsrfTokenRequestHandler csrfTokenRequestHandler;
        private final JwtAuthenticationEntryPoint authenticationEntryPoint;
        private final CustomAccessDeniedHandler accessDeniedHandler;

        @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
        private List<String> allowedOrigins;

        @Value("${app.security.require-https:true}")
        private boolean requireHttps;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(csrfTokenRepository)
                                                .csrfTokenRequestHandler(csrfTokenRequestHandler)
                                                .ignoringRequestMatchers("/auth/**", "/public/**", "/api/**"))
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(authenticationEntryPoint)
                                                .accessDeniedHandler(accessDeniedHandler))
                                .headers(headers -> headers
                                                .frameOptions(frameOptions -> frameOptions.deny())
                                                .contentTypeOptions(contentTypeOptions -> contentTypeOptions
                                                                .disable()) // Désactiver les options de content-type
                                                                            // par défaut
                                                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                                                .maxAgeInSeconds(31536000)
                                                                .preload(true))
                                                .xssProtection(
                                                                xss -> xss.headerValue(
                                                                                XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"))
                                                .referrerPolicy(referrer -> referrer
                                                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                                                .permissionsPolicy(permissions -> permissions
                                                                .policy("geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()")))
                                .authorizeHttpRequests(auth -> auth
                                                // 🔓 AUTH ENDPOINTS
                                                .requestMatchers("/auth/**").permitAll()
                                                .requestMatchers("/public/**").permitAll()
                                                .requestMatchers("/api/public/**").permitAll()
                                                .requestMatchers("/health").permitAll()

                                                // 🔓 BIENS PUBLIC (lecture seule)
                                                .requestMatchers(HttpMethod.GET, "/api/biens").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/biens/{id}").permitAll()

                                                // � TYPE BIENS PUBLIC (lecture seule)
                                                .requestMatchers(HttpMethod.GET, "/api/type-biens/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/type-biens/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/type-biens/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/type-biens/**")
                                                .hasRole("ADMIN")

                                                // 🔐 BIENS AGENCE
                                                .requestMatchers("/api/biens/mes-biens").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.POST, "/api/biens").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.PUT, "/api/biens/**").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/biens/**").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.POST, "/api/biens/{id}/validate")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.POST, "/api/biens/{id}/refuse")
                                                .hasRole("ADMIN")

                                                // 🔓 ANNONCES PUBLIC (lecture seule)
                                                .requestMatchers(HttpMethod.GET, "/api/annonces/**").permitAll()

                                                // 🔐 ANNONCES AGENCE
                                                .requestMatchers(HttpMethod.POST, "/api/annonces/**").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.PUT, "/api/annonces/**").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/annonces/**")
                                                .hasAnyRole("AGENCE", "AGENT")

                                                // 🔐 MEDIAS
                                                .requestMatchers(HttpMethod.POST, "/api/medias/**")
                                                .hasAnyRole("ADMIN", "SUPER_ADMIN", "AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.GET, "/api/medias/**").authenticated()
                                                .requestMatchers(HttpMethod.DELETE, "/api/medias/**")
                                                .hasAnyRole("ADMIN", "SUPER_ADMIN", "AGENCE", "AGENT")

                                                // DOCUMENTS
                                                .requestMatchers(HttpMethod.POST, "/api/documents").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/documents/{id}")
                                                .hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers(HttpMethod.GET, "/api/documents/**").authenticated()

                                                // NOTIFICATIONS - Utilisateurs authentifiés
                                                .requestMatchers("/api/notifications/me").authenticated()
                                                .requestMatchers("/api/notifications/non-lues").authenticated()
                                                .requestMatchers("/api/notifications/{id}/marquer-lu").authenticated()
                                                .requestMatchers("/api/notifications/marquer-toutes-lues").authenticated()

                                                // UTILISATEUR CONNECTE
                                                .requestMatchers("/api/utilisateurs/me").authenticated()
                                                .requestMatchers("/api/utilisateurs/clients/mes-clients").hasAnyRole("AGENCE", "AGENT")
                                                .requestMatchers("/api/utilisateurs/change-password").authenticated()

                                                // ADMIN
                                                // 🔐 ADMIN
                                                .requestMatchers("/api/utilisateurs/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/admin/utilisateurs/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers("/api/dashboard/**").hasRole("ADMIN")

                                                // 🔓 UPLOADS PUBLIC
                                                .requestMatchers("/uploads/**").permitAll()

                                                // � RESSOURCES STATIQUES
                                                .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**",
                                                                "/images/**")
                                                .permitAll()

                                                // �🔐 TOUT LE RESTE
                                                .anyRequest().authenticated())
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                // HTTPS obligatoire en production
                if (requireHttps) {
                        http.requiresChannel(channel -> channel
                                        .requestMatchers("/**").requiresSecure());
                }

                return http.build();
        }

        // ===================== CORS SÉCURISÉ =====================
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Origines autorisées (configuration par environnement)
                config.setAllowedOrigins(allowedOrigins);

                // Méthodes HTTP autorisées
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                // Headers autorisés
                config.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With",
                                "Accept",
                                "Origin",
                                "Access-Control-Request-Method",
                                "Access-Control-Request-Headers"));

                // Credentials autorisés
                config.setAllowCredentials(true);

                // Exposed headers pour le frontend
                config.setExposedHeaders(Arrays.asList(
                                "X-Total-Count",
                                "X-Page-Count"));

                // Durée de pré-flight (15 minutes)
                config.setMaxAge(900L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        // ===================== AUTHENTICATION =====================
        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(customUserDetailsService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration configuration) throws Exception {
                return configuration.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12); // Force plus élevée par défaut
        }
}
