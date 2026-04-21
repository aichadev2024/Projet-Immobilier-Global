"use client";
import { API_BASE_URL } from "@/services/api";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Plus,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Users,
  Image as ImageIcon,
  Camera,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  Lock,
  Images,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Star
} from "lucide-react";

interface BienImmobilier {
  id: number;
  libelle: string;
  typeBien: { id: number, libelle: string, description: string };
  statutBien: string;
  prixCalculer: number;
  adresse: string;
  ville?: string;
  superficie?: number;
  transactionType?: 'A_VENDRE' | 'A_LOUER';
  caracteristiques?: {
    superficie: number;
    nbChambres: number;
    nbSallesDeBain: number;
    nbParking?: number;
    meuble?: boolean;
    balcon?: boolean;
    jardin?: boolean;
    piscine?: boolean;
    climatisation?: boolean;
    cuisineEquipee?: boolean;
    wifi?: boolean;
    securite?: boolean;
  };
  description: string;
  images: string[];
  datePublication: string;
  dateCreation: string;
  visites?: number;
  contacts?: number;
  utilisateur?: {
    id: string;
    nom: string;
    email: string;
    telephone: string;
    agence?: {
      nom: string;
      adresse: string;
      telephone: string;
      email: string;
      siteWeb?: string;
      whatsapp?: string;
    };
  };
  createdById?: string;
}

interface TypeBien {
  id: number;
  libelle: string;
  description: string;
  modeTarification: "FIXE" | "POURCENTAGE" | "GRATUIT";
  tarifBase: number;
}

interface BienRequest {
  libelle: string;
  description: string;
  idTypeBien: string;
  adresse: string;
  latitude: string;
  longitude: string;
  superficie: number;
  prix: number;
  transactionType: "A_VENDRE" | "A_LOUER";
  visitePayante?: boolean;
  tarifVisite?: number;
}

