package com.projetimmo.projet_immobilier.dto;

import lombok.Getter;
import lombok.Setter;
import com.projetimmo.projet_immobilier.enums.TypeMedia;

@Getter
@Setter
public class MediaRequest {
    private TypeMedia typeMedia;
    private String url;
    private Long idBien;
}
