"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Camera,
  Save,
  Edit,
  Lock,
  Upload,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  nomUtilisateur: string;
  role: string;
  statut: string;
  createdAt: string;
  photoUrl?: string;
  lastLogin?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    nomUtilisateur: ""
  });
  
  const [passwordForm, setPasswordForm] = useState({
    motDePasseActuel: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        router.push("/login");
        return;
      }

      console.log("👤 Récupération du profil utilisateur...");
      
      const response = await fetch("http://localhost:8080/api/utilisateurs/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("👤 Profil utilisateur reçu:", userData);
        
        setUser(userData);
        setProfileForm({
          nom: userData.nom || "",
          prenom: userData.prenom || "",
          email: userData.email || "",
          telephone: userData.telephone || "",
          nomUtilisateur: userData.nomUtilisateur || ""
        });
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération du profil:", response.status, errorText);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("👤 Mise à jour du profil utilisateur...");
      
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${user.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom: profileForm.nom,
          prenom: profileForm.prenom,
          email: profileForm.email,
          telephone: profileForm.telephone,
          nomUtilisateur: profileForm.nomUtilisateur
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("✅ Profil mis à jour:", updatedUser);
        
        setUser(updatedUser);
        setEditing(false);
        
        // Mettre à jour le localStorage/sessionStorage
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedParsedUser = { ...parsedUser, ...updatedUser };
          localStorage.setItem("user", JSON.stringify(updatedParsedUser));
          sessionStorage.setItem("user", JSON.stringify(updatedParsedUser));
        }
        
        alert("✅ Profil mis à jour avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la mise à jour du profil:", response.status, errorText);
        alert("❌ Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil:", error);
      alert("❌ Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.nouveauMotDePasse !== passwordForm.confirmerMotDePasse) {
      alert("❌ Les mots de passe ne correspondent pas");
      return;
    }
    
    if (passwordForm.nouveauMotDePasse.length < 6) {
      alert("❌ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("🔒 Changement du mot de passe...");
      
      const response = await fetch("http://localhost:8080/api/utilisateurs/change-password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          motDePasseActuel: passwordForm.motDePasseActuel,
          nouveauMotDePasse: passwordForm.nouveauMotDePasse
        })
      });

      if (response.ok) {
        console.log("✅ Mot de passe changé avec succès");
        
        setPasswordForm({
          motDePasseActuel: "",
          nouveauMotDePasse: "",
          confirmerMotDePasse: ""
        });
        setPasswordMode(false);
        
        alert("✅ Mot de passe changé avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors du changement de mot de passe:", response.status, errorText);
        alert("❌ Erreur lors du changement de mot de passe");
      }
    } catch (error) {
      console.error("❌ Erreur lors du changement de mot de passe:", error);
      alert("❌ Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simuler l'upload de photo
      const reader = new FileReader();
      reader.onload = (e) => {
        if (user) {
          setUser({...user, photoUrl: e.target?.result as string});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Profil non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles et votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo et informations de base */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              {/* Photo de profil */}
              <div className="relative inline-block">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt="Photo de profil" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user.prenom?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {user.prenom} {user.nom}
              </h2>
              <p className="text-gray-600">{user.role}</p>
              
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {formatDate(user.createdAt)}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dernière connexion: {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setEditing(!editing)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {editing ? "Annuler" : "Modifier le profil"}
              </button>
              <button
                onClick={() => setPasswordMode(!passwordMode)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {passwordMode ? "Annuler" : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={editing ? profileForm.nom : user.nom}
                  onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={editing ? profileForm.prenom : user.prenom}
                  onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editing ? profileForm.email : user.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editing ? profileForm.telephone : user.telephone || ""}
                  onChange={(e) => setProfileForm({...profileForm, telephone: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={editing ? profileForm.nomUtilisateur : user.nomUtilisateur}
                  onChange={(e) => setProfileForm({...profileForm, nomUtilisateur: e.target.value})}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Changement de mot de passe */}
          {passwordMode && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                Changer le mot de passe
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.motDePasseActuel}
                    onChange={(e) => setPasswordForm({...passwordForm, motDePasseActuel: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.nouveauMotDePasse}
                    onChange={(e) => setPasswordForm({...passwordForm, nouveauMotDePasse: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmerMotDePasse}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmerMotDePasse: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
