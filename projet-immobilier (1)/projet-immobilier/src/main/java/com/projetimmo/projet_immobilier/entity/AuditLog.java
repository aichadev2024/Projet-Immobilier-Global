package com.projetimmo.projet_immobilier.entity;

import com.projetimmo.projet_immobilier.enums.ActionAudit;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionAudit action;

    @Column(nullable = false)
    private LocalDateTime date;

    private String ip;

    private String details;

    @PrePersist
    protected void onCreate() {
        this.date = LocalDateTime.now();
    }
}
