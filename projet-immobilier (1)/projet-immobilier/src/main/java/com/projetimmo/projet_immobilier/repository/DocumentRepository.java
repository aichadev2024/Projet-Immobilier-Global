package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Document;
import com.projetimmo.projet_immobilier.entity.Bien;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByBienAndIsDeletedFalse(Bien bien);
}
