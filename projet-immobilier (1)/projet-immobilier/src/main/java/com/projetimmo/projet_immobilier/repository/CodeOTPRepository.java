package com.projetimmo.projet_immobilier.repository;

import com.projetimmo.projet_immobilier.entity.CodeOTP;
import com.projetimmo.projet_immobilier.entity.Utilisateur;
import com.projetimmo.projet_immobilier.enums.TypeCodeOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CodeOTPRepository extends JpaRepository<CodeOTP, UUID> {

    Optional<CodeOTP> findByCodeAndDestinataire(String code, String destinataire);

    List<CodeOTP> findByDestinataireAndType(String destinataire, TypeCodeOTP type);

    @Query("SELECT c FROM CodeOTP c WHERE c.destinataire = :destinataire AND c.type = :type AND c.estUtilise = false AND c.dateExpiration > :now")
    Optional<CodeOTP> findValidCodeByDestinataireAndType(@Param("destinataire") String destinataire, 
                                                        @Param("type") TypeCodeOTP type, 
                                                        @Param("now") LocalDateTime now);

    @Query("SELECT c FROM CodeOTP c WHERE c.estUtilise = false AND c.dateExpiration < :now")
    List<CodeOTP> findExpiredCodes(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM CodeOTP c WHERE c.destinataire = :destinataire AND c.type = :type ORDER BY c.dateGeneration DESC")
    List<CodeOTP> findCodesByDestinataireAndTypeOrderByDate(@Param("destinataire") String destinataire, 
                                                           @Param("type") TypeCodeOTP type);

    void deleteByDestinataireAndType(String destinataire, TypeCodeOTP type);

    @Query("SELECT COUNT(c) FROM CodeOTP c WHERE c.destinataire = :destinataire AND c.type = :type AND c.estUtilise = false AND c.dateExpiration > :now")
    long countActiveCodesByDestinataireAndType(@Param("destinataire") String destinataire, 
                                             @Param("type") TypeCodeOTP type, 
                                             @Param("now") LocalDateTime now);

    Optional<CodeOTP> findFirstByDestinataireAndEstUtiliseFalseOrderByDateGenerationDesc(String destinataire);

    Optional<CodeOTP> findFirstByDestinataireOrderByDateGenerationDesc(String destinataire);

    Optional<CodeOTP> findFirstByUtilisateurAndEstUtiliseFalseOrderByDateGenerationDesc(Utilisateur utilisateur);
}
