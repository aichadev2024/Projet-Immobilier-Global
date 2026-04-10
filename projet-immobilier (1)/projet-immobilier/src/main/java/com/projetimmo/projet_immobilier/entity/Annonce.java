package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.projetimmo.projet_immobilier.enums.StatutAnnonce;
import com.projetimmo.projet_immobilier.enums.TypeAnnonce;

@Entity
@Table(name = "annonce")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAnnonce typeAnnonce;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAnnonce statut;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 🔗 BIEN (l'agence est accessible via bien.getAgence())
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bien", nullable = false)
    private Bien bien;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
