package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.StatutVerification;
import com.projetimmo.projet_immobilier.enums.TypeDocumentAgence;
import com.projetimmo.projet_immobilier.enums.TypeVerification;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agence")
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeVerification type;

    @Enumerated(EnumType.STRING)
    private TypeDocumentAgence typeDocumentAgence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutVerification statut;

    private String documentUrl;

    private String commentaires;

    @Column(nullable = false)
    private LocalDateTime dateDemande;

    private LocalDateTime dateTraitement;

    private String traitePar;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dateDemande == null) {
            this.dateDemande = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
