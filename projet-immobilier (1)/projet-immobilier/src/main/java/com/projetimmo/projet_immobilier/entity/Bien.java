package com.projetimmo.projet_immobilier.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.projetimmo.projet_immobilier.enums.StatutBien;
import com.projetimmo.projet_immobilier.enums.TransactionType;

import java.time.LocalDateTime;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "bien")
@JsonIgnoreProperties({ "medias", "annonce", "caracteristiques", "hibernateLazyInitializer", "handler" })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_type_bien", nullable = false)
    private TypeBien typeBien;

    private String adresse;

    private Double latitude;
    private Double longitude;

    private Integer superficie;

    private BigDecimal prixCalculer;

    @Column(precision = 15, scale = 2)
    private BigDecimal prix;

    @Column(precision = 15, scale = 2)
    private BigDecimal commission;

    private String devise;

    @Enumerated(EnumType.STRING)
    private StatutBien statutBien;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Builder.Default
    private Boolean isDeleted = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 🔥 ICI LA CORRECTION IMPORTANTE
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_agence", nullable = false)
    private Agence agence;

    @OneToMany(mappedBy = "bien")
    private List<Media> medias;

    @OneToOne(mappedBy = "bien")
    private Annonce annonce;

    @OneToOne(mappedBy = "bien", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CaracteristiquesBien caracteristiques;

    @PrePersist
    void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}