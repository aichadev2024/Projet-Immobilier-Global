package com.projetimmo.projet_immobilier.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvisResponse {
    private Long id;
    private String clientName;
    private String propertyName;
    private Integer rating;
    private String comment;
    private String date;
    private String status;
    private String reply;
}
