"use client";
import { API_BASE_URL } from "@/services/api";


import React, { useState } from "react";
import {
  Megaphone, Search, Filter, Eye, MousePointerClick,
  Calendar, MoreVertical, ExternalLink, Activity
} from "lucide-react";

interface Annonce {
  id: string;
  titre: string;
  type: string;
  statut: "EN_LIGNE" | "PAUSE" | "EXPIREE";
  vues: number;
  clics: number;
  contacts: number;
  datePublication: string;
  prix: number;
  image: string;
  createdById?: string;
}
// Remove static mockAnnonces since we will fetch from API
interface AnnonceResponse {
  id: number;
  typeAnnonce: string;
  statut: "ACTIVE" | "INACTIVE" | "EXPIREE" | "EN_LIGNE" | "PAUSE";
  libelleBien: string;
  prix: number;
  images: string[];
  createdById?: string;
}

export default function AgenceAnnonces() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string, role: string } | null>(null);
  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;

    const fetchUserProfile = async (token: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser({
            id: data.id,
            role: data.role?.nom || data.role || ""
          });
        }
      } catch (error) {
        console.error("Erreur profil:", error);
      }
    };

    const fetchAnnonces = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/annonces/mes-annonces`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data: AnnonceResponse[] = await response.json();
          // Map to UI model
          const mapped = data.map(item => {
            // Mapper les statuts du backend vers le format UI
            let mappedStatut: "EN_LIGNE" | "PAUSE" | "EXPIREE" = "EN_LIGNE";
            if (item.statut === "ACTIVE") mappedStatut = "EN_LIGNE";
            else if (item.statut === "INACTIVE") mappedStatut = "PAUSE";
            else if (item.statut === "EXPIREE") mappedStatut = "EXPIREE";

            return {
              id: item.id.toString(),
              titre: item.libelleBien || "Annonce sans titre",
              type: item.typeAnnonce || "N/A",
              statut: mappedStatut,
              vues: Math.floor(Math.random() * 500) + 50, // Mock stats pour l'instant
              clics: Math.floor(Math.random() * 100) + 10,
              contacts: Math.floor(Math.random() * 20),
              datePublication: new Date().toISOString(),
              prix: item.prix || 0,
              image: item.images && item.images.length > 0 
                ? (item.images[0].startsWith("http") ? item.images[0] : `${API_BASE_URL}${item.images[0]}`)
                : "/images/Appartement a sotuba.jpg",
              createdById: item.createdById
            };
          });
          setAnnonces(mapped);
        }
      } catch (error) {
        console.error("Erreur annonces", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile(token);
      fetchAnnonces();
    }
  }, []);

  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = annonce.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === "TOUS" || annonce.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-ML', { style: 'currency', currency: 'XOF' }).format(price);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'EN_LIGNE':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">En Ligne</span>;
      case 'PAUSE':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">En Pause</span>;
      case 'EXPIREE':
        return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-200">Expirée</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-500" />
            Mes Annonces
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez la diffusion de vos biens sur les portails.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Booster une annonce
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Annonces Actives</div>
          <div className="text-3xl font-bold text-slate-900">{annonces.filter(a => a.statut === 'EN_LIGNE').length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Vues Totales (30j)</div>
          <div className="text-3xl font-bold text-slate-900">2.4K</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Taux de clic moyen</div>
          <div className="text-3xl font-bold text-slate-900">18%</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Contacts générés</div>
          <div className="text-3xl font-bold text-indigo-600">18</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une annonce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_LIGNE">En Ligne</option>
            <option value="PAUSE">En Pause</option>
            <option value="EXPIREE">Expirées</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnonces.map((annonce) => (
            <div key={annonce.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
              {/* Image */}
              <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
                <img src={annonce.image} alt={annonce.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2">
                  {getStatutBadge(annonce.statut)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{annonce.titre}</h3>
                      <p className="text-sm text-slate-500">{annonce.type} • {formatPrice(annonce.prix)}</p>
                    </div>
                    {currentUser && (
                      <div className="flex gap-1">
                        {(currentUser.role === 'AGENCE' || (currentUser.role === 'AGENT' && annonce.createdById === currentUser.id)) && (
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifier">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}
                        {/* Seule une AGENCE peut supprimer/arrêter une annonce */}
                        {currentUser.role === 'AGENCE' && (
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                            <ExternalLink className="w-5 h-5 rotate-45" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold">{annonce.vues} vues</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold">{annonce.clics} clics</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-semibold">{annonce.contacts} contacts</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 ml-auto text-xs font-medium">
                    <Calendar className="w-4 h-4" />
                    Depuis le {new Date(annonce.datePublication).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredAnnonces.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500">Aucune annonce trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
