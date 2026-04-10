package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Media;
import com.projetimmo.projet_immobilier.entity.Bien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByBienAndIsDeletedFalse(Bien bien);

    List<Media> findByIsDeletedFalse();

    List<Media> findByBienIdAndIsDeletedFalse(Long idBien);

    List<Media> findByBienIdAndIsPrincipalTrueAndIsDeletedFalse(Long bienId);

    List<Media> findByBienIdAndIsPrincipalTrue(Long bienId);

    List<Media> findByBienAgenceIdAndIsDeletedFalse(UUID agenceId);
}
