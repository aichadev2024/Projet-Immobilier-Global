package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Utilisateur client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agence_id", nullable = false)
    private Utilisateur agence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id", nullable = true)
    private Bien bien;

    @Column(nullable = false)
    private Integer note; // 1 to 5

    @Column(columnDefinition = "TEXT", nullable = false)
    private String commentaire;

    @Column(columnDefinition = "TEXT")
    private String reponse;

    // PUBLISHED, PENDING, REJECTED
    @Column(nullable = false)
    @Builder.Default
    private String statut = "PENDING"; 

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column
    private LocalDateTime dateReponse;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
