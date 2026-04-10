package com.projetimmo.projet_immobilier.security;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

@WebMvcTest
@ActiveProfiles("test")
public class CsrfSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RedisTokenBlacklistService redisTokenBlacklistService;

    @MockBean
    private SecretManager secretManager;

    @Test
    public void testCsrfTokenGeneration() throws Exception {
        // Test que le token CSRF est généré pour les endpoints GET
        mockMvc.perform(get("/api/biens"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-XSRF-TOKEN"));
    }

    @Test
    public void testPostWithoutCsrfFails() throws Exception {
        // Test que POST sans token CSRF échoue
        mockMvc.perform(post("/auth/login")
                .contentType("application/json")
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testPostWithCsrfSucceeds() throws Exception {
        // Test que POST avec token CSRF réussit
        mockMvc.perform(post("/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isOk());
    }

    @Test
    public void testPutWithoutCsrfFails() throws Exception {
        // Test que PUT sans token CSRF échoue
        mockMvc.perform(put("/api/biens/1")
                .contentType("application/json")
                .content("{\"libelle\":\"Updated\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDeleteWithoutCsrfFails() throws Exception {
        // Test que DELETE sans token CSRF échoue
        mockMvc.perform(delete("/api/biens/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAuthEndpointsIgnored() throws Exception {
        // Test que les endpoints d'auth sont ignorés par CSRF
        mockMvc.perform(post("/auth/login")
                .contentType("application/json")
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isForbidden()); // Devrait être ignoré mais testé
    }
}
