-- ============================================
-- FIX: Mise à jour de la contrainte CHECK pour type_document_agence
-- ============================================

-- 1. Supprimer l'ancienne contrainte (si elle existe)
ALTER TABLE verifications DROP CONSTRAINT IF EXISTS verifications_type_document_agence_check;

-- 2. Ajouter la nouvelle contrainte avec toutes les valeurs de TypeDocumentAgence
ALTER TABLE verifications ADD CONSTRAINT verifications_type_document_agence_check
CHECK (type_document_agence IN (
    'RCCM',                        -- Registre du Commerce et du Crédit Mobilier
    'NIF',                         -- Numéro d'Identification Fiscale
    'NINA',                        -- Numéro d'Identification Nationale
    'AGREMENT',                    -- Agrément d'agence immobilière
    'PIECE_IDENTITE_RESPONSABLE',  -- Pièce d'identité du responsable
    'LICENCE_PROFESSIONNELLE',
    'CARTE_PROFESSIONNELLE',
    'REGISTRE_COMMERCE',
    'AUTORISATION_AGENCE',
    'STATUTS_JURIDIQUES',
    'ATTESTATION_ASSURANCE',
    'ATTESTATION_FISCALE',
    'PIECES_IDENTITE_DIRIGEANT',
    'JUSTIFICATIF_DOMICILE',
    'RIB',
    'CONTRAT_BAIL_LOCAL',
    'AUTORISATION_PREFECTORALE',
    'CERTIFICAT_NON_SITUATION',
    'DECLARATION_ACTIVITE',
    'FORMATION_PROFESSIONNELLE',
    'AUTRE'
));

-- 3. Vérification
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'verifications';
