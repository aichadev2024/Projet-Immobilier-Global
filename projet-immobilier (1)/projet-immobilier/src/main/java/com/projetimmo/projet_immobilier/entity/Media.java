package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.TypeMedia;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMedia typeMedia;

    @Column(nullable = false)
    private Long tailleFichier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id")
    private Bien bien;

    @Builder.Default
    private Boolean isPrincipal = false;

    @Builder.Default
    private Boolean isDeleted = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}