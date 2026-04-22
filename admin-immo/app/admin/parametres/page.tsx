"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Globe,
  Palette,
  Smartphone,
  Save,
  Upload,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";

interface PlatformSettings {
  nomPlatforme: string;
  logoUrl: string;
  emailContact: string;
  telephoneContact: string;
  adresse: string;
  description: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  maintenanceMode: boolean;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  notificationsPush: boolean;
}

interface NotificationTemplate {
  id: string;
  type: "BIEN_VALIDÉ" | "AGENCE_VALIDÉE" | "NOUVEAU_MESSAGE" | "RDV_CONFIRMÉ";
  sujet: string;
  contenu: string;
  actif: boolean;
}

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
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    nomPlatforme: "Ika Bayt",
    logoUrl: "",
    emailContact: "contact@ikabayt.com",
    telephoneContact: "+223 70 00 00 00",
    adresse: "Bamako, Mali",
    description: "Plateforme immobilière de référence au Mali",
    couleurPrimaire: "#4F46E5",
    couleurSecondaire: "#10B981",
    maintenanceMode: false,
    notificationsEmail: true,
    notificationsSms: true,
    notificationsPush: true
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

  const [notifications, setNotifications] = useState<NotificationTemplate[]>([
    {
      id: "1",
      type: "BIEN_VALIDÉ",
      sujet: "Votre bien a été validé",
      contenu: "Félicitations ! Votre bien a été validé et est maintenant visible sur la plateforme.",
      actif: true
    },
    {
      id: "2",
      type: "AGENCE_VALIDÉE",
      sujet: "Votre agence a été validée",
      contenu: "Votre agence a été validée avec succès. Vous pouvez maintenant publier des biens.",
      actif: true
    },
    {
      id: "3",
      type: "NOUVEAU_MESSAGE",
      sujet: "Nouveau message reçu",
      contenu: "Vous avez reçu un nouveau message concernant votre bien.",
      actif: true
    },
    {
      id: "4",
      type: "RDV_CONFIRMÉ",
      sujet: "Rendez-vous confirmé",
      contenu: "Votre demande de visite a été confirmée par le propriétaire.",
      actif: true
    }
  ]);

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUserProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📡 Récupération des paramètres de la plateforme...");
      
      // Pour l'instant, on simule (à implémenter dans le backend)
      // const response = await fetch("http://localhost:8080/api/admin/settings", {
      //   method: "GET",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      
      // if (response.ok) {
      //   const settingsData = await response.json();
      //   setSettings(settingsData);
      // }
      
      console.log("✅ Paramètres chargés (simulation)");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des paramètres:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
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
        
        setUserProfile(userData);
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
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("💾 Sauvegarde des paramètres de la plateforme...");
      
      // Pour l'instant, on simule (à implémenter dans le backend)
      // const response = await fetch("http://localhost:8080/api/admin/settings", {
      //   method: "PUT",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("✅ Paramètres sauvegardés avec succès");
      alert("✅ Paramètres sauvegardés avec succès!");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des paramètres:", error);
      alert("❌ Erreur lors de la sauvegarde des paramètres");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userProfile) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("👤 Mise à jour du profil utilisateur...");
      
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${userProfile.id}`, {
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
        
        setUserProfile(updatedUser);
        
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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simuler l'upload du logo
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings({...settings, logoUrl: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const updateNotification = (id: string, updates: Partial<NotificationTemplate>) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, ...updates } : notif
    ));
  };

  const tabs = [
    { id: "general", label: "Général", icon: <Settings className="w-4 h-4" /> },
    { id: "profile", label: "Profile", icon: <Settings className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "securite", label: "Sécurité", icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Paramètres
        </h1>
        <p className="mt-2 text-gray-600">
          Configurez les paramètres de la plateforme
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Général */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Informations de base
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la plateforme
                      </label>
                      <input
                        type="text"
                        value={settings.nomPlatforme}
                        onChange={(e) => setSettings({...settings, nomPlatforme: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings({...settings, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={settings.adresse}
                        onChange={(e) => setSettings({...settings, adresse: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact et apparence */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Contact et apparence
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact
                      </label>
                      <input
                        type="email"
                        value={settings.emailContact}
                        onChange={(e) => setSettings({...settings, emailContact: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone de contact
                      </label>
                      <input
                        type="tel"
                        value={settings.telephoneContact}
                        onChange={(e) => setSettings({...settings, telephoneContact: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Couleur primaire
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.couleurPrimaire}
                            onChange={(e) => setSettings({...settings, couleurPrimaire: e.target.value})}
                            className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.couleurPrimaire}
                            onChange={(e) => setSettings({...settings, couleurPrimaire: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Couleur secondaire
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.couleurSecondaire}
                            onChange={(e) => setSettings({...settings, couleurSecondaire: e.target.value})}
                            className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.couleurSecondaire}
                            onChange={(e) => setSettings({...settings, couleurSecondaire: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de la plateforme
                      </label>
                      <div className="flex items-center gap-4">
                        {settings.logoUrl && (
                          <img 
                            src={settings.logoUrl} 
                            alt="Logo" 
                            className="h-16 w-16 object-contain border border-gray-300 rounded-lg"
                          />
                        )}
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Téléverser un logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options système */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  Options système
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Mode maintenance</p>
                      <p className="text-sm text-gray-600">Désactive temporairement l'accès à la plateforme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Profile */}
          {activeTab === "profile" && userProfile && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Informations du profil
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={profileForm.nom}
                        onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={profileForm.prenom}
                        onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        value={profileForm.nomUtilisateur}
                        onChange={(e) => setProfileForm({...profileForm, nomUtilisateur: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.telephone}
                        onChange={(e) => setProfileForm({...profileForm, telephone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        value={userProfile.role}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

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
                        Mettre à jour le profil
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Changer le mot de passe
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Configuration des notifications
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Email</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationsEmail}
                        onChange={(e) => setSettings({...settings, notificationsEmail: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">SMS</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationsSms}
                        onChange={(e) => setSettings({...settings, notificationsSms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">Push</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationsPush}
                        onChange={(e) => setSettings({...settings, notificationsPush: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modèles de notifications */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Modèles de notifications</h4>
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{notif.sujet}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            notif.actif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {notif.type.replace("_", " ")}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notif.actif}
                            onChange={(e) => updateNotification(notif.id, { actif: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu du message
                        </label>
                        <textarea
                          value={notif.contenu}
                          onChange={(e) => updateNotification(notif.id, { contenu: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "securite" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Paramètres de sécurité
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <p className="font-medium text-yellow-800">Authentification à deux facteurs</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Activez l'authentification 2FA pour renforcer la sécurité des comptes administrateurs.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-blue-800">Sauvegarde automatique</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Les données sont sauvegardées automatiquement toutes les 6 heures.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-green-800">Journal des activités</p>
                        <p className="text-sm text-green-700 mt-1">
                          Toutes les actions administrateurs sont enregistrées et conservées pendant 90 jours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          Annuler
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Sauvegarder les paramètres
            </>
          )}
        </button>
      </div>
    </div>
  );
}
