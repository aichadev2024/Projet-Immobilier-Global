"use client";
import { API_BASE_URL } from "@/services/api";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit2,
  Grid,
  List,
  Plus,
  X,
  FileVideo,
  FileImage,
  Calendar,
  Folder,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Media {
  id: number;
  url: string;
  typeMedia: "IMAGE" | "VIDEO" | "DOCUMENT";
  createdAt: string | number[];  // Can be ISO string or Java LocalDateTime array [year, month, day, hour, minute, second]
  updatedAt: string | number[];
  bien?: {
    id: number;
    libelle: string;
  };
  taille?: string;
  nomFichier?: string;
  description?: string;
  tags?: string[];
  isDeleted: boolean;
}

interface Bien {
  id: number;
  libelle: string;
  type?: string;
}

export default function AgenceMedias() {
  const router = useRouter();
  const [medias, setMedias] = useState<Media[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [filterBien, setFilterBien] = useState<string>("TOUS");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    bienId: "",
    typeMedia: "IMAGE" as "IMAGE" | "VIDEO" | "DOCUMENT",
    description: "",
    tags: [] as string[]
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
    if (!token) {
      router.push("/login");
      return;
    }

    fetchMedias(token);
    fetchBiens(token);
  }, [router]);

  const fetchMedias = async (token: string) => {
    try {
      console.log('🔍 MÉDIAS - Début fetchMedias avec token:', token ? '✅ Token présent' : '❌ Token manquant');
      
      const response = await fetch(`${API_BASE_URL}/api/medias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 MÉDIAS - Response status:', response.status);
      console.log('🔍 MÉDIAS - Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 MÉDIAS - Données brutes reçues:', data);
        console.log('🔍 MÉDIAS - data.success:', data.success);
        console.log('🔍 MÉDIAS - data.medias count:', data.medias ? data.medias.length : 0);
        
        if (data.medias) {
          console.log('🔍 MÉDIAS - Détail des médias:', data.medias.map((m: any, i: number) => ({
            index: i,
            id: m.id,
            nomFichier: m.nomFichier,
            url: m.url,
            typeMedia: m.typeMedia,
            isDeleted: m.isDeleted,
            bien: m.bien
          })));
        }
        
        const mediasFiltres = data.success && data.medias ? data.medias.filter((m: Media) => !m.isDeleted) : [];
        console.log('🔍 MÉDIAS - Médias filtrés (non supprimés):', mediasFiltres.length);
        console.log('🔍 MÉDIAS - Médias qui seront affichés:', mediasFiltres);
        
        setMedias(mediasFiltres);
      } else {
        console.error('🔍 MÉDIAS - Erreur response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔍 MÉDIAS - Erreur catch:', error);
    } finally {
      console.log('🔍 MÉDIAS - Fin fetchMedias, setLoading(false)');
      setLoading(false);
    }
  };

  const fetchBiens = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/biens`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBiens(data.success && data.biens ? data.biens : []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!uploadForm.bienId) {
      // setError('Veuillez sélectionner un bien');
      return;
    }

    // Vérifier le token avant l'upload
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
    if (!token || token.trim() === '') {
      setError('Vous devez être connecté pour uploader des médias');
      return;
    }

    setUploading(true);
    
    // Debug: Vérifier le token
    console.log('DEBUG - Token pour upload:', token);
    console.log('DEBUG - Token valide?', token && token.length > 0);

    try {
      const formData = new FormData();
      formData.append('bienId', uploadForm.bienId);
      
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/medias/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccessMessage(`${files.length} média(s) uploadé(s) avec succès !`);
          // Faire disparaître le message après 3 secondes
          setTimeout(() => setSuccessMessage(null), 3000);
          // Rafraîchir la liste des biens
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
          if (token) fetchBiens(token);
        } else {
          setError(data.message || 'Erreur lors de l\'upload');
        }
      } else {
        setError('Erreur lors de l\'upload');
      }

      setShowUploadModal(false);
      setUploadForm({
        bienId: "",
        typeMedia: "IMAGE",
        description: "",
        tags: []
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
      const response = await fetch(`${API_BASE_URL}/api/medias/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchMedias(token);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Filtrer par type via les cartes statistiques
  const handleFilterByType = (type: string) => {
    setFilterType(type);
  };

  const filteredMedias = medias.filter(media => {
    // Si pas de recherche, tous les médias correspondent
    const matchesSearch = !searchTerm ||
      media.nomFichier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.bien?.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "TOUS" || media.typeMedia === filterType;
    const matchesBien = filterBien === "TOUS" || media.bien?.id.toString() === filterBien;

    return matchesSearch && matchesType && matchesBien;
  });

  // Logs pour le débogage de l'affichage
  console.log('🎨 AFFICHAGE - État actuel:');
  console.log('🎨 AFFICHAGE - medias bruts:', medias.length, medias);
  console.log('🎨 AFFICHAGE - filteredMedias:', filteredMedias.length, filteredMedias);
  console.log('🎨 AFFICHAGE - searchTerm:', searchTerm);
  console.log('🎨 AFFICHAGE - filterType:', filterType);
  console.log('🎨 AFFICHAGE - filterBien:', filterBien);
  console.log('🎨 AFFICHAGE - viewMode:', viewMode);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <FileImage className="w-5 h-5" />;
      case "VIDEO": return <FileVideo className="w-5 h-5" />;
      default: return <ImageIcon className="w-5 h-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      "IMAGE": { color: "bg-green-100 text-green-800", label: "Image" },
      "VIDEO": { color: "bg-blue-100 text-blue-800", label: "Vidéo" },
      "DOCUMENT": { color: "bg-gray-100 text-gray-800", label: "Document" }
    };
    return badges[type as keyof typeof badges] || badges["IMAGE"];
  };

  const formatDate = (dateValue: string | number[] | undefined | null): string => {
    if (!dateValue) return 'Date inconnue';
    
    try {
      let date: Date;
      
      // Handle Java LocalDateTime array format: [2024, 1, 15, 10, 30, 0]
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateValue === 'string') {
        // Handle ISO string format
        date = new Date(dateValue);
      } else {
        return 'Date invalide';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des médias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestion des médias</h1>
          <p className="mt-3 text-lg text-gray-600">Organisez et gérez les images et vidéos de vos biens</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base font-medium"
        >
          <Plus className="w-5 h-5" />
          Ajouter des médias
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Statistiques rapides - Cartes cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => handleFilterByType("IMAGE")}
          className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
            filterType === "IMAGE" 
              ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl ring-2 ring-emerald-300" 
              : "bg-white shadow-lg hover:shadow-xl"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wider ${filterType === "IMAGE" ? "text-emerald-50" : "text-gray-700"}`}>Images</p>
              <p className={`text-5xl font-extrabold mt-3 ${filterType === "IMAGE" ? "text-white" : "text-gray-900"}`}>
                {medias.filter(m => m.typeMedia === "IMAGE").length}
              </p>
              <p className={`text-sm mt-2 font-medium ${filterType === "IMAGE" ? "text-emerald-100" : "text-gray-600"}`}>Cliquez pour filtrer</p>
            </div>
            <div className={`p-4 rounded-2xl ${filterType === "IMAGE" ? "bg-white/20" : "bg-emerald-100"} transition-colors`}>
              <FileImage className={`w-8 h-8 ${filterType === "IMAGE" ? "text-white" : "text-emerald-600"}`} />
            </div>
          </div>
          {filterType === "IMAGE" && (
            <div className="absolute bottom-2 right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleFilterByType("VIDEO")}
          className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
            filterType === "VIDEO" 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl ring-2 ring-blue-300" 
              : "bg-white shadow-lg hover:shadow-xl"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wider ${filterType === "VIDEO" ? "text-blue-50" : "text-gray-700"}`}>Vidéos</p>
              <p className={`text-5xl font-extrabold mt-3 ${filterType === "VIDEO" ? "text-white" : "text-gray-900"}`}>
                {medias.filter(m => m.typeMedia === "VIDEO").length}
              </p>
              <p className={`text-sm mt-2 font-medium ${filterType === "VIDEO" ? "text-blue-100" : "text-gray-600"}`}>Cliquez pour filtrer</p>
            </div>
            <div className={`p-4 rounded-2xl ${filterType === "VIDEO" ? "bg-white/20" : "bg-blue-100"} transition-colors`}>
              <FileVideo className={`w-8 h-8 ${filterType === "VIDEO" ? "text-white" : "text-blue-600"}`} />
            </div>
          </div>
          {filterType === "VIDEO" && (
            <div className="absolute bottom-2 right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleFilterByType("TOUS")}
          className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
            filterType === "TOUS" 
              ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl ring-2 ring-orange-300" 
              : "bg-white shadow-lg hover:shadow-xl"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wider ${filterType === "TOUS" ? "text-orange-50" : "text-gray-700"}`}>Biens avec médias</p>
              <p className={`text-5xl font-extrabold mt-3 ${filterType === "TOUS" ? "text-white" : "text-gray-900"}`}>
                {medias.filter(m => m.bien !== undefined && m.bien !== null).length}
              </p>
              <p className={`text-sm mt-2 font-medium ${filterType === "TOUS" ? "text-orange-100" : "text-gray-600"}`}>Tout afficher</p>
            </div>
            <div className={`p-4 rounded-2xl ${filterType === "TOUS" ? "bg-white/20" : "bg-orange-100"} transition-colors`}>
              <Folder className={`w-8 h-8 ${filterType === "TOUS" ? "text-white" : "text-orange-600"}`} />
            </div>
          </div>
          {filterType === "TOUS" && (
            <div className="absolute bottom-2 right-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un média..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium text-gray-700 placeholder-gray-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium text-gray-900"
          >
            <option value="TOUS">Tous les types</option>
            <option value="IMAGE">📷 Images</option>
            <option value="VIDEO">🎥 Vidéos</option>
            <option value="DOCUMENT">📄 Documents</option>
          </select>

          <select
            value={filterBien}
            onChange={(e) => setFilterBien(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium text-gray-900"
          >
            <option value="TOUS">Tous les biens</option>
            {biens.map(bien => (
              <option key={bien.id} value={bien.id.toString()}>{bien.libelle}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-base text-gray-600">
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">{filteredMedias.length} médias trouvés</span>
          </div>
        </div>
      </div>

      {/* Liste des médias - Design amélioré */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        {/* Barre de titre avec filtre actif */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              filterType === "IMAGE" ? "bg-emerald-100 text-emerald-600" :
              filterType === "VIDEO" ? "bg-blue-100 text-blue-600" :
              "bg-orange-100 text-orange-600"
            }`}>
              {filterType === "IMAGE" ? <FileImage className="w-5 h-5" /> :
               filterType === "VIDEO" ? <FileVideo className="w-5 h-5" /> :
               <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {filterType === "TOUS" ? "Tous les médias" :
                 filterType === "IMAGE" ? "Images" :
                 filterType === "VIDEO" ? "Vidéos" : "Documents"}
              </h2>
              <p className="text-sm text-gray-500">{filteredMedias.length} élément{filteredMedias.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          {filterType !== "TOUS" && (
            <button
              onClick={() => setFilterType("TOUS")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>

        {(() => {
          console.log('🎨 AFFICHAGE - Rendu de la liste des médias, filteredMedias.length:', filteredMedias.length);
          return null;
        })()}
        {filteredMedias.length === 0 ? (
          <div className="text-center py-20 px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun média trouvé</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {medias.length > 0 
                ? `Vous avez ${medias.length} média(s) au total, mais aucun ne correspond au filtre actuel.` 
                : "Commencez par ajouter des médias à votre bibliothèque."}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Ajouter des médias
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMedias.map((media, index) => (
                    <div 
                      key={media.id} 
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Image container avec aspect ratio */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {media.typeMedia === "IMAGE" ? (
                          <img
                            src={media.url}
                            alt={media.nomFichier}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : media.typeMedia === "VIDEO" ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                            <FileVideo className="w-16 h-16 text-white/80" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
                            <ImageIcon className="w-16 h-16 text-white/80" />
                          </div>
                        )}

                        {/* Badge type */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                            media.typeMedia === "IMAGE" ? "bg-emerald-500/90 text-white" :
                            media.typeMedia === "VIDEO" ? "bg-blue-500/90 text-white" :
                            "bg-gray-500/90 text-white"
                          }`}>
                            {getTypeIcon(media.typeMedia)}
                            {getTypeBadge(media.typeMedia).label}
                          </span>
                        </div>

                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                          <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <button
                              onClick={() => {
                                setSelectedMedia(media);
                                setShowDetails(true);
                              }}
                              className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              Voir
                            </button>
                            <button
                              onClick={() => window.open(media.url, '_blank')}
                              className="p-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(media.id)}
                              className="p-2.5 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-base truncate mb-2 group-hover:text-indigo-600 transition-colors">
                          {media.nomFichier || "Sans nom"}
                        </h3>
                        {media.bien && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Folder className="w-4 h-4 text-indigo-500" />
                            <span className="truncate">{media.bien.libelle}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm font-medium text-gray-600 mt-3 pt-3 border-t border-gray-200">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {formatDate(media.createdAt)}
                          </span>
                          <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{media.taille}</span>
                        </div>
                        {media.tags && media.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {media.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                            {media.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                +{media.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Média</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Bien associé</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Taille</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredMedias.map((media) => (
                        <tr key={media.id} className="hover:bg-indigo-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                                {media.typeMedia === "IMAGE" ? (
                                  <img src={media.url} alt={media.nomFichier} className="w-full h-full object-cover" loading="lazy" />
                                ) : media.typeMedia === "VIDEO" ? (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                    <FileVideo className="w-6 h-6 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{media.nomFichier || "Sans nom"}</p>
                                {media.description && (
                                  <p className="text-sm text-gray-600 truncate max-w-xs font-medium">{media.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              media.typeMedia === "IMAGE" ? "bg-emerald-100 text-emerald-700" :
                              media.typeMedia === "VIDEO" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {getTypeIcon(media.typeMedia)}
                              {getTypeBadge(media.typeMedia).label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
                              {media.bien?.libelle ? (
                                <><Folder className="w-4 h-4 text-indigo-500" /> {media.bien.libelle}</>
                              ) : (
                                <span className="text-gray-500 italic">Non associé</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">{media.taille}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {formatDate(media.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setSelectedMedia(media); setShowDetails(true); }}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(media.url, '_blank')}
                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(media.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Upload - Design amélioré */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ajouter des médias</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Bien associé</label>
                  <select
                    value={uploadForm.bienId}
                    onChange={(e) => setUploadForm({ ...uploadForm, bienId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium"
                  >
                    <option value="">Sélectionner un bien</option>
                    {biens.map(bien => (
                      <option key={bien.id} value={bien.id.toString()}>{bien.libelle}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Type de média</label>
                  <select
                    value={uploadForm.typeMedia}
                    onChange={(e) => setUploadForm({ ...uploadForm, typeMedia: e.target.value as "IMAGE" | "VIDEO" | "DOCUMENT" })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 font-medium"
                  >
                    <option value="IMAGE">📷 Image</option>
                    <option value="VIDEO">🎥 Vidéo</option>
                    <option value="DOCUMENT">📄 Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Fichiers</label>
                <div className="border-3 border-dashed border-indigo-300 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group bg-white">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-indigo-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-base text-gray-700 mb-4 font-medium">
                    ou cliquez pour sélectionner depuis votre appareil
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all cursor-pointer font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Choisir les fichiers
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  placeholder="Ajoutez une description pour ces médias..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-900 font-medium"
                />
              </div>

              {uploading && (
                <div className="text-center py-6 bg-indigo-50 rounded-xl">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-3"></div>
                  <p className="text-indigo-900 font-medium">Téléchargement en cours...</p>
                  <p className="text-indigo-600 text-sm mt-1">Veuillez patienter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails - Design amélioré */}
      {showDetails && selectedMedia && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  selectedMedia.typeMedia === "IMAGE" ? "bg-emerald-100" :
                  selectedMedia.typeMedia === "VIDEO" ? "bg-blue-100" :
                  "bg-gray-100"
                }`}>
                  {selectedMedia.typeMedia === "IMAGE" ? <FileImage className="w-7 h-7 text-emerald-600" /> :
                   selectedMedia.typeMedia === "VIDEO" ? <FileVideo className="w-7 h-7 text-blue-600" /> :
                   <ImageIcon className="w-7 h-7 text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 truncate max-w-md">
                    {selectedMedia.nomFichier || "Détails du média"}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedMedia.typeMedia === "IMAGE" ? "bg-emerald-100 text-emerald-700" :
                      selectedMedia.typeMedia === "VIDEO" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {getTypeBadge(selectedMedia.typeMedia).label}
                    </span>
                    {selectedMedia.taille && <span>• {selectedMedia.taille}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Preview Section - Takes 3 columns */}
                <div className="lg:col-span-3">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-inner">
                    {selectedMedia.typeMedia === "IMAGE" ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.nomFichier}
                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                      />
                    ) : selectedMedia.typeMedia === "VIDEO" ? (
                      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                        <div className="text-center">
                          <FileVideo className="w-24 h-24 text-white/80 mx-auto mb-4" />
                          <p className="text-white/80 text-lg">Lecture vidéo non disponible</p>
                          <button
                            onClick={() => window.open(selectedMedia.url, '_blank')}
                            className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                          >
                            Ouvrir la vidéo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
                        <div className="text-center text-white">
                          <ImageIcon className="w-24 h-24 text-white/80 mx-auto mb-4" />
                          <p className="text-white/80 text-lg">Document</p>
                          <button
                            onClick={() => window.open(selectedMedia.url, '_blank')}
                            className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                          >
                            Ouvrir le document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => window.open(selectedMedia.url, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                      <Edit2 className="w-5 h-5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => { handleDeleteMedia(selectedMedia.id); setShowDetails(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Info Section - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Info Card */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Informations
                    </h3>
                    <div className="space-y-4">
                      {selectedMedia.nomFichier && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nom du fichier</p>
                          <p className="text-sm font-medium text-gray-900 break-all">{selectedMedia.nomFichier}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            selectedMedia.typeMedia === "IMAGE" ? "bg-emerald-100 text-emerald-700" :
                            selectedMedia.typeMedia === "VIDEO" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {getTypeIcon(selectedMedia.typeMedia)}
                            {getTypeBadge(selectedMedia.typeMedia).label}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Taille</p>
                          <p className="text-sm font-medium text-gray-900">{selectedMedia.taille || "-"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date d'ajout</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(selectedMedia.createdAt)}
                        </p>
                      </div>
                      {selectedMedia.bien && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bien associé</p>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Folder className="w-4 h-4 text-indigo-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">{selectedMedia.bien.libelle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedMedia.description && (
                    <div className="bg-indigo-50 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedMedia.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
