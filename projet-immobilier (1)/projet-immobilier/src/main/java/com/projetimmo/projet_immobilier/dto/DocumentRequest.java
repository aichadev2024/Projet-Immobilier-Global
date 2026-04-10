package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.TypeDocumentBien;
import lombok.Data;

@Data
public class DocumentRequest {
    private TypeDocumentBien typeDocument;
    private String urlFichier;
    private String numeroDocument;
    private String autoriteDocument;
    private Long idBien;
}
