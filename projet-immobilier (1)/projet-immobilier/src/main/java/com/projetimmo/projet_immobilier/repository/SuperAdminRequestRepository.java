package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.SuperAdminRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuperAdminRequestRepository extends JpaRepository<SuperAdminRequest, Long> {

    Optional<SuperAdminRequest> findByEmail(String email);

    Optional<SuperAdminRequest> findByNomUtilisateur(String nomUtilisateur);

    List<SuperAdminRequest> findByStatut(SuperAdminRequest.RequestStatut statut);

    @Query("SELECT r FROM SuperAdminRequest r WHERE r.statut = :statut ORDER BY r.createdAt DESC")
    List<SuperAdminRequest> findByStatutOrderByCreatedAtDesc(@Param("statut") SuperAdminRequest.RequestStatut statut);

    @Query("SELECT r FROM SuperAdminRequest r ORDER BY r.createdAt DESC")
    Page<SuperAdminRequest> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM SuperAdminRequest r WHERE " +
            "LOWER(r.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.nomUtilisateur) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "ORDER BY r.createdAt DESC")
    Page<SuperAdminRequest> findBySearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(r) FROM SuperAdminRequest r WHERE r.statut = :statut")
    long countByStatut(@Param("statut") SuperAdminRequest.RequestStatut statut);

    boolean existsByEmail(String email);

    boolean existsByNomUtilisateur(String nomUtilisateur);
}
