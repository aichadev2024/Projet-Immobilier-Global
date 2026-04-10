package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.entity.TypeBien;

import java.util.List;

public interface TypeBienService {

    TypeBien create(TypeBien typeBien);

    List<TypeBien> findAll();

    TypeBien findById(Long id);

    TypeBien update(Long id, TypeBien typeBien);

    void delete(Long id);
}