export default function BiensImmobiliers() {
  const router = useRouter();
  const [biens, setBiens] = useState<BienImmobilier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("TOUS");
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [selectedBien, setSelectedBien] = useState<BienImmobilier | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [typesBiens, setTypesBiens] = useState<TypeBien[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string, role: string } | null>(null);

  const [newBien, setNewBien] = useState<BienRequest>({
    libelle: "",
    description: "",
    idTypeBien: "",
    adresse: "",
    latitude: "",
    longitude: "",
    superficie: 0,
    prix: 0,
    transactionType: "A_VENDRE",
    visitePayante: false,
    tarifVisite: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    
    if (!token) {
      // Pour les visiteurs, charger les biens sans authentification
      fetchBiensPublic();
      return;
    }

    fetchUserProfile(token);
    fetchBiens(token);
    fetchTypesBiens(token);
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          id: data.id,
          role: data.role?.nom || data.role || ""
        });
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const fetchBiensPublic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/biens`);
      if (response.ok) {
        const data = await response.json();
        setBiens(data.success ? data.biens : []);
      } else {
        setBiens([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setBiens([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBienDetails = async (bienId: number) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_BASE_URL}/api/biens/${bienId}/details`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedBien(data.bien);
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleViewDetails = (bien: BienImmobilier) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    fetchBienDetails(bien.id);
  };

  const handleViewMediaGallery = (bien: BienImmobilier) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedBien(bien);
    setCurrentImageIndex(0);
    setShowMediaGallery(true);
  };

  const nextImage = () => {
    if (selectedBien?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedBien.images.length);
    }
  };

  const prevImage = () => {
    if (selectedBien?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedBien.images.length) % selectedBien.images.length);
    }
  };

  const fetchTypesBiens = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/type-biens`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTypesBiens(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAddBien = async () => {
    // Validation avant envoi
    if (!newBien.idTypeBien || newBien.idTypeBien === "") {
      setError("Veuillez sélectionner un type de bien");
      return;
    }

    if (!newBien.libelle || newBien.libelle.trim().length < 2) {
      setError("Le libellé doit contenir au moins 2 caractères");
      return;
    }

    if (!newBien.description || newBien.description.trim().length < 10) {
      setError("La description doit contenir au moins 10 caractères");
      return;
    }

    if (!newBien.adresse || newBien.adresse.trim().length < 5) {
      setError("L'adresse doit contenir au moins 5 caractères");
      return;
    }



    if (!newBien.superficie || newBien.superficie <= 0) {
      setError("La superficie doit être supérieure à 0");
      return;
    }

    if (!newBien.prix || newBien.prix <= 0) {
      setError("Le prix doit être supérieur à 0");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
      
      // Convertir idTypeBien en nombre pour le backend
      const idTypeBienNum = parseInt(newBien.idTypeBien);
      console.log("DEBUG Frontend - newBien.idTypeBien:", newBien.idTypeBien);
      console.log("DEBUG Frontend - idTypeBienNum:", idTypeBienNum);
      
      if (!idTypeBienNum || idTypeBienNum <= 0) {
        setError("Veuillez sélectionner un type de bien valide");
        return;
      }
      
      const bienToSend = {
        ...newBien,
        idTypeBien: idTypeBienNum,
        prix: newBien.prix,
        // Convertir les coordonnées en nombres pour l'envoi au backend
        latitude: newBien.latitude.trim() === "" ? null : (parseFloat(newBien.latitude) || 0),
        longitude: newBien.longitude.trim() === "" ? null : (parseFloat(newBien.longitude) || 0),
        // Visite payante
        visitePayante: newBien.visitePayante || false,
        tarifVisite: newBien.visitePayante ? (newBien.tarifVisite || 0) : 0
      };
      
      console.log("DEBUG Frontend - bienToSend:", bienToSend);
      
      const response = await fetch(`${API_BASE_URL}/api/biens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bienToSend)
      });

      if (response.ok) {
        setShowAddModal(false);
        setSuccessMessage("Bien créé avec succès !");
        setError(null);
        setNewBien({
          libelle: "",
          description: "",
          idTypeBien: "",
          adresse: "",
          latitude: "",
          longitude: "",
          superficie: 0,
          prix: 0,
          transactionType: "A_VENDRE",
          visitePayante: false,
          tarifVisite: 0
        });
        if (token) {
          setRefreshing(true);
          fetchBiens(token);
        }
        
        // Faire disparaître le message de succès après 3 secondes
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        console.error('Erreur:', errorData);
        setError('Erreur lors de l\'ajout du bien: ' + (errorData.message || 'Erreur inconnue'));
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
      setSuccessMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBiens = async (token: string) => {
    try {
      // Utiliser l'endpoint /api/biens/agence pour voir tous les biens de l'agence (incluant LOUE et VENDU)
      const response = await fetch(`${API_BASE_URL}/api/biens/agence`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBiens(data.success ? data.biens : []);
        if (data.success && data.biens.length > 0) {
          console.log(`✅ ${data.biens.length} bien(s) chargé(s) avec succès (tous les statuts)`);
        }
      } else {
        const errorData = await response.json();
        setError('Erreur lors du chargement des biens: ' + (errorData.message || 'Erreur inconnue'));
        setBiens([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
      setBiens([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredBiens = biens.filter(bien => {
    const matchesSearch = bien.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "TOUS" || bien.typeBien?.libelle?.toUpperCase() === filterType;
    const matchesStatut = filterStatut === "TOUS" || bien.statutBien === filterStatut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      "MAISON": "Maison",
      "APPARTEMENT": "Appartement",
      "TERRAIN": "Terrain",
      "VILLA": "Villa",
      "STUDIO": "Studio"
    };
    return types[type] || type;
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { color: string; icon: React.ReactNode; label: string } } = {
      "BROUILLON": { color: "bg-gray-100 text-gray-800", icon: <Clock className="w-4 h-4" />, label: "Brouillon" },
      "EN_ATTENTE": { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" />, label: "En attente" },
      "VALIDE": { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="w-4 h-4" />, label: "Validé" },
      "DISPONIBLE": { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "Publié" },
      "PUBLIE": { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "Publié" },
      "LOUE": { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-4 h-4" />, label: "Loué" },
      "VENDU": { color: "bg-purple-100 text-purple-800", icon: <CheckCircle className="w-4 h-4" />, label: "Vendu" },
      "INDISPONIBLE": { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" />, label: "Indisponible" }
    };
    return badges[statut] || badges["EN_ATTENTE"];
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "Prix sur demande";
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M FCFA`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K FCFA`;
    }
    return `${price.toLocaleString()} FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Biens immobiliers</h1>
              <p className="mt-3 text-lg text-indigo-100 max-w-2xl">Découvrez et gérez votre catalogue de biens immobiliers avec style</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Ajouter un bien
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-r-lg flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-lg flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Filtres Professionnels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Filter className="w-5 h-5" />
            <span className="font-semibold">Filtrer les biens</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un bien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-base"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-base"
            >
              <option value="TOUS">Tous les types</option>
              <option value="MAISON">Maisons</option>
              <option value="APPARTEMENT">Appartements</option>
              <option value="VILLA">Villas</option>
              <option value="TERRAIN">Terrains</option>
              <option value="STUDIO">Studios</option>
            </select>

            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-base"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validé</option>
              <option value="DISPONIBLE">Publié</option>
              <option value="LOUE">Loué</option>
              <option value="VENDU">Vendu</option>
            </select>

            <div className="flex items-center justify-center bg-indigo-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                <Home className="w-5 h-5" />
                <span>{refreshing ? 'Chargement...' : `${filteredBiens.length} biens`}</span>
                {refreshing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Liste des biens - Design Premium */}
        <div>
          {filteredBiens.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl font-medium text-gray-600">Aucun bien trouvé</p>
              <p className="text-gray-400 mt-2">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBiens.map((bien) => (
                <div key={bien.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Image avec overlay */}
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    {bien.images && bien.images.length > 0 ? (
                      <img 
                        src={bien.images[0]} 
                        alt={bien.libelle} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Badge statut */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getStatutBadge(bien.statutBien).color}`}>
                        {getStatutBadge(bien.statutBien).icon}
                        {getStatutBadge(bien.statutBien).label}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        Gratuit
                      </span>
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-lg border border-gray-100">
                        {getTypeLabel(bien.typeBien?.libelle)}
                      </span>
                    </div>
                    
                    {/* Bouton voir médias */}
                    {bien.images && bien.images.length > 0 && (
                      <button
                        onClick={() => handleViewMediaGallery(bien)}
                        className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <Images className="w-4 h-4" />
                        {bien.images.length} photo{bien.images.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{bien.libelle}</h3>
                      <p className="text-lg font-bold text-indigo-600 whitespace-nowrap">{formatPrice(bien.prixCalculer)}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{bien.ville || bien.adresse}</span>
                    </div>

                    {/* Caractéristiques */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Square className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium">{bien.caracteristiques?.superficie || 0}m²</span>
                      </div>
                      {bien.caracteristiques?.nbChambres ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Bed className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium">{bien.caracteristiques.nbChambres}</span>
                        </div>
                      ) : null}
                      {bien.caracteristiques?.nbSallesDeBain ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Bath className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium">{bien.caracteristiques.nbSallesDeBain}</span>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{bien.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{bien.visites || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(bien.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(bien)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                        {isAuthenticated && currentUser && (
                          <div className="flex items-center gap-2">
                            {/* Un AGENT ne peut modifier que ses propres biens. Une AGENCE peut tout modifier. */}
                            {(currentUser.role === 'AGENCE' || (currentUser.role === 'AGENT' && bien.createdById === currentUser.id)) && (
                              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifier">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Seule une AGENCE peut supprimer des biens */}
                            {currentUser.role === 'AGENCE' && (
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal détails professionnel */}
      {showDetails && selectedBien && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header avec image principale */}
            <div className="relative h-72 bg-gray-200">
              {selectedBien.images && selectedBien.images.length > 0 ? (
                <img 
                  src={selectedBien.images[0]} 
                  alt={selectedBien.libelle} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatutBadge(selectedBien.statutBien).color}`}>
                  {getStatutBadge(selectedBien.statutBien).icon}
                  {getStatutBadge(selectedBien.statutBien).label}
                </span>
                <h2 className="text-3xl font-bold text-white mt-2">{selectedBien.libelle}</h2>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{selectedBien.adresse}, {selectedBien.ville}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Prix et type */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Prix {selectedBien.transactionType === 'A_VENDRE' ? 'de vente' : 'de location'}</p>
                      <p className="text-4xl font-bold text-indigo-600">{formatPrice(selectedBien.prixCalculer)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Type de bien</p>
                      <p className="text-xl font-semibold text-gray-900">{getTypeLabel(selectedBien.typeBien?.libelle)}</p>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Square className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{selectedBien.caracteristiques?.superficie || selectedBien.superficie || 0}</p>
                        <p className="text-sm text-gray-500">m²</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Bed className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{selectedBien.caracteristiques?.nbChambres || 0}</p>
                        <p className="text-sm text-gray-500">Chambres</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Bath className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{selectedBien.caracteristiques?.nbSallesDeBain || 0}</p>
                        <p className="text-sm text-gray-500">Salles de bain</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Home className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{selectedBien.caracteristiques?.nbParking || 0}</p>
                        <p className="text-sm text-gray-500">Parking</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedBien.description}</p>
                  </div>

                  {/* Galerie miniatures */}
                  {selectedBien.images && selectedBien.images.length > 1 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Galerie photos</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedBien.images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                            <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      {selectedBien.images.length > 4 && (
                        <button 
                          onClick={() => setShowMediaGallery(true)}
                          className="mt-3 text-indigo-600 font-medium hover:underline"
                        >
                          Voir les {selectedBien.images.length - 4} photos supplémentaires
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Colonne latérale - Contact agence */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contactez l'agence</h3>
                    {selectedBien.utilisateur ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedBien.utilisateur.nom}</p>
                            <p className="text-sm text-gray-500">{selectedBien.utilisateur.agence?.nom || 'Agence immobilière'}</p>
                          </div>
                        </div>
                        
                        {selectedBien.utilisateur.telephone && (
                          <a 
                            href={`tel:${selectedBien.utilisateur.telephone}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-green-50 transition-all shadow-sm border border-gray-100 hover:border-green-200 group"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <Phone className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                              <p className="font-semibold text-gray-900 text-lg">{selectedBien.utilisateur.telephone}</p>
                            </div>
                          </a>
                        )}
                        
                        {selectedBien.utilisateur.email && (
                          <a 
                            href={`mailto:${selectedBien.utilisateur.email}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-sm border border-gray-100 hover:border-blue-200 group"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Mail className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                              <p className="font-semibold text-gray-900 text-base">{selectedBien.utilisateur.email}</p>
                            </div>
                          </a>
                        )}

                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                          Envoyer un message
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">Informations de contact non disponibles</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{selectedBien.visites || 0}</p>
                        <p className="text-sm text-gray-500">Visites</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{selectedBien.contacts || 0}</p>
                        <p className="text-sm text-gray-500">Contacts</p>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Publié le {new Date(selectedBien.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Galerie Médias */}
      {showMediaGallery && selectedBien && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">
                {selectedBien.libelle} - {selectedBien.images?.length || 0} photos
              </h3>
              <button
                onClick={() => setShowMediaGallery(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image principale */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              {selectedBien.images && selectedBien.images.length > 0 && (
                <img 
                  src={selectedBien.images[currentImageIndex]} 
                  alt={`Photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Navigation */}
              {selectedBien.images && selectedBien.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Compteur */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {selectedBien.images?.length || 0}
              </div>
            </div>

            {/* Miniatures */}
            {selectedBien.images && selectedBien.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {selectedBien.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Demande de Connexion */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h3>
            <p className="text-gray-600 mb-6">
              Pour voir les détails complets de ce bien et contacter l'agence, veuillez vous connecter ou créer un compte.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => router.push('/login')}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Bien */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un nouveau bien</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé du bien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBien.libelle}
                    onChange={(e) => setNewBien({ ...newBien, libelle: e.target.value })}
                    placeholder="Ex: Villa de luxe à Bamako"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de bien <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBien.idTypeBien}
                    onChange={(e) => setNewBien({ ...newBien, idTypeBien: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Sélectionner un type</option>
                    {typesBiens.map(type => (
                      <option key={type.id} value={type.id.toString()}>{type.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newBien.description}
                  onChange={(e) => setNewBien({ ...newBien, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez le bien en détail..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBien.adresse}
                  onChange={(e) => setNewBien({ ...newBien, adresse: e.target.value })}
                  placeholder="Ex: ACI 2000, Rue 123, Bamako"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newBien.latitude}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Accepter seulement les nombres valides (positifs ou négatifs avec décimales)
                      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                        setNewBien({ ...newBien, latitude: value });
                      }
                    }}
                    placeholder="Ex: 12.6392"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newBien.longitude}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Accepter seulement les nombres valides (positifs ou négatifs avec décimales)
                      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                        setNewBien({ ...newBien, longitude: value });
                      }
                    }}
                    placeholder="Ex: -8.0029"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (m²) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newBien.superficie || ""}
                    onChange={(e) => setNewBien({ ...newBien, superficie: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 350"
                    min="1"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newBien.prix || ""}
                    onChange={(e) => setNewBien({ ...newBien, prix: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 50000000"
                    min="1"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Publication Gratuite Message */}
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400 rounded-2xl p-6 text-white shadow-lg">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight">Publication 100% Gratuite !</h4>
                    <p className="text-emerald-50 text-sm font-medium opacity-90">Bonne nouvelle : Dans cette version de lancement, la publication de vos annonces est totalement gratuite.</p>
                  </div>
                  <div className="text-2xl font-black bg-white text-emerald-600 px-4 py-1 rounded-xl shadow-md">
                    0 FCFA
                  </div>
                </div>
              </div>

              {/* Visite Payante */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Visites payantes</h4>
                      <p className="text-xs text-gray-500">Les clients paient pour visiter ce bien</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewBien({ ...newBien, visitePayante: false, tarifVisite: 0 })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!newBien.visitePayante ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Gratuit
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBien({ ...newBien, visitePayante: true })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${newBien.visitePayante ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Payant
                    </button>
                  </div>
                </div>
                {newBien.visitePayante && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarif par visite (FCFA) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newBien.tarifVisite || ""}
                        onChange={(e) => setNewBien({ ...newBien, tarifVisite: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 5000"
                        min="1"
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      />
                      <span className="text-sm text-gray-500 font-medium">FCFA</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Ce montant sera facturé aux clients pour chaque visite de ce bien.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de transaction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBien.transactionType}
                    onChange={(e) => setNewBien({ ...newBien, transactionType: e.target.value as "A_VENDRE" | "A_LOUER" })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="A_VENDRE">Vente</option>
                    <option value="A_LOUER">Location</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBien}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Ajout en cours...
                    </div>
                  ) : (
                    'Ajouter le bien'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
