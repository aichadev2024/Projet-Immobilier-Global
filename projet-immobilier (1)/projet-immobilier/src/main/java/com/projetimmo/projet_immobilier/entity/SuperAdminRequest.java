package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "super_admin_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdminRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String prenom;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, unique = true)
    private String nomUtilisateur;
    
    @Column(nullable = false)
    private String motDePasse;
    
    @Column(name = "telephone")
    private String telephone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatut statut;
    
    @Column(name = "motif_refus")
    private String motifRefus;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;
    
    @Column(name = "validated_by")
    private UUID validatedBy;
    
    @Column(name = "validated_at")
    private LocalDateTime validatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        statut = RequestStatut.EN_ATTENTE;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum RequestStatut {
        EN_ATTENTE,
        VALIDEE,
        REFUSEE
    }
}
