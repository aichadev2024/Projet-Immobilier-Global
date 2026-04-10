package com.projetimmo.projet_immobilier.dto;

import com.projetimmo.projet_immobilier.enums.TypeDocumentBien;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentResponse {
    private Long id;
    private TypeDocumentBien typeDocument;
    private String urlFichier;
    private String numeroDocument;
    private String autoriteDocument;
    private String statutVerification;
    private Long idBien;
    private String libelleBien;
}
