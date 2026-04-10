package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.StatutDocumentBien;
import com.projetimmo.projet_immobilier.enums.TypeDocumentBien;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents_bien")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentBien {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_id", nullable = false)
    private Bien bien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agence_id", nullable = false)
    private Agence agence;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeDocumentBien type;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutDocumentBien statut;

    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_verification")
    private LocalDateTime dateVerification;

    @Column(name = "verifie_par")
    private String verifiePar;

    @Column(name = "commentaires")
    private String commentaires;

    @PrePersist
    public void prePersist() {
        if (dateSoumission == null) {
            dateSoumission = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutDocumentBien.EN_ATTENTE;
        }
    }
}
