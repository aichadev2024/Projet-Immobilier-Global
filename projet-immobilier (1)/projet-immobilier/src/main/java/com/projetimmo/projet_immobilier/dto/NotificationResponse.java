package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String titre;
    private String message;
    private String date;
    private Boolean isRead;
    private String lien;
    private Long entityId;
}
