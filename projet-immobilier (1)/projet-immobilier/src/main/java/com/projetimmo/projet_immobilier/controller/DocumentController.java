package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.DocumentRequest;
import com.projetimmo.projet_immobilier.dto.DocumentResponse;
import com.projetimmo.projet_immobilier.service.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public DocumentResponse ajouter(@RequestBody DocumentRequest request) {
        return documentService.ajouterDocument(request);
    }

    @GetMapping("/bien/{idBien}")
    public List<DocumentResponse> documentsParBien(@PathVariable Long idBien) {
        return documentService.listerDocumentParBien(idBien);
    }

    @DeleteMapping("/{id}")
    public void supprimer(@PathVariable Long id) {
        documentService.supprimerDocument(id);
    }
}
