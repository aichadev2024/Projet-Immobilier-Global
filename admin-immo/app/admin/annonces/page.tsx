"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Megaphone,
  Calendar,
  Building,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { API_BASE_URL } from "@/services/api";

interface Annonce {
  id: string;
  titre: string;
  description: string;
  type: "VENTE" | "LOCATION" | "LOCATION_VENTE";
  statut: "EN_ATTENTE" | "VALIDEE" | "REJETEE";
  datePublication: string;
  bienId: string;
  bienTitre: string;
  agenceId: string;
  agenceNom: string;
  prix?: number;
  ville?: string;
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnnonces();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📡 Récupération des annonces depuis le backend...");
      
      const response = await fetch(`${API_BASE_URL}/api/annonces`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const annoncesData = await response.json();
        console.log("📢 Annonces reçues:", annoncesData);
        
        // Transformer les données du backend au format du frontend
        const formattedAnnonces: Annonce[] = annoncesData.map((annonce: any) => ({
          id: annonce.id.toString(),
          titre: annonce.titre || "Annonce sans titre",
          description: annonce.description || "Pas de description",
          type: mapTypeToAnnonceType(annonce.typeAnnonce),
          statut: mapStatutToAnnonceStatut(annonce.statut),
          datePublication: annonce.dateCreation,
          bienId: annonce.idBien?.toString() || "unknown",
          bienTitre: annonce.libelleBien || "Bien non spécifié",
          agenceId: "unknown",
          agenceNom: annonce.agenceNom || "Agence inconnue",
          prix: annonce.prix,
          ville: annonce.adresse || "Non spécifiée"
        }));

        setAnnonces(formattedAnnonces);
        setTotalPages(Math.ceil(formattedAnnonces.length / 10));
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération des annonces:", response.status, errorText);
        
        // En cas d'erreur, utiliser les données simulées
        const mockAnnonces: Annonce[] = [
          {
            id: "1",
            titre: "Villa de luxe à Bamako",
            description: "Magnifique villa avec piscine et jardin",
            type: "VENTE",
            statut: "EN_ATTENTE",
            datePublication: "2024-03-01T10:30:00Z",
            bienId: "1",
            bienTitre: "Villa moderne à Hippodrome",
            agenceId: "1",
            agenceNom: "Mali Immobilier",
            prix: 45000000,
            ville: "Bamako"
          }
        ];

        setAnnonces(mockAnnonces);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mapper les types du backend vers le frontend
  const mapTypeToAnnonceType = (backendType: string): Annonce['type'] => {
    switch (backendType) {
      case 'VENTE':
        return 'VENTE';
      case 'LOCATION':
        return 'LOCATION';
      case 'LOCATION_VENTE':
        return 'LOCATION_VENTE';
      default:
        return 'VENTE';
    }
  };

  // Mapper les statuts du backend vers le frontend
  const mapStatutToAnnonceStatut = (backendStatut: string): Annonce['statut'] => {
    switch (backendStatut) {
      case 'EN_ATTENTE':
        return 'EN_ATTENTE';
      case 'VALIDE':
        return 'VALIDEE';
      case 'REFUSE':
        return 'REJETEE';
      default:
        return 'EN_ATTENTE';
    }
  };

  const handleValidateAnnonce = async (annonceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir valider cette annonce ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`✅ Validation de l'annonce ${annonceId}...`);
      
      // Pour l'instant, on simule l'action (à implémenter dans le backend)
      // const response = await fetch(`${API_BASE_URL}/api/annonces/${annonceId}/valider`, {
      //   method: "PUT",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      
      // Simulation locale pour le moment
      setAnnonces(prevAnnonces => 
        prevAnnonces.map((annonce: Annonce) => 
          annonce.id === annonceId ? { ...annonce, statut: 'VALIDEE' } : annonce
        )
      );
      
      console.log("✅ Annonce validée avec succès");
      alert("✅ Annonce validée avec succès!");
      
    } catch (error) {
      console.error("❌ Erreur lors de la validation de l'annonce:", error);
      alert("❌ Erreur lors de la validation de l'annonce");
    }
  };

  const handleRejectAnnonce = async (annonceId: string) => {
    const raison = prompt("Veuillez indiquer la raison du refus:");
    if (!raison) return;
    
    if (!confirm("Êtes-vous sûr de vouloir refuser cette annonce ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`❌ Refus de l'annonce ${annonceId}...`);
      
      // Pour l'instant, on simule l'action (à implémenter dans le backend)
      // const response = await fetch(`${API_BASE_URL}/api/annonces/${annonceId}/refuser`, {
      //   method: "PUT",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ raison: raison })
      // });
      
      // Simulation locale pour le moment
      setAnnonces(prevAnnonces => 
        prevAnnonces.map((annonce: Annonce) => 
          annonce.id === annonceId ? { ...annonce, statut: 'REJETEE' } : annonce
        )
      );
      
      console.log("❌ Annonce refusée avec succès");
      alert("❌ Annonce refusée avec succès!");
      
    } catch (error) {
      console.error("❌ Erreur lors du refus de l'annonce:", error);
      alert("❌ Erreur lors du refus de l'annonce");
    }
  };

  const handleDeleteAnnonce = async (annonceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`🗑️ Suppression de l'annonce ${annonceId}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/annonces/${annonceId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setAnnonces(prevAnnonces => prevAnnonces.filter((annonce: Annonce) => annonce.id !== annonceId));
        console.log("✅ Annonce supprimée avec succès");
        alert("✅ Annonce supprimée avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la suppression:", response.status, errorText);
        alert("❌ Erreur lors de la suppression");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      alert("❌ Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatPrice = (prix?: number) => {
    if (!prix) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0
    }).format(prix);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "VENTE":
        return "bg-blue-100 text-blue-800";
      case "LOCATION":
        return "bg-green-100 text-green-800";
      case "LOCATION_VENTE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800";
      case "VALIDEE":
        return "bg-green-100 text-green-800";
      case "REJETEE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.bienTitre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "TOUS" || annonce.statut === statusFilter;
    const matchesType = typeFilter === "TOUS" || annonce.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: annonces.length,
    enAttente: annonces.filter(a => a.statut === "EN_ATTENTE").length,
    validees: annonces.filter(a => a.statut === "VALIDEE").length,
    rejetees: annonces.filter(a => a.statut === "REJETEE").length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des annonces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Annonces
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Validez et gérez toutes les annonces de la plateforme
          </p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95">
          <Megaphone className="w-4 h-4" />
          <span className="text-sm font-semibold">Nouvelle annonce</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "from-blue-600 to-indigo-600", bg: "bg-blue-50 border-blue-200", icon: Megaphone },
          { label: "En attente", value: stats.enAttente, color: "from-amber-500 to-orange-600", bg: "bg-amber-50 border-amber-200", icon: Calendar },
          { label: "Validées", value: stats.validees, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
          { label: "Rejetées", value: stats.rejetees, color: "from-red-500 to-pink-600", bg: "bg-red-50 border-red-200", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className={`bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border ${s.bg} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl sm:text-2xl font-black ${s.label === "Total" ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" : "text-slate-900"}`}>{s.value}</p>
              </div>
              <div className={`p-2 sm:p-3 bg-gradient-to-br ${s.color} rounded-xl shadow-lg`}>
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validées</option>
              <option value="REJETEE">Rejetées</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="TOUS">Tous les types</option>
              <option value="VENTE">Vente</option>
              <option value="LOCATION">Location</option>
              <option value="LOCATION_VENTE">Location-Vente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des annonces */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Agence
                </th>
                <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnonces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune annonce trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredAnnonces.map((annonce) => (
                  <tr key={annonce.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{annonce.titre}</div>
                        <div className="text-[10px] sm:text-xs text-slate-500 mt-1 line-clamp-1 sm:line-clamp-2 italic">
                          {annonce.bienTitre}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                           <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-black rounded border ${getTypeBadge(annonce.type)}`}>
                             {annonce.type === 'VENTE' ? 'Vente' : annonce.type === 'LOCATION' ? 'Loc.' : 'L-V'}
                           </span>
                           {annonce.prix && (
                             <div className="text-xs font-black text-indigo-600">
                               {formatPrice(annonce.prix)}
                             </div>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${getTypeBadge(annonce.type)}`}>
                        {annonce.type === 'VENTE' ? 'Vente' : annonce.type === 'LOCATION' ? 'Location' : 'Location-Vente'}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Building className="w-4 h-4 text-indigo-400" />
                        <span className="truncate max-w-[120px]">{annonce.agenceNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span>{annonce.agenceNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(annonce.datePublication)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {annonce.statut === "EN_ATTENTE" && (
                          <>
                            <button
                              onClick={() => handleValidateAnnonce(annonce.id)}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectAnnonce(annonce.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAnnonce(annonce.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Page <span className="text-indigo-600">{currentPage}</span> sur {totalPages}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-sm font-black text-indigo-600">
              {currentPage}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
