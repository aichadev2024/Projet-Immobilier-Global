package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.DocumentRequest;
import com.projetimmo.projet_immobilier.dto.DocumentResponse;

import java.util.List;

public interface DocumentService {

    DocumentResponse ajouterDocument(DocumentRequest request);

    List<DocumentResponse> listerDocumentParBien(Long idBien);

    void supprimerDocument(Long id);
}
