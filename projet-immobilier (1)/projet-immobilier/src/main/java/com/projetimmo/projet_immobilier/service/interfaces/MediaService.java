package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.MediaRequest;
import com.projetimmo.projet_immobilier.dto.MediaResponse;
import com.projetimmo.projet_immobilier.entity.Media;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface MediaService {
    MediaResponse ajouterMedia(MediaRequest request);

    MediaResponse uploadMedia(Long idBien, String typeMedia, MultipartFile file) throws IOException;

    List<MediaResponse> listerMediaParBien(Long idBien);

    void supprimerMedia(Long id);

    MediaResponse mapToResponse(Media media);

    List<MediaResponse> uploadMultipleMedias(Long bienId, MultipartFile[] files) throws IOException;
}
