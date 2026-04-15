-- Migration pour mettre à jour la contrainte de statut_bien dans la table bien
-- Ajout des nouveaux statuts pour la vérification par l'agence

-- D'abord, supprimer l'ancienne contrainte
ALTER TABLE bien DROP CONSTRAINT IF EXISTS bien_statut_bien_check;

-- Créer la nouvelle contrainte avec tous les statuts possibles
ALTER TABLE bien 
ADD CONSTRAINT bien_statut_bien_check 
CHECK (statut_bien IN (
    'DISPONIBLE',
    'LOUE', 
    'VENDU',
    'INDISPONIBLE',
    'EN_ATTENTE',
    'VALIDE',
    'REFUSE',
    'EN_ATTENTE_VALIDATION',
    'APPROUVE',
    'REJETE'
));

-- Commentaire pour documentation
COMMENT ON CONSTRAINT bien_statut_bien_check ON bien IS 'Vérifie que le statut du bien est valide';
