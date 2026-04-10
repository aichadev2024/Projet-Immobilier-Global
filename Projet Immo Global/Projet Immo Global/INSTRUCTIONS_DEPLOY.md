# Instructions de Déploiement GitHub

## Pour le Développeur (Envoi au Boss)

### 1. Créer un dépôt GitHub personnel

1. Allez sur https://github.com/new
2. Nom du dépôt : `projet-immobilier-global`
3. Visibilité : **Privé** (recommandé)
4. Ne PAS initialiser avec README (on l'a déjà)
5. Cliquez sur **"Create repository"**

### 2. Pousser le code

Ouvrez PowerShell dans le dossier projet :

```powershell
# Aller dans le dossier projet
cd "C:\dev\Projet Immo Global\Projet Immo Global\Projet Immo Global"

# Initialiser Git
git init

# Configurer votre identité (si pas déjà fait)
git config user.email "votre-email@example.com"
git config user.name "Votre Nom"

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Projet Immobilier Global"

# Connecter au dépôt GitHub (remplacez USERNAME)
git remote add origin https://github.com/USERNAME/projet-immobilier-global.git

# Pousser le code
git branch -M main
git push -u origin main
```

### 3. Vérifier le push

Allez sur `https://github.com/USERNAME/projet-immobilier-global`
Vous devriez voir tous les fichiers.

### 4. Envoyer le lien au Boss

Envoyez ce message à votre boss :

```
Bonjour,

Le projet est prêt sur mon GitHub personnel :
https://github.com/USERNAME/projet-immobilier-global

Vous pouvez le récupérer et le mettre sur le GitHub entreprise.
Les instructions sont dans le fichier INSTRUCTIONS_DEPLOY.md

Cordialement
```

---

## Pour le Boss (Transfert vers GitHub Entreprise)

### Option 1 : Fork (Recommandé si le développeur garde son accès)

1. Connectez-vous au compte GitHub entreprise
2. Allez sur le lien du développeur
3. Cliquez sur **"Fork"** en haut à droite
4. Sélectionnez l'organisation GitHub entreprise
5. Le projet est copié dans l'organisation

### Option 2 : Import (Recommandé pour un transfert propre)

1. Créez un nouveau dépôt privé sur le GitHub entreprise
2. Nom : `projet-immobilier-global`
3. Pendant la création, cliquez sur **"Import a repository"**
4. Collez l'URL : `https://github.com/USERNAME/projet-immobilier-global`
5. Le projet est importé avec tout l'historique

### Option 3 : Clone local puis push

```bash
# Cloner depuis le développeur
git clone https://github.com/USERNAME/projet-immobilier-global.git
cd projet-immobilier-global

# Connecter au GitHub entreprise
git remote remove origin
git remote add origin https://github.com/ENTREPRISE/projet-immobilier-global.git

# Pousser
git push -u origin main
```

### Option 4 : ZIP (Dernier recours)

1. Sur le dépôt du développeur, cliquez **"Code"** > **"Download ZIP"**
2. Extrayez le ZIP
3. Créez un nouveau dépôt sur GitHub entreprise
4. Uploadez les fichiers via l'interface web

---

## Vérifications Post-Déploiement

### Checklist pour le Boss

- [ ] Dépôt créé sur GitHub entreprise
- [ ] Code présent (tous les fichiers)
- [ ] README.md visible
- [ ] .gitignore présent
- [ ] .env.example présent
- [ ] Accès données aux bonnes personnes

### Donner les accès

1. Allez sur le dépôt GitHub entreprise
2. **Settings** > **Manage access** > **Invite teams or people**
3. Ajoutez :
   - Le développeur (maintainer access)
   - Les autres développeurs de l'équipe
   - Les reviewers (read access)

---

## Configuration Post-Clonage

### Pour les nouveaux développeurs qui clonent

```bash
# Cloner le projet
git clone https://github.com/ENTREPRISE/projet-immobilier-global.git

# Backend
cd "projet-immobilier (1)/projet-immobilier"
cp .env.example .env
# Editer .env avec les configs locales
./mvnw spring-boot:run

# Frontend
cd admin-immo
npm install
npm run dev
```

---

## Sécurité

### ⚠️ Points Importants

1. **Jamais de `.env` avec vraies valeurs sur GitHub**
   - Seul `.env.example` est commité
   - Chaque dev créé son propre `.env` local

2. **BREVO_API_KEY** est dans les variables d'environnement
   - Ne pas la hardcoder dans le code
   - Utiliser les variables d'environnement

3. **JWT_SECRET** doit être unique par environnement
   - Générer une nouvelle clé pour la production

### Générer un nouveau JWT_SECRET

```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

---

## Support

En cas de problème :
1. Vérifier le fichier `.env` est bien créé
2. Vérifier MySQL est démarré
3. Vérifier les ports 8080 et 3000 sont libres
4. Consulter les logs dans la console

---

**Date de création :** Avril 2025  
**Version :** 1.0.0
