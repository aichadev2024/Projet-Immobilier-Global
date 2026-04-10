package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // INFO, SUCCESS, WARNING, RESERVATION, CONFIRMATION, ANNULATION, NOUVEAU_BIEN
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    // Lien optionnel pour rediriger vers la page concernée
    private String lien;

    // ID de l'entité liée (réservation, bien, etc.)
    private Long entityId;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
