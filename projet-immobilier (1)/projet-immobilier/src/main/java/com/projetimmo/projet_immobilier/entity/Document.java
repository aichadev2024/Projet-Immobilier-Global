package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.TypeDocumentBien;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TypeDocumentBien typeDocument;

    private String urlFichier;
    private String numeroDocument;
    private Date dateEmission;
    private String autoriteDocument;
    private String statutVerification;
    private Date dateDepot;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;

    private Date deletedAt;

    @Builder.Default
    private Date createdAt = new Date();

    private Date updatedAt;

    // Relation vers Bien
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bien")
    private Bien bien;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
