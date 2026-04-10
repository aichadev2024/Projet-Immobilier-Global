package com.projetimmo.projet_immobilier.controller;

import com.projetimmo.projet_immobilier.dto.AnnonceRequest;
import com.projetimmo.projet_immobilier.dto.AnnonceResponse;
import com.projetimmo.projet_immobilier.service.interfaces.AnnonceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin
public class AnnonceController {

    private final AnnonceService annonceService;

    public AnnonceController(AnnonceService annonceService) {
        this.annonceService = annonceService;
    }

    @PostMapping
    public AnnonceResponse creerAnnonce(@RequestBody AnnonceRequest request) {
        return annonceService.creerAnnonce(request);
    }

    @GetMapping("/mes-annonces")
    public List<AnnonceResponse> mesAnnonces() {
        return annonceService.listerMesAnnonces();
    }

    @GetMapping
    public List<AnnonceResponse> toutesLesAnnonces() {
        return annonceService.listerToutesAnnonces();
    }

    @GetMapping("/{id}")
    public AnnonceResponse getAnnonce(@PathVariable Long id) {
        return annonceService.getAnnonceById(id);
    }

    @DeleteMapping("/{id}")
    public void supprimerAnnonce(@PathVariable Long id) {
        annonceService.supprimerAnnonce(id);
    }
}
