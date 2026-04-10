"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Eye, MapPin, Home, Bed, Bath, Square,
  AlertCircle, CheckCircle, X, Search,
} from "lucide-react";

interface BienImmobilier {
  id: number; libelle: string; description: string; adresse: string;
  latitude: string; longitude: string; prixCalculer: number; statutBien: string;
  transactionType: "VENTE" | "LOCATION"; dateCreation: string; datePublication?: string;
  isDeleted: boolean;
  typeBien: { id: number; libelle: string };
  utilisateur: { id: string; nom: string; email: string; role: string };
  caracteristiques?: { superficie: number; nbChambres: number; nbSallesDeBain: number; nbParking: number };
  images?: string[];
}

export default function BiensAdmin() {
  const [biens, setBiens] = useState<BienImmobilier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBien, setSelectedBien] = useState<BienImmobilier | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchBiens(); }, []);

  const fetchBiens = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { router.push("/login"); return; }
      const response = await fetch("http://localhost:8080/api/admin/biens", {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (response.ok) { setBiens(await response.json()); }
      else { setError("Erreur lors du chargement des biens"); }
    } catch { setError("Erreur de connexion au serveur"); }
    finally { setLoading(false); }
  };

  const handleValidate = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { router.push("/login"); return; }
      const res = await fetch(`http://localhost:8080/api/admin/biens/${id}/valider`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.ok) await fetchBiens(); else setError("Erreur lors de la validation");
    } catch { setError("Erreur de connexion au serveur"); }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir refuser ce bien ?")) return;
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { router.push("/login"); return; }
      const res = await fetch(`http://localhost:8080/api/admin/biens/${id}/refuser`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.ok) await fetchBiens(); else setError("Erreur lors du refus");
    } catch { setError("Erreur de connexion au serveur"); }
  };

  const filteredBiens = biens.filter((b) =>
    b.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.typeBien.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutLabel = (s: string) => ({ 
    EN_ATTENTE: "En attente", 
    VALIDE: "Validé", 
    REFUSE: "Refusé", 
    PUBLIE: "Publié", 
    DISPONIBLE: "Disponible",
    LOUE: "Loué",
    VENDU: "Vendu",
    INDISPONIBLE: "Indisponible"
  }[s] ?? s);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Biens Immobiliers</h1>
              <p className="text-indigo-100 text-sm font-medium mt-0.5">Gérez et validez les biens des agences</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">{biens.length} biens</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: biens.length, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", numColor: "text-indigo-600", icon: Building2 },
          { label: "En attente", value: biens.filter(b => b.statutBien === "EN_ATTENTE").length, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", numColor: "text-amber-600", icon: AlertCircle },
          { label: "Disponibles", value: biens.filter(b => b.statutBien === "DISPONIBLE" || b.statutBien === "VALIDE").length, color: "from-emerald-500 to-green-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", numColor: "text-emerald-600", icon: CheckCircle },
          { label: "Indisponibles", value: biens.filter(b => ["LOUE", "VENDU", "INDISPONIBLE"].includes(b.statutBien)).length, color: "from-red-500 to-rose-500", bg: "bg-red-50 border-red-200", text: "text-red-700", numColor: "text-red-600", icon: X },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.bg} p-5 shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.text}`}>{s.label}</p>
            <p className={`text-3xl font-black ${s.numColor}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Rechercher un bien par titre, adresse, type..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Bien", "Type", "Propriétaire", "Prix", "Statut", "Date", "Actions"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBiens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold">Aucun bien trouvé</p>
                    <p className="text-slate-400 text-sm mt-1">Essayez de modifier votre recherche</p>
                  </td>
                </tr>
              ) : (
                filteredBiens.map((bien) => (
                  <tr key={bien.id} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{bien.libelle}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-indigo-400" />{bien.adresse}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">{bien.typeBien.libelle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{bien.utilisateur.nom}</div>
                      <div className="text-xs text-slate-500">{bien.utilisateur.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{bien.prixCalculer.toLocaleString()} FCFA</div>
                      <div className="text-xs text-slate-500 font-medium">{bien.transactionType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        bien.statutBien === "EN_ATTENTE" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        (bien.statutBien === "VALIDE" || bien.statutBien === "DISPONIBLE" || bien.statutBien === "PUBLIE") ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        bien.statutBien === "REFUSE" ? "bg-red-100 text-red-800 border-red-300" :
                        ["LOUE", "VENDU", "INDISPONIBLE"].includes(bien.statutBien) ? "bg-purple-100 text-purple-800 border-purple-300" :
                        "bg-blue-100 text-blue-800 border-blue-300"
                      }`}>{getStatutLabel(bien.statutBien)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{formatDate(bien.dateCreation)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setSelectedBien(bien); setShowDetailsModal(true); }}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition-all border border-slate-200 hover:border-indigo-300" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        {bien.statutBien === "EN_ATTENTE" && (<>
                          <button onClick={() => handleValidate(bien.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-all border border-slate-200 hover:border-emerald-300" title="Valider">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(bien.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all border border-slate-200 hover:border-red-300" title="Refuser">
                            <X className="w-4 h-4" />
                          </button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailsModal && selectedBien && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedBien.libelle}</h3>
                  <p className="text-xs text-slate-500">{selectedBien.typeBien.libelle}</p>
                </div>
              </div>
              <button onClick={() => { setShowDetailsModal(false); setSelectedBien(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informations</h4>
                  <div><p className="text-xs text-slate-500 mb-0.5">Description</p><p className="text-sm text-slate-800 font-medium">{selectedBien.description}</p></div>
                  <div><p className="text-xs text-slate-500 mb-0.5">Adresse</p><p className="text-sm text-slate-800 font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-500" />{selectedBien.adresse}</p></div>
                  <div><p className="text-xs text-slate-500 mb-0.5">Transaction</p><span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">{selectedBien.transactionType}</span></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prix & Statut</h4>
                  <div><p className="text-xs text-slate-500 mb-0.5">Prix</p><p className="text-2xl font-black text-slate-900">{selectedBien.prixCalculer.toLocaleString()} <span className="text-sm font-normal text-slate-500">FCFA</span></p></div>
                  <div><p className="text-xs text-slate-500 mb-0.5">Propriétaire</p><p className="text-sm font-bold text-slate-800">{selectedBien.utilisateur.nom}</p><p className="text-xs text-slate-500">{selectedBien.utilisateur.email}</p></div>
                </div>
              </div>
              {selectedBien.caracteristiques && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedBien.caracteristiques.superficie > 0 && (<div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center"><Square className="w-5 h-5 text-indigo-500 mx-auto mb-1" /><p className="text-lg font-black text-slate-900">{selectedBien.caracteristiques.superficie}</p><p className="text-xs text-slate-500">m²</p></div>)}
                  {selectedBien.caracteristiques.nbChambres > 0 && (<div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center"><Bed className="w-5 h-5 text-purple-500 mx-auto mb-1" /><p className="text-lg font-black text-slate-900">{selectedBien.caracteristiques.nbChambres}</p><p className="text-xs text-slate-500">Chambres</p></div>)}
                  {selectedBien.caracteristiques.nbSallesDeBain > 0 && (<div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center"><Bath className="w-5 h-5 text-cyan-500 mx-auto mb-1" /><p className="text-lg font-black text-slate-900">{selectedBien.caracteristiques.nbSallesDeBain}</p><p className="text-xs text-slate-500">Salles de bain</p></div>)}
                  {selectedBien.caracteristiques.nbParking > 0 && (<div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center"><Home className="w-5 h-5 text-emerald-500 mx-auto mb-1" /><p className="text-lg font-black text-slate-900">{selectedBien.caracteristiques.nbParking}</p><p className="text-xs text-slate-500">Parking</p></div>)}
                </div>
              )}
              {selectedBien.images && selectedBien.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Médias ({selectedBien.images.length})</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedBien.images.map((image, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={image.startsWith("http") ? image : `http://localhost:8080${image}`} alt={`Image ${i+1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300/f1f5f9/94a3b8?text=Image"; }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedBien.statutBien === "EN_ATTENTE" && (
                <div className="flex gap-3 pt-2 border-t border-slate-200">
                  <button onClick={() => { handleValidate(selectedBien.id); setShowDetailsModal(false); setSelectedBien(null); }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md">
                    <CheckCircle className="w-4 h-4" /> Valider ce bien
                  </button>
                  <button onClick={() => { handleReject(selectedBien.id); setShowDetailsModal(false); setSelectedBien(null); }}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md">
                    <X className="w-4 h-4" /> Refuser ce bien
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
