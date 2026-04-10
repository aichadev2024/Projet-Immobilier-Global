package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Agence;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.StatutUtilisateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByNomUtilisateur(String nomUtilisateur);

    boolean existsByEmail(String email);

    boolean existsByNomUtilisateur(String nomUtilisateur);

    List<Utilisateur> findAllByIsDeletedFalse();

    Optional<Utilisateur> findByTelephone(String telephone);

    long countByIsDeletedFalse();

    long countByStatutAndIsDeletedFalse(StatutUtilisateur statut);

    long countByRole_NomAndIsDeletedFalse(String role);

    // Méthodes ajoutées pour la validation des agences
    List<Utilisateur> findByRoleNomAndStatut(String roleNom, StatutUtilisateur statut);

    long countByRoleNomAndStatut(String roleNom, StatutUtilisateur statut);

    long countByRoleNom(String roleNom);

    @Query("SELECT u FROM Utilisateur u WHERE u.role.nom = :roleNom AND u.statut = :statut AND u.isDeleted = false")
    List<Utilisateur> findByRoleNomAndStatutAndIsDeletedFalse(@Param("roleNom") String roleNom, @Param("statut") StatutUtilisateur statut);

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.role.nom = :roleNom AND u.statut = :statut AND u.isDeleted = false")
    long countByRoleNomAndStatutAndIsDeletedFalse(@Param("roleNom") String roleNom, @Param("statut") StatutUtilisateur statut);

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.role.nom = :roleNom AND u.isDeleted = false")
    long countByRoleNomAndIsDeletedFalse(@Param("roleNom") String roleNom);

    @Query("SELECT u FROM Utilisateur u WHERE u.role.nom = :roleNom AND u.isDeleted = false")
    List<Utilisateur> findByRoleNomAndIsDeletedFalse(@Param("roleNom") String roleNom);

    List<Utilisateur> findByRoleNom(String roleName);

    Optional<Utilisateur> findFirstByTelephoneAndIsDeletedFalse(String telephone);

    List<Utilisateur> findByAgenceAndIsDeletedFalse(Agence agence);

    Optional<Utilisateur> findByIdAndAgenceAndIsDeletedFalse(UUID id, Agence agence);

    @Query("SELECT u FROM Utilisateur u WHERE u.agence.id = :agenceId AND u.role.nom = :roleNom AND u.isDeleted = false")
    List<Utilisateur> findByAgenceIdAndRoleNomAndIsDeletedFalse(@Param("agenceId") UUID agenceId, @Param("roleNom") String roleNom);

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.agence.id = :agenceId AND u.role.nom = :roleIds AND u.isDeleted = false")
    long countByAgenceIdAndRoleNomAndIsDeletedFalse(@Param("agenceId") UUID agenceId, @Param("roleIds") String roleIds);
}
