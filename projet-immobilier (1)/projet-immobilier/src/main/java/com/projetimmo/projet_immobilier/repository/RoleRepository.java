package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByNom(String nom);

    boolean existsByNom(String nom);

    List<Role> findByStatus(String status);

    @Query("SELECT r FROM Role r WHERE r.status = :status ORDER BY r.nom")
    List<Role> findActiveRoles(@Param("status") String status);

    @Query("SELECT r FROM Role r WHERE r.isDefault = true AND r.status = :status")
    Optional<Role> findDefaultRole(@Param("status") String status);

    @Query("SELECT r FROM Role r WHERE r.nom IN :roleNames")
    List<Role> findByNomIn(@Param("roleNames") List<String> roleNames);

    void deleteByStatus(String status);
}
