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
      
      const response = await fetch("http://localhost:8080/api/annonces", {
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
      // const response = await fetch(`http://localhost:8080/api/annonces/${annonceId}/valider`, {
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
      // const response = await fetch(`http://localhost:8080/api/annonces/${annonceId}/refuser`, {
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
      
      const response = await fetch(`http://localhost:8080/api/annonces/${annonceId}`, {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Annonces
          </h1>
          <p className="mt-2 text-gray-600">
            Validez et gérez toutes les annonces de la plateforme
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Megaphone className="w-4 h-4" />
          Nouvelle annonce
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-green-600">{stats.validees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejetees}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validées</option>
              <option value="REJETEE">Rejetées</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bien concerné
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{annonce.titre}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {annonce.description}
                        </div>
                        {annonce.prix && (
                          <div className="text-sm font-medium text-gray-900 mt-2">
                            {formatPrice(annonce.prix)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span>{annonce.bienTitre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(annonce.type)}`}>
                        {annonce.type}
                      </span>
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
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
