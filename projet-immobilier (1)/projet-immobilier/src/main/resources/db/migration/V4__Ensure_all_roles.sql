-- Migration: Ensure all required roles exist
-- Date: 2025-04-07

-- Insert all required roles if they don't exist
INSERT INTO roles (nom, description, status, is_default)
SELECT 'ADMIN', 'Administrateur système avec tous les droits', 'ACTIF', FALSE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nom = 'ADMIN');

INSERT INTO roles (nom, description, status, is_default)
SELECT 'AGENCE', 'Agence immobilière avec droits de gestion', 'ACTIF', FALSE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nom = 'AGENCE');

INSERT INTO roles (nom, description, status, is_default)
SELECT 'UTILISATEUR', 'Utilisateur standard avec droits de consultation', 'ACTIF', TRUE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nom = 'UTILISATEUR');

INSERT INTO roles (nom, description, status, is_default)
SELECT 'AGENT', 'Agent immobilier travaillant pour une agence', 'ACTIF', FALSE
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nom = 'AGENT');
