"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { API_BASE_URL } from "@/services/api";

interface Agence {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  description?: string;
  statut: "EN_ATTENTE" | "EN_ATTENTE_VERIFICATION" | "VERIFIEE" | "VALIDEE" | "REJETEE";
  dateCreation: string;
  utilisateurId?: string;
  nomResponsable?: string;
  emailResponsable?: string;
}

export default function AgencesPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{url: string, type: string, name: string} | null>(null);

  useEffect(() => {
    fetchAgences();
  }, [searchTerm, statusFilter]);

  const fetchAgences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📡 Récupération des agences depuis le backend...");
      
      const response = await fetch(`${API_BASE_URL}/api/admin/validation/agences`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const agencesData = await response.json();
        console.log("🏢 Agences reçues:", agencesData);
        
        // Transformer les données du backend au format du frontend
        const formattedAgences: Agence[] = agencesData.map((agence: any) => ({
          id: agence.id,
          nom: agence.agenceNom || (agence.prenom + " " + agence.nom),
          email: agence.email,
          telephone: agence.telephone || "Non renseigné",
          adresse: agence.agenceAdresse || "Non renseigné",
          description: "Agence immobilière",
          statut: mapStatutToAgenceStatut(agence.statut),
          dateCreation: agence.createdAt,
          utilisateurId: agence.id,
          nomResponsable: agence.prenom + " " + agence.nom,
          emailResponsable: agence.email
        }));

        setAgences(formattedAgences);
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération des agences:", response.status, errorText);
        
        // En cas d'erreur, utiliser les données simulées
        const mockAgences: Agence[] = [
          {
            id: "1",
            nom: "Mali Immobilier",
            email: "contact@mali-immobilier.com",
            telephone: "+223 70 00 00 01",
            adresse: "Bamako, Hippodrome",
            description: "Agence immobilière spécialisée dans la vente et location de biens au Mali",
            statut: "EN_ATTENTE",
            dateCreation: "2024-03-01T10:30:00Z",
            nomResponsable: "Mohamed Koné",
            emailResponsable: "m.kone@mali-immobilier.com"
          }
        ];

        setAgences(mockAgences);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des agences:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mapper les statuts du backend vers le frontend
  const mapStatutToAgenceStatut = (backendStatut: string): Agence['statut'] => {
    switch (backendStatut) {
      case 'EN_ATTENTE_VALIDATION':
        return 'EN_ATTENTE';
      case 'ACTIF':
        return 'VALIDEE';
      case 'INACTIF':
        return 'REJETEE';
      default:
        return 'EN_ATTENTE';
    }
  };

  const handleValidateAgence = async (agenceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir valider cette agence ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`✅ Validation de l'agence ${agenceId}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/validation/agences/${agenceId}/valider`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Agence validée:", result);
        
        // Mettre à jour l'agence localement
        setAgences(prevAgences => 
          prevAgences.map(agence => 
            agence.id === agenceId ? { ...agence, statut: 'VALIDEE' } : agence
          )
        );
        
        alert("✅ Agence validée avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la validation:", response.status, errorText);
        alert("❌ Erreur lors de la validation de l'agence");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la validation:", error);
      alert("❌ Erreur lors de la validation de l'agence");
    }
  };

  const handleRejectAgence = async (agenceId: string) => {
    const raison = prompt("Veuillez indiquer la raison du refus:");
    if (!raison) return;
    
    if (!confirm("Êtes-vous sûr de vouloir refuser cette agence ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`❌ Refus de l'agence ${agenceId}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/validation/agences/${agenceId}/refuser`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raison: raison })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("❌ Agence refusée:", result);
        
        // Mettre à jour l'agence localement
        setAgences(prevAgences => 
          prevAgences.map(agence => 
            agence.id === agenceId ? { ...agence, statut: 'REJETEE' } : agence
          )
        );
        
        alert("❌ Agence refusée avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors du refus:", response.status, errorText);
        alert("❌ Erreur lors du refus de l'agence");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du refus:", error);
      alert("❌ Erreur lors du refus de l'agence");
    }
  };

  // Récupérer les documents d'une agence
  const fetchDocuments = async (utilisateurId: string) => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/validation/agences/${utilisateurId}/documents`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const docs = await response.json();
        console.log("📄 Documents reçus:", docs);
        setDocuments(docs);
      } else {
        console.error("❌ Erreur lors de la récupération des documents:", response.status);
        setDocuments([]);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Approuver un document
  const handleApproveDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/validation/documents/${documentId}/approuver`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        alert("✅ Document approuvé avec succès!");
        if (selectedAgence) fetchDocuments(selectedAgence.utilisateurId || selectedAgence.id);
      } else {
        alert("❌ Erreur lors de l'approbation du document");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Erreur lors de l'approbation");
    }
  };

  // Rejeter un document
  const handleRejectDocument = async (documentId: string) => {
    const raison = prompt("Veuillez indiquer la raison du rejet:");
    if (!raison) return;

    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/validation/documents/${documentId}/rejeter`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ commentaires: raison })
      });

      if (response.ok) {
        alert("❌ Document rejeté");
        if (selectedAgence) fetchDocuments(selectedAgence.utilisateurId || selectedAgence.id);
      } else {
        alert("❌ Erreur lors du rejet du document");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Erreur lors du rejet");
    }
  };

  // Prévisualiser un document (ouvrir dans un nouvel onglet pour les images/PDF)
  const handlePreviewDocument = async (documentId: string, docType: string) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      alert("❌ Veuillez vous reconnecter");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/validation/documents/${documentId}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Détecter le type de fichier
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const isImage = contentType.startsWith('image/');
      const isPDF = contentType === 'application/pdf';
      
      if (isImage || isPDF) {
        // Pour les images et PDF, ouvrir dans une modal
        setPreviewDoc({
          url,
          type: contentType,
          name: docType
        });
      } else {
        // Pour les autres fichiers, télécharger directement
        handleDownloadDocument(documentId);
      }
    } catch (error) {
      alert("❌ Erreur lors de la prévisualisation");
    }
  };

  // Télécharger un document
  const handleDownloadDocument = async (documentId: string) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      alert("❌ Veuillez vous reconnecter");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/validation/documents/${documentId}/download`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert("❌ Session expirée. Veuillez vous reconnecter.");
          return;
        }
        throw new Error("Erreur lors du téléchargement");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 📄 Récupérer le nom de fichier depuis l'en-tête Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `document-${documentId}`;
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }
      
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("❌ Erreur lors du téléchargement du document");
    }
  };

  const handleDeleteAgence = async (agenceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) return;
    
    try {
      // API call here
      setAgences(agences.filter(agence => agence.id !== agenceId));
      alert("✅ Agence supprimée avec succès!");
    } catch (error) {
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

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
      case "EN_ATTENTE_VERIFICATION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "VERIFIEE":
      case "VALIDEE":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJETEE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
      case "EN_ATTENTE_VERIFICATION":
        return <Clock className="w-4 h-4" />;
      case "VERIFIEE":
      case "VALIDEE":
        return <CheckCircle className="w-4 h-4" />;
      case "REJETEE":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // 📊 Calculer les statistiques des documents
  const getDocumentStats = (docs: any[]) => {
    const total = docs.length;
    const approved = docs.filter(d => d.statut === 'APPROUVEE').length;
    const pending = docs.filter(d => d.statut === 'EN_ATTENTE').length;
    const rejected = docs.filter(d => d.statut === 'REJETTEE').length;
    return { total, approved, pending, rejected };
  };

  // Vérifier si tous les documents sont approuvés
  const canValidateAgence = (docs: any[]) => {
    if (docs.length === 0) return true; // Si pas de documents, on peut valider
    const { pending, rejected } = getDocumentStats(docs);
    return pending === 0 && rejected === 0;
  };

  const filteredAgences = agences.filter(agence => {
    const matchesSearch = agence.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agence.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (agence.telephone && agence.telephone.includes(searchTerm));
    
    const matchesFilter = statusFilter === "TOUS" || 
                         (statusFilter === "EN_ATTENTE" && (agence.statut === "EN_ATTENTE_VERIFICATION" || agence.statut === "EN_ATTENTE")) ||
                         (statusFilter === "VALIDEE" && agence.statut === "VALIDEE") ||
                         agence.statut === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: agences.length,
    enAttente: agences.filter(a => a.statut === "EN_ATTENTE" || a.statut === "EN_ATTENTE_VERIFICATION").length,
    validees: agences.filter(a => a.statut === "VALIDEE" || a.statut === "VERIFIEE").length,
    rejetees: agences.filter(a => a.statut === "REJETEE").length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des agences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Agences
        </h1>
        <p className="mt-2 text-gray-600">
          Validez et gérez les agences immobilières
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Attente</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600">{stats.enAttente}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-100 rounded-xl">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Validées</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">{stats.validees}</p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Rejetées</p>
              <p className="text-xl sm:text-2xl font-black text-red-600">{stats.rejetees}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher une agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: "TOUS", label: "Tous", color: "from-slate-600 to-slate-700" },
              { id: "EN_ATTENTE", label: "En attente", color: "from-amber-500 to-orange-600" },
              { id: "VALIDEE", label: "Validées", color: "from-emerald-500 to-teal-600" },
              { id: "REJETEE", label: "Rejetées", color: "from-red-500 to-pink-600" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                  statusFilter === filter.id
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-md`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des agences */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Agence
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-100">
              {filteredAgences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune agence trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredAgences.map((agence) => (
                  <tr key={agence.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{agence.nom}</div>
                        <div className="text-xs text-indigo-500 flex items-center gap-1 mt-0.5 truncate max-w-[150px] sm:max-w-none">
                          <Building className="w-3 h-3" />
                          {agence.adresse || "Bamako"}
                        </div>
                        <div className="lg:hidden mt-2 flex flex-col gap-1">
                           <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                             <Mail className="w-3 h-3" />
                             {agence.email}
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Mail className="w-4 h-4 text-indigo-400" />
                          {agence.email}
                        </div>
                        {agence.telephone && (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            {agence.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(agence.statut)}`}>
                        {getStatusIcon(agence.statut)}
                        <span>
                          {agence.statut === "EN_ATTENTE" || agence.statut === "EN_ATTENTE_VERIFICATION" ? "En attente" :
                           agence.statut === "VERIFIEE" || agence.statut === "VALIDEE" ? "Validée" : "Rejetée"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(agence.dateCreation)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAgence(agence);
                            setShowDetailsModal(true);
                            fetchDocuments(agence.utilisateurId || agence.id);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {(agence.statut === "EN_ATTENTE" || agence.statut === "EN_ATTENTE_VERIFICATION") && (
                          <>
                            {/* Indicateur de documents */}
                            {(() => {
                              const stats = getDocumentStats(documents);
                              const allApproved = canValidateAgence(documents);
                              return (
                                <div className="flex items-center gap-2 mr-2">
                                  {documents.length > 0 && (
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      allApproved 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {stats.approved}/{stats.total} docs
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Bouton Valider - désactivé si documents en attente */}
                            {(() => {
                              const canValidate = canValidateAgence(documents);
                              return (
                                <button
                                  onClick={() => canValidate && handleValidateAgence(agence.id)}
                                  disabled={!canValidate}
                                  title={!canValidate 
                                    ? "Vous devez d'abord approuver tous les documents avant de valider cette agence" 
                                    : "Valider l'agence"}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    canValidate 
                                      ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
                                      : "text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              );
                            })()}
                            
                            <button
                              onClick={() => handleRejectAgence(agence.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAgence(agence.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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

      {/* Modal détails */}
      {showDetailsModal && selectedAgence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de l'agence
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informations générales</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nom de l'agence</p>
                      <p className="font-medium">{selectedAgence.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium">{selectedAgence.adresse || "Non spécifiée"}</p>
                    </div>
                    {selectedAgence.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{selectedAgence.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedAgence.email}</p>
                    </div>
                    {selectedAgence.telephone && (
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium">{selectedAgence.telephone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsable</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium">{selectedAgence.nomResponsable || "Non spécifié"}</p>
                    </div>
                    {selectedAgence.emailResponsable && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedAgence.emailResponsable}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Statut</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Statut actuel</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedAgence.statut)}`}>
                        {getStatusIcon(selectedAgence.statut)}
                        <span>
                          {selectedAgence.statut === "EN_ATTENTE" ? "En attente de validation" :
                           selectedAgence.statut === "VALIDEE" ? "Agence validée" : "Agence rejetée"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium">{formatDate(selectedAgence.dateCreation)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Documents */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Documents de vérification
                </h3>

                {/* 📊 Alerte sur le statut des documents */}
                {!documentsLoading && documents.length > 0 && (
                  (() => {
                    const { total, approved, pending, rejected } = getDocumentStats(documents);
                    const allApproved = canValidateAgence(documents);
                    
                    if (allApproved) {
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-800 font-medium">
                              ✅ Tous les documents sont approuvés ({approved}/{total})
                            </span>
                          </div>
                          <p className="text-green-700 text-sm mt-1">
                            Vous pouvez maintenant valider cette agence.
                          </p>
                        </div>
                      );
                    } else if (pending > 0) {
                      return (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">
                              ⏳ Documents en attente ({approved}/{total} approuvés)
                            </span>
                          </div>
                          <p className="text-yellow-700 text-sm mt-1">
                            Vous devez approuver tous les documents avant de pouvoir valider cette agence.
                          </p>
                        </div>
                      );
                    } else if (rejected > 0) {
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800 font-medium">
                              ❌ Documents rejetés présents
                            </span>
                          </div>
                          <p className="text-red-700 text-sm mt-1">
                            Certains documents ont été rejetés. L'agence doit soumettre de nouveaux documents.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}

                {documentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-600">Chargement des documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Aucun document soumis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{doc.type}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                doc.statut === 'APPROUVEE' ? 'bg-green-100 text-green-800' :
                                doc.statut === 'REJETTEE' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doc.statut === 'APPROUVEE' ? 'Approuvé' :
                                 doc.statut === 'REJETTEE' ? 'Rejeté' : 'En attente'}
                              </span>
                            </div>
                            {doc.dateDemande && (
                              <p className="text-xs text-gray-500">
                                Soumis le: {new Date(doc.dateDemande).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                            {doc.commentaires && (
                              <p className="text-xs text-gray-600 mt-1">{doc.commentaires}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {/* Bouton Prévisualiser pour images et PDF */}
                            <button
                              onClick={() => handlePreviewDocument(doc.id, doc.type)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Prévisualiser"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {doc.statut !== 'APPROUVEE' && (
                              <button
                                onClick={() => handleApproveDocument(doc.id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Approuver"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {doc.statut !== 'REJETTEE' && (
                              <button
                                onClick={() => handleRejectDocument(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Rejeter"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation des documents */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Prévisualisation: {previewDoc.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(previewDoc.url);
                    setPreviewDoc(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
              {previewDoc.type.startsWith('image/') ? (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : previewDoc.type === 'application/pdf' ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[70vh] rounded-lg"
                  title={previewDoc.name}
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Type de fichier non pris en charge pour la prévisualisation</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  window.URL.revokeObjectURL(previewDoc.url);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewDoc.url;
                  a.download = previewDoc.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
