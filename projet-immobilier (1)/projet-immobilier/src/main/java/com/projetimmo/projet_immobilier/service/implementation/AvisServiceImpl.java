package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.entity.Avis;
import com.projetimmo.projet_immobilier.entity.Bien;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.repository.AvisRepository;
import com.projetimmo.projet_immobilier.repository.BienRepository;
import com.projetimmo.projet_immobilier.repository.UtilisateurRepository;
import com.projetimmo.projet_immobilier.service.interfaces.AvisService;
import com.projetimmo.projet_immobilier.dto.AvisRequest;
import com.projetimmo.projet_immobilier.dto.AvisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvisServiceImpl implements AvisService {

    private final AvisRepository avisRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final BienRepository bienRepository;

    @Override
    public AvisResponse createAvis(AvisRequest request, UUID clientId) {
        Utilisateur client = utilisateurRepository.findById(clientId).orElseThrow();
        Utilisateur agence = utilisateurRepository.findById(UUID.fromString(request.getAgenceId())).orElseThrow();
        Bien bien = request.getBienId() != null ? bienRepository.findById(request.getBienId()).orElse(null) : null;

        Avis avis = Avis.builder()
                .client(client).agence(agence).bien(bien)
                .note(request.getNote()).commentaire(request.getCommentaire())
                .statut("PENDING").build();

        return mapToResponse(avisRepository.save(avis));
    }

    @Override
    public List<AvisResponse> getAvisForAgence(UUID agenceId) {
        return avisRepository.findByAgenceIdOrderByDateCreationDesc(agenceId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<AvisResponse> getAvisForClient(UUID clientId) {
        return avisRepository.findByClientIdOrderByDateCreationDesc(clientId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public void repondreAvis(Long avisId, String reponse, UUID agenceId) {
        Avis avis = avisRepository.findById(avisId).orElseThrow(() -> new RuntimeException("Avis introuvable"));
        if (!avis.getAgence().getId().equals(agenceId))
            throw new RuntimeException("Accès refusé");
        avis.setReponse(reponse);
        avis.setDateReponse(LocalDateTime.now());
        avis.setStatut("PUBLISHED");
        avisRepository.save(avis);
    }

    @Override
    public void changerStatutAvis(Long avisId, String statut, UUID agenceId) {
        Avis avis = avisRepository.findById(avisId).orElseThrow(() -> new RuntimeException("Avis introuvable"));
        if (!avis.getAgence().getId().equals(agenceId))
            throw new RuntimeException("Accès refusé");
        avis.setStatut(statut);
        avisRepository.save(avis);
    }

    private AvisResponse mapToResponse(Avis a) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return AvisResponse.builder()
                .id(a.getId())
                .clientName(a.getClient().getPrenom() + " " + a.getClient().getNom())
                .propertyName(a.getBien() != null ? a.getBien().getLibelle() : "Agence globale")
                .rating(a.getNote())
                .comment(a.getCommentaire())
                .date(a.getDateCreation() != null ? a.getDateCreation().format(formatter) : "")
                .status(a.getStatut())
                .reply(a.getReponse())
                .build();
    }
}
