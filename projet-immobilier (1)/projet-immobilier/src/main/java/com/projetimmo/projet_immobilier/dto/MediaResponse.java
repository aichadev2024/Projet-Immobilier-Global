package com.projetimmo.projet_immobilier.dto;

import lombok.Getter;
import lombok.Builder;
import com.projetimmo.projet_immobilier.enums.TypeMedia;

@Getter
@Builder
public class MediaResponse {
    private Long id;
    private String url;
    private String nomFichier;
    private TypeMedia typeMedia;
    private BienInfo bien;
    
    @Getter
    @Builder
    public static class BienInfo {
        private Long id;
        private String libelle;
    }
}
