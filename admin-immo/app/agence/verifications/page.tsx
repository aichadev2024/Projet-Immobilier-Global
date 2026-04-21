"use client";
import { API_BASE_URL } from "@/services/api";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Home,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Bien {
  id: number;
  libelle: string;
  description?: string;
  adresse?: string;
  prix: number;
  superficie?: number;
  statutBien: string;
  transactionType: string;
  typeBien?: string;
  createdById?: string;
  createdByNom?: string;
  createdByPrenom?: string;
  createdAt?: string;
  commentaireVerification?: string;
  images?: string[];
}

export default function VerificationsPage() {
  const router = useRouter();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"approuver" | "rejeter" | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [processing, setProcessing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    
    if (!token) {
      router.push("/login");
      return;
    }

    // Seulement AGENCE peut accéder à cette page
    if (role !== 'AGENCE') {
      router.push("/agence/tableau-de-bord");
      return;
    }

    setUserRole(role);
    fetchBiensEnAttente(token);
  }, [router]);

  const fetchBiensEnAttente = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/biens/en-attente-validation`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des biens');
      }

      const data = await response.json();
      if (data.success) {
        setBiens(data.data || []);
      } else {
        toast.error(data.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les biens en attente");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (bien: Bien, action: "approuver" | "rejeter") => {
    setSelectedBien(bien);
    setActionType(action);
    setCommentaire("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedBien || !actionType) return;

    // Validation pour le rejet : commentaire obligatoire
    if (actionType === "rejeter" && !commentaire.trim()) {
      toast.error("Un commentaire est obligatoire pour rejeter un bien");
      return;
    }

    setProcessing(true);
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    try {
      const endpoint = actionType === "approuver" 
        ? `${API_BASE_URL}/api/biens/${selectedBien.id}/approuver`
        : `${API_BASE_URL}/api/biens/${selectedBien.id}/rejeter`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentaire: commentaire || undefined })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Rafraîchir la liste
        setBiens(biens.filter(b => b.id !== selectedBien.id));
        setShowModal(false);
        setSelectedBien(null);
        setActionType(null);
      } else {
        toast.error(data.message || "Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du traitement");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE_VALIDATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'APPROUVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </span>
        );
      case 'REJETE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vérifications</h1>
            <p className="text-slate-600">
              Validez ou rejetez les biens soumis par vos agents
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En attente</p>
              <p className="text-2xl font-bold text-slate-900">{biens.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Liste des biens */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            Biens en attente de validation
          </h2>
        </div>

        {biens.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Aucun bien en attente
            </h3>
            <p className="text-slate-500">
              Tous les biens ont été vérifiés. Les nouveaux biens apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {biens.map((bien) => (
              <div key={bien.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(bien.statutBien)}
                      <span className="text-sm text-slate-500">
                        {bien.transactionType === 'A_VENDRE' ? 'À vendre' : 'À louer'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {bien.libelle}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {bien.createdByPrenom} {bien.createdByNom}
                      </span>
                      {bien.adresse && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {bien.adresse}
                        </span>
                      )}
                      {bien.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(bien.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-indigo-600">
                        {formatPrice(bien.prix)}
                      </span>
                      {bien.superficie && (
                        <span className="text-sm text-slate-500">
                          {bien.superficie} m²
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleAction(bien, "approuver")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleAction(bien, "rejeter")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de vérification */}
      {showModal && selectedBien && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {actionType === "approuver" ? "Approuver le bien" : "Rejeter le bien"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Info du bien */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">{selectedBien.libelle}</h4>
                <p className="text-sm text-slate-500">
                  {selectedBien.transactionType === 'A_VENDRE' ? 'À vendre' : 'À louer'} • {formatPrice(selectedBien.prix)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Agent: {selectedBien.createdByPrenom} {selectedBien.createdByNom}
                </p>
              </div>

              {/* Description si disponible */}
              {selectedBien.description && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description du bien
                  </label>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    {selectedBien.description}
                  </p>
                </div>
              )}

              {/* Champ commentaire */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Commentaire {actionType === "rejeter" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={actionType === "approuver" 
                    ? "Commentaire optionnel..." 
                    : "Veuillez indiquer la raison du rejet..."
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
                {actionType === "rejeter" && (
                  <p className="text-xs text-slate-500 mt-1">
                    * Le commentaire est obligatoire pour rejeter un bien
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={processing}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing || (actionType === "rejeter" && !commentaire.trim())}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  actionType === "approuver"
                    ? "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                    : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                }`}
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  actionType === "approuver" ? "Approuver" : "Rejeter"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
