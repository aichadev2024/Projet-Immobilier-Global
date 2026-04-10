# Projet Immobilier Global

Plateforme immobilière complète avec backend Spring Boot et frontend Next.js.

## Structure du Projet

```
Projet Immo Global/
├── projet-immobilier/          # Backend Spring Boot
│   └── projet-immobilier/
│       ├── src/main/java/      # Code source Java
│       └── src/main/resources/ # Configuration
├── admin-immo/                 # Frontend Next.js (Admin & Agence)
│   ├── app/                    # Pages Next.js
│   └── components/             # Composants React
└── .env.example                # Variables d'environnement exemple
```

## Prérequis

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven

## Installation

### 1. Backend (Spring Boot)

```bash
cd "projet-immobilier (1)/projet-immobilier"

# Copier et configurer les variables d'environnement
cp ../../.env.example .env
# Editer .env avec vos configurations

# Compiler et lancer
./mvnw spring-boot:run
```

Le backend démarre sur `http://localhost:8080`

### 2. Frontend (Next.js)

```bash
cd admin-immo

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## Configuration

### Variables d'environnement (.env)

```env
# Base de données
DB_URL=jdbc:mysql://localhost:3306/projetimmobilier
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre-cle-secrete
JWT_EXPIRATION=86400000

# Email (Brevo)
BREVO_API_KEY=votre-api-key

# Frontend URL (pour les emails)
FRONTEND_URL=http://localhost:3000
```

## Fonctionnalités

- **Admin** : Gestion des agences, validations, statistiques
- **Agence** : Gestion des biens, agents, réservations
- **Agent** : Espace dédié avec accès aux biens
- **Client** : Recherche de biens, réservations

## API Endpoints

- `POST /auth/login` - Authentification
- `GET /api/utilisateurs/me` - Profil utilisateur
- `GET /api/agences/profile` - Profil agence
- `GET /api/admin/validation/agences` - Liste agences (admin)

## Rôles Utilisateurs

- `ADMIN` - Administrateur système
- `AGENCE` - Propriétaire d'agence
- `AGENT` - Agent immobilier
- `UTILISATEUR` - Client

## Déploiement

### Développement
```bash
# Backend
./mvnw spring-boot:run

# Frontend
npm run dev
```

### Production
Voir le fichier `.env.example` pour la configuration production.

## Auteur

Projet développé pour [Nom de l'entreprise].
