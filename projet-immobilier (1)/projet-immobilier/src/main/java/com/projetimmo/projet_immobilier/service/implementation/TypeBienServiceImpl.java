package com.projetimmo.projet_immobilier.service.implementation;

import com.projetimmo.projet_immobilier.entity.TypeBien;
import com.projetimmo.projet_immobilier.repository.TypeBienRepository;
import com.projetimmo.projet_immobilier.service.interfaces.TypeBienService;
import com.projetimmo.projet_immobilier.enums.ModeTarification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeBienServiceImpl implements TypeBienService {

    private final TypeBienRepository repository;

    @Override
    public TypeBien create(TypeBien typeBien) {

        if (typeBien == null) {
            throw new IllegalArgumentException("TypeBien ne peut pas être null");
        }

        if (repository.findByLibelleAndIsDeletedFalse(typeBien.getLibelle()).isPresent()) {
            throw new RuntimeException("Type de bien déjà existant");
        }

        // Validation de la cohérence du tarifBase avec le modeTarification
        if (typeBien.getModeTarification() == ModeTarification.GRATUIT &&
                typeBien.getTarifBase() != null && typeBien.getTarifBase().compareTo(java.math.BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Le tarif doit être 0 pour le mode GRATUIT");
        }

        if (typeBien.getModeTarification() != ModeTarification.GRATUIT &&
                (typeBien.getTarifBase() == null
                        || typeBien.getTarifBase().compareTo(java.math.BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Le tarif doit être supérieur à 0 pour les modes FIXE et POURCENTAGE");
        }

        return repository.save(typeBien);
    }

    @Override
    public List<TypeBien> findAll() {
        return repository.findAll()
                .stream()
                .filter(tb -> !tb.getIsDeleted())
                .toList();
    }

    @Override
    public TypeBien findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Id ne peut pas être null");
        }

        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type de bien introuvable"));
    }

    @Override
    public TypeBien update(Long id, TypeBien typeBien) {
        TypeBien existing = findById(id);

        // Validation de la cohérence du tarifBase avec le modeTarification
        if (typeBien.getModeTarification() == ModeTarification.GRATUIT &&
                typeBien.getTarifBase() != null && typeBien.getTarifBase().compareTo(java.math.BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Le tarif doit être 0 pour le mode GRATUIT");
        }

        if (typeBien.getModeTarification() != ModeTarification.GRATUIT &&
                (typeBien.getTarifBase() == null
                        || typeBien.getTarifBase().compareTo(java.math.BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Le tarif doit être supérieur à 0 pour les modes FIXE et POURCENTAGE");
        }

        existing.setLibelle(typeBien.getLibelle());
        existing.setDescription(typeBien.getDescription());
        existing.setModeTarification(typeBien.getModeTarification());
        existing.setTarifBase(typeBien.getTarifBase());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        TypeBien typeBien = findById(id);
        typeBien.setIsDeleted(true);
        repository.save(typeBien);
    }
}
