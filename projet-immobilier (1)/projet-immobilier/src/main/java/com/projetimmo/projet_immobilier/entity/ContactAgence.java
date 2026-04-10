package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.StatutContact;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_agence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactAgence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id", nullable = false)
    private Bien bien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agence_id", nullable = false)
    private Utilisateur agence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Utilisateur client;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutContact statut = StatutContact.EN_ATTENTE;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dateContact = LocalDateTime.now();

    @Column
    private LocalDateTime dateReponse;

    @Column(columnDefinition = "TEXT")
    private String reponse;

    @PrePersist
    protected void onCreate() {
        dateContact = LocalDateTime.now();
    }
}
