-- Création de la table contact_agence
CREATE TABLE IF NOT EXISTS contact_agence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bien_id BIGINT NOT NULL,
    agence_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    date_contact TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_reponse TIMESTAMP NULL,
    reponse TEXT NULL,
    
    FOREIGN KEY (bien_id) REFERENCES bien(id) ON DELETE CASCADE,
    FOREIGN KEY (agence_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    
    INDEX idx_contact_agence (agence_id),
    INDEX idx_contact_client (client_id),
    INDEX idx_contact_bien (bien_id),
    INDEX idx_contact_statut (statut),
    INDEX idx_contact_date (date_contact)
);

-- Ajout de contrainte pour éviter les doublons de contact pour le même bien/client
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_contact_bien_client 
ON contact_agence (bien_id, client_id);
