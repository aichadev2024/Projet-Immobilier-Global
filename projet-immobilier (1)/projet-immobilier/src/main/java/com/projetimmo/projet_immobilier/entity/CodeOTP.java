package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.TypeCodeOTP;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "code_otp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeOTP {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String destinataire; // email ou téléphone

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JoinColumn(name = "id_utilisateur", foreignKey = @ForeignKey(name = "fk_code_otp_utilisateur", foreignKeyDefinition = "FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id) ON DELETE CASCADE"))
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeCodeOTP type;

    @Column(nullable = false)
    private LocalDateTime dateGeneration;

    @Column(nullable = false)
    private LocalDateTime dateExpiration;

    @Builder.Default
    @Column(nullable = false)
    private Boolean estUtilise = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dateGeneration == null) {
            this.dateGeneration = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean estExpire() {
        return LocalDateTime.now().isAfter(dateExpiration);
    }

    public boolean estValide() {
        return !estUtilise && !estExpire();
    }
}
