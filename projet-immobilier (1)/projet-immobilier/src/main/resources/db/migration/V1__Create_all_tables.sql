-- Migration complète pour créer toutes les tables dans le bon ordre

-- 1. Création de la table roles
CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Insertion des rôles par défaut
INSERT INTO roles (nom, description, status, is_default) VALUES
('ADMIN', 'Administrateur système avec tous les droits', 'ACTIF', FALSE),
('AGENCE', 'Agence immobilière avec droits de gestion', 'ACTIF', FALSE),
('UTILISATEUR', 'Utilisateur standard avec droits de consultation', 'ACTIF', TRUE);

-- 2. Création de la table agences
CREATE TABLE agences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20) UNIQUE,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(100),
    pays VARCHAR(100),
    code_postal VARCHAR(20),
    numero_licence VARCHAR(100) UNIQUE,
    site_web VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE_VERIFICATION',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    id_role UUID NOT NULL,
    
    FOREIGN KEY (id_role) REFERENCES roles(id)
);

-- 3. Création de la table utilisateurs
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    date_naissance DATE,
    role_id UUID NOT NULL,
    id_agence UUID,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_agence) REFERENCES agences(id) ON DELETE SET NULL
);

-- 4. Table bien sera créée par Hibernate (ddl-auto=update)
-- 5. Table caracteristiques_bien sera créée par Hibernate (ddl-auto=update)
-- 6. Table annonce sera créée par Hibernate (ddl-auto=update)

-- Index pour optimisation
CREATE INDEX idx_roles_nom ON roles(nom);
CREATE INDEX idx_roles_status ON roles(status);

CREATE INDEX idx_agence_email ON agences(email);
CREATE INDEX idx_agence_telephone ON agences(telephone);
CREATE INDEX idx_agence_statut ON agences(statut);
CREATE INDEX idx_agence_ville ON agences(ville);
CREATE INDEX idx_agence_is_deleted ON agences(is_deleted);

CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_username ON utilisateurs(username);
CREATE INDEX idx_utilisateurs_role_id ON utilisateurs(role_id);
CREATE INDEX idx_utilisateurs_id_agence ON utilisateurs(id_agence);
CREATE INDEX idx_utilisateurs_is_active ON utilisateurs(is_active);
CREATE INDEX idx_utilisateurs_is_deleted ON utilisateurs(is_deleted);

CREATE INDEX idx_bien_ville ON bien(ville);
CREATE INDEX idx_bien_type_bien ON bien(type_bien);
CREATE INDEX idx_bien_statut ON bien(statut);
CREATE INDEX idx_bien_prix ON bien(prix);
CREATE INDEX idx_bien_utilisateur ON bien(id_utilisateur);
CREATE INDEX idx_bien_agence ON bien(id_agence);

CREATE INDEX idx_caracteristiques_bien_id_bien ON caracteristiques_bien(id_bien);
CREATE INDEX idx_caracteristiques_nb_chambres ON caracteristiques_bien(nb_chambres);
CREATE INDEX idx_caracteristiques_parking ON caracteristiques_bien(parking);

CREATE INDEX idx_annonce_id_utilisateur ON annonce(id_utilisateur);
CREATE INDEX idx_annonce_id_bien ON annonce(id_bien);
CREATE INDEX idx_annonce_statut ON annonce(statut);
CREATE INDEX idx_annonce_is_deleted ON annonce(is_deleted);
CREATE INDEX idx_caracteristiques_meuble ON caracteristiques_bien(meuble);
