package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.TypeBien;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeBienRepository extends JpaRepository<TypeBien, Long> {

    Optional<TypeBien> findByLibelleAndIsDeletedFalse(String libelle);

    long countByIsDeletedFalse();

}
