package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.dto.DocumentRequest;
import com.projetimmo.projet_immobilier.dto.DocumentResponse;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.Document;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.DocumentRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final BienRepository bienRepository;
    private final UtilisateurRepository utilisateurRepository;

    private Utilisateur getUtilisateurConnecte() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return utilisateurRepository
                .findByNomUtilisateur(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }

    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .typeDocument(document.getTypeDocument())
                .urlFichier(document.getUrlFichier())
                .numeroDocument(document.getNumeroDocument())
                .autoriteDocument(document.getAutoriteDocument())
                .statutVerification(document.getStatutVerification())
                .idBien(document.getBien().getId())
                .libelleBien(document.getBien().getLibelle())
                .build();
    }

    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public DocumentResponse ajouterDocument(DocumentRequest request) {

        Utilisateur utilisateur = getUtilisateurConnecte();

        Bien bien = bienRepository.findById(Objects.requireNonNull(request.getIdBien()))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        if (!bien.getAgence().getId().equals(utilisateur.getAgence().getId())) {
            throw new SecurityException("Ce bien ne vous appartient pas");
        }

        Document document = Document.builder()
                .typeDocument(request.getTypeDocument())
                .urlFichier(request.getUrlFichier())
                .numeroDocument(request.getNumeroDocument())
                .autoriteDocument(request.getAutoriteDocument())
                .bien(bien)
                .build();

        return mapToResponse(documentRepository.save(Objects.requireNonNull(document)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> listerDocumentParBien(Long idBien) {
        Bien bien = bienRepository.findById(Objects.requireNonNull(idBien))
                .orElseThrow(() -> new IllegalArgumentException("Bien introuvable"));

        return documentRepository.findByBienAndIsDeletedFalse(bien)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasRole('AGENCE')")
    public void supprimerDocument(Long id) {
        Utilisateur utilisateur = getUtilisateurConnecte();

        Document document = documentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable"));

        if (!document.getBien().getAgence().getId().equals(utilisateur.getAgence().getId())) {
            throw new SecurityException("Suppression non autorisée");
        }

        document.setIsDeleted(true);
        documentRepository.save(document);
    }
}
