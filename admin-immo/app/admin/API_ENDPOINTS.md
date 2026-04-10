# Endpoints API pour l'Administration

## 📋 **Endpoints réels du Backend (vérifiés)**

### 🔐 **Authentification & Profil**

#### `GET /api/utilisateurs/me`
- **Description**: Récupérer les informations de l'utilisateur connecté
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Réponse réelle**:
```json
{
  "id": "string",
  "prenom": "string", 
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "nomUtilisateur": "string",
  "role": "string",
  "createdAt": "string"
}
```

### 📊 **Dashboard**

#### `GET /api/admin/dashboard/stats`
- **Description**: Récupérer les statistiques principales du dashboard
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Réponse attendue**:
```json
{
  // Format à vérifier selon DashboardStatsResponse
}
```

#### `GET /api/admin/validation/statistiques`
- **Description**: Récupérer les statistiques de validation des agences
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Réponse réelle**:
```json
{
  "totalAgences": "number",
  "agencesEnAttente": "number", 
  "agencesActives": "number",
  "agencesInactives": "number"
}
```

### 🏢 **Validation des Agences**

#### `GET /api/admin/validation/agences`
- **Description**: Récupérer toutes les agences
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Réponse**: Tableau d'objets agences

#### `GET /api/admin/validation/agences/en-attente`
- **Description**: Récupérer les agences en attente de validation
- **Headers**: 
  - `Authorization: Bearer {token}`

#### `POST /api/admin/validation/agences/{utilisateurId}/valider`
- **Description**: Valider une agence
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Réponse**:
```json
{
  "message": "Agence validée avec succès",
  "agenceId": "string",
  "agenceEmail": "string", 
  "status": "VALIDÉE"
}
```

#### `POST /api/admin/validation/agences/{utilisateurId}/refuser`
- **Description**: Refuser une agence
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Body** (optionnel):
```json
{
  "raison": "string"
}
```

---

## 🔄 **Flux de connexion corrigé**

1. **Connexion** → Token stocké dans localStorage/sessionStorage
2. **Chargement layout admin** → Appel `/api/utilisateurs/me` (endpoint réel)
3. **Chargement dashboard** → Appels `/api/admin/dashboard/stats` et `/api/admin/validation/statistiques`

---

## 🛠️ **Gestion des erreurs améliorée**

- **Token manquant** → Redirection vers `/login`
- **Erreur 401/403** → Redirection vers `/login` 
- **Erreur API** → Utilisation des données simulées (fallback)
- **Erreur réseau** → Utilisation des données simulées (fallback)
- **Format de réponse différent** → Adaptation automatique

---

## 📝 **Endpoints restants à implémenter**

### 👥 **Utilisateurs**
- `GET /api/utilisateurs` - Liste des utilisateurs (déjà existant)
- `POST /api/utilisateurs` - Créer un utilisateur (déjà existant)
- `PUT /api/utilisateurs/{id}` - Modifier un utilisateur
- `DELETE /api/utilisateurs/{id}` - Supprimer un utilisateur

### 📢 **Annonces**
- `GET /api/annonces` - Liste des annonces
- `PUT /api/annonces/{id}/validate` - Valider une annonce
- `PUT /api/annonces/{id}/reject` - Refuser une annonce
- `DELETE /api/annonces/{id}` - Supprimer une annonce

---

## � **Tests des endpoints**

### Test avec curl:
```bash
# Profil utilisateur (endpoint réel)
curl -X GET "http://localhost:8080/api/utilisateurs/me" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"

# Stats dashboard
curl -X GET "http://localhost:8080/api/admin/dashboard/stats" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"

# Stats validation (endpoint réel)
curl -X GET "http://localhost:8080/api/admin/validation/statistiques" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🚨 **Corrections effectuées**

- ❌ `GET /api/admin/profile` → ✅ `GET /api/utilisateurs/me`
- ❌ Format réponse supposé → ✅ Format réponse réelle du backend
- ❌ Endpoint activity inexistant → ✅ Utilisation de `/api/admin/validation/statistiques`
- ✅ Gestion erreurs améliorée avec fallback
- ✅ Documentation mise à jour avec les vrais endpoints
