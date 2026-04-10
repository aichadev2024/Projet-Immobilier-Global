# Projet Immo Global

Plateforme immobilière complète avec système de gestion d'agences, de biens, de réservations et de documents administratifs.

## Structure du Projet

```
projet-immobilier/     # Backend Spring Boot (API REST)
admin-immo/            # Frontend Next.js (Dashboard Admin & Agence)
```

## Fonctionnalités

### Backend (Spring Boot)
- 🔐 Authentification JWT avec OTP (email)
- 👤 Gestion des utilisateurs (ADMIN, SUPER_ADMIN, AGENCE, CLIENT)
- 🏢 Gestion des agences immobilières
- 🏠 Gestion des biens immobiliers
- 📅 Système de réservation de visites
- 💬 Système de messagerie (contact agence)
- ⭐ Système d'avis et notation
- 📄 Gestion des documents administratifs
  - Documents d'agence (validés par admin)
  - Documents de biens (gérés par l'agence)
- 💳 Système de visites payantes (optionnel)

### Frontend (Next.js)
- 🎨 Interface moderne avec Tailwind CSS
- 📱 Responsive design
- 🔐 Authentification complète
- 📊 Dashboard avec statistiques réelles
- 📄 Gestion des documents

## Prérequis

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

## Installation

### Backend

```bash
cd "projet-immobilier (1)/projet-immobilier"
./mvnw clean install
./mvnw spring-boot:run
```

Le backend démarre sur `http://localhost:8080`

### Frontend

```bash
cd admin-immo
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

## Configuration

### Backend
Créer un fichier `.env` dans le dossier backend :

```properties
DB_URL=jdbc:mysql://localhost:3306/immo_db
DB_USERNAME=root
DB_PASSWORD=votre_password
JWT_SECRET=votre_secret_jwt
MAIL_USERNAME=votre_email
MAIL_PASSWORD=votre_mot_de_passe_app
```

### Frontend
Créer un fichier `.env.local` dans le dossier frontend :

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## API Documentation

### Endpoints principaux

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/biens` - Liste des biens
- `POST /api/biens` - Créer un bien
- `GET /api/agences` - Liste des agences
- `GET /api/stats/agence` - Statistiques agence
- `GET /api/documents-bien/bien/{id}` - Documents d'un bien
- `POST /api/documents-bien/upload/{id}` - Upload document

## Auteurs

Développé pour Projet Immo Global
