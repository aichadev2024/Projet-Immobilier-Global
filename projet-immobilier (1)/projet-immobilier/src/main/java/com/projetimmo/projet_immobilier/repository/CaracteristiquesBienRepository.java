package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.CaracteristiquesBien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaracteristiquesBienRepository extends JpaRepository<CaracteristiquesBien, Long> {

    Optional<CaracteristiquesBien> findByBienId(Long bienId);

    // Simplifié - plus de @Query pour éviter les erreurs HQL
    // Les autres méthodes peuvent être implémentées avec des streams si nécessaire
}
