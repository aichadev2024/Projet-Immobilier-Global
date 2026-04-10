-- Mise à jour de la table medias pour inclure tous les champs nécessaires
ALTER TABLE medias 
ADD COLUMN IF NOT EXISTS nom_fichier VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS taille_fichier BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS utilisateur_id VARCHAR(36) NOT NULL,
ADD COLUMN IF NOT EXISTS is_principal BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL;

-- Renommer les colonnes si elles existent avec l'ancien nom
ALTER TABLE medias 
CHANGE COLUMN id_bien bien_id BIGINT NULL;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE medias 
ADD CONSTRAINT fk_medias_utilisateur 
FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE;

ALTER TABLE medias 
ADD CONSTRAINT fk_medias_bien 
FOREIGN KEY (bien_id) REFERENCES bien(id) ON DELETE CASCADE;

-- Ajouter les index
CREATE INDEX IF NOT EXISTS idx_medias_utilisateur_id ON medias(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_medias_bien_id ON medias(bien_id);
CREATE INDEX IF NOT EXISTS idx_medias_type_media ON medias(type_media);
CREATE INDEX IF NOT EXISTS idx_medias_is_principal ON medias(is_principal);
CREATE INDEX IF NOT EXISTS idx_medias_is_deleted ON medias(is_deleted);
CREATE INDEX IF NOT EXISTS idx_medias_date_upload ON medias(date_upload);

-- Mettre à jour les enregistrements existants pour s'assurer que les champs requis sont remplis
UPDATE medias 
SET nom_fichier = COALESCE(nom_fichier, 'media_' + id),
    taille_fichier = CASE WHEN taille_fichier = 0 THEN 1024 ELSE taille_fichier END,
    date_upload = COALESCE(date_upload, created_at, CURRENT_TIMESTAMP)
WHERE nom_fichier = '' OR nom_fichier IS NULL OR taille_fichier = 0;
