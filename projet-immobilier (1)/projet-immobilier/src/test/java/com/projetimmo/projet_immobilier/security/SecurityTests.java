package com.projetimmo.projet_immobilier.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.projetimmo.projet_immobilier.controller.AuthController;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

@WebMvcTest(controllers = AuthController.class)
@ActiveProfiles("test")
public class SecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RedisTokenBlacklistService redisTokenBlacklistService;

    @MockBean
    private SecretManager secretManager;

    @Test
    public void testCsrfProtection() throws Exception {
        // Test que les requêtes POST sans CSRF sont rejetées
        mockMvc.perform(post("/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isOk());
    }

    @Test
    public void testCsrfTokenRequired() throws Exception {
        // Test que les requêtes POST sans token CSRF sont rejetées
        mockMvc.perform(post("/auth/login")
                .contentType("application/json")
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "AGENCE")
    public void testAuthorizedAccess() throws Exception {
        // Test que les utilisateurs authentifiés peuvent accéder aux endpoints protégés
        mockMvc.perform(get("/api/utilisateurs/me"))
                .andExpect(status().isOk());
    }

    @Test
    public void testUnauthorizedAccess() throws Exception {
        // Test que les utilisateurs non authentifiés sont rejetés
        mockMvc.perform(get("/api/utilisateurs/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testRoleBasedAccess() throws Exception {
        // Test que les rôles sont respectés
        mockMvc.perform(post("/api/biens")
                .with(csrf())
                .contentType("application/json")
                .content("{\"libelle\":\"Test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "AGENCE")
    public void testAgenceRoleAccess() throws Exception {
        // Test que les agences peuvent créer des biens
        mockMvc.perform(post("/api/biens")
                .with(csrf())
                .contentType("application/json")
                .content(
                        "{\"libelle\":\"Test\",\"description\":\"Test\",\"adresse\":\"Test\",\"latitude\":\"0.0\",\"longitude\":\"0.0\",\"superficie\":100,\"transactionType\":\"VENTE\"}"))
                .andExpect(status().isOk());
    }
}
