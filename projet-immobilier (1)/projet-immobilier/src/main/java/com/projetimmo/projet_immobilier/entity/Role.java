package com.projetimmo.projet_immobilier.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue
    @Column(nullable = false, updatable = false)
    private UUID id;
    @Column(nullable = false, unique = true)
    private String nom;

    @Column(nullable = false)
    private String status;

    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false;
    @Builder.Default
    @Column(nullable = false)
    private Boolean isDefault = false;

    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 🔗 Un rôle peut être attribué à plusieurs utilisateurs
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Utilisateur> utilisateurs;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
