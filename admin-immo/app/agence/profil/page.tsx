"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Camera,
  Edit2,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";

interface AgenceProfile {
  id: string;
  nomAgence: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  codePostal: string;
  siteWeb?: string;
  description?: string;
  logoUrl?: string;
  photos: string[];
  horairesOuverture: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  statut: "ACTIF" | "EN_ATTENTE" | "INACTIF";
  ninea?: string;
  numeroLicence?: string;
  dateCreation: string;
}

export default function AgenceProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<AgenceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    nomAgence: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    codePostal: "",
    siteWeb: "",
    description: "",
    ninea: "",
    numeroLicence: "",
    horairesOuverture: {
      lundi: "08:00-18:00",
      mardi: "08:00-18:00",
      mercredi: "08:00-18:00",
      jeudi: "08:00-18:00",
      vendredi: "08:00-18:00",
      samedi: "08:00-12:00",
      dimanche: "Fermé"
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      router.push("/login");
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/agences/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🏢 Agence profile received:", data);
        setProfile(data);
        setFormData({
          nomAgence: data.nom || data.nomAgence || "", // Backend returns 'nom', interface uses 'nomAgence'
          email: data.email || "",
          telephone: data.telephone || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          pays: data.pays || "",
          codePostal: data.codePostal || "",
          siteWeb: data.siteWeb || "",
          description: data.description || "",
          ninea: data.ninea || "",
          numeroLicence: data.numeroLicence || "",
          horairesOuverture: data.horairesOuverture || formData.horairesOuverture
        });
      } else {
        // Utiliser des données mock si le backend n'est pas prêt
        const mockProfile: AgenceProfile = {
          id: "1",
          nomAgence: "Test Agence Mali",
          email: "agence@test.com",
          telephone: "+223 50 47 97 77",
          adresse: "ACI 2000, Rue 123",
          ville: "Bamako",
          pays: "Mali",
          codePostal: "BP 1234",
          siteWeb: "www.testagence.ml",
          description: "Agence immobilière spécialisée dans la vente et la location de biens de prestige à Bamako",
          logoUrl: "",
          photos: [],
          horairesOuverture: {
            lundi: "08:00-18:00",
            mardi: "08:00-18:00",
            mercredi: "08:00-18:00",
            jeudi: "08:00-18:00",
            vendredi: "08:00-18:00",
            samedi: "08:00-12:00",
            dimanche: "Fermé"
          },
          statut: "ACTIF",
          ninea: "NINEA123456",
          numeroLicence: "LIC789456",
          dateCreation: "2024-03-15"
        };
        setProfile(mockProfile);
        setFormData({
          nomAgence: mockProfile.nomAgence,
          email: mockProfile.email,
          telephone: mockProfile.telephone,
          adresse: mockProfile.adresse,
          ville: mockProfile.ville,
          pays: mockProfile.pays,
          codePostal: mockProfile.codePostal,
          siteWeb: mockProfile.siteWeb || "",
          description: mockProfile.description || "",
          ninea: mockProfile.ninea || "",
          numeroLicence: mockProfile.numeroLicence || "",
          horairesOuverture: mockProfile.horairesOuverture
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/agences/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
        setEditing(false);
        if (token) fetchProfile(token);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoraireChange = (jour: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      horairesOuverture: {
        ...prev.horairesOuverture,
        [jour]: value
      }
    }));
  };

  const getStatutBadge = (statut: string) => {
    const badges = {
      "ACTIF": { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "Actif" },
      "EN_ATTENTE": { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" />, label: "En attente" },
      "INACTIF": { color: "bg-red-100 text-red-800", icon: <X className="w-4 h-4" />, label: "Inactif" }
    };
    return badges[statut as keyof typeof badges] || badges["EN_ATTENTE"];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Profil de l'agence</h1>
          <p className="mt-3 text-lg text-gray-600">Gérez les informations de votre agence immobilière</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium ${getStatutBadge(profile.statut).color}`}>
            {getStatutBadge(profile.statut).icon}
            {getStatutBadge(profile.statut).label}
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base font-medium"
            >
              <Edit2 className="w-5 h-5" />
              Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
              >
                <X className="w-5 h-5" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-base font-medium"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo et logo */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo et photos</h2>
            <div className="space-y-4">
              {/* Logo */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <button className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    Changer le logo
                  </button>
                )}
              </div>

              {/* Photos */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Photos de l'agence</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      {profile.photos?.[i - 1] ? (
                        <img src={profile.photos[i - 1]} alt={`Photo ${i}`} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
                {editing && (
                  <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    Ajouter des photos
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'agence</label>
                <input
                  type="text"
                  value={formData.nomAgence}
                  onChange={(e) => handleInputChange('nomAgence', e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  value={formData.siteWeb}
                  onChange={(e) => handleInputChange('siteWeb', e.target.value)}
                  disabled={!editing}
                  placeholder="www.exemple.com"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  disabled={!editing}
                  placeholder="Rue, numéro, quartier"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <input
                  type="text"
                  value={formData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  disabled={!editing}
                  placeholder="Ville"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  value={formData.pays}
                  onChange={(e) => handleInputChange('pays', e.target.value)}
                  disabled={!editing}
                  placeholder="Pays"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <input
                  type="text"
                  value={formData.codePostal}
                  onChange={(e) => handleInputChange('codePostal', e.target.value)}
                  disabled={!editing}
                  placeholder="Code postal"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!editing}
                rows={4}
                placeholder="Décrivez votre agence, vos services, votre expertise..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NINEA</label>
                <input
                  type="text"
                  value={formData.ninea}
                  onChange={(e) => handleInputChange('ninea', e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de licence</label>
                <input
                  type="text"
                  value={formData.numeroLicence}
                  onChange={(e) => handleInputChange('numeroLicence', e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Horaires d'ouverture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(formData.horairesOuverture).map(([jour, horaire]) => (
            <div key={jour}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{jour}</label>
              <input
                type="text"
                value={horaire}
                onChange={(e) => handleHoraireChange(jour, e.target.value)}
                disabled={!editing}
                placeholder="ex: 08:00-18:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
