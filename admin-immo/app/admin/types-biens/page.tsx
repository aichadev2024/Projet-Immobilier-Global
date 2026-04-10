"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus, Edit2, Trash2, Search, Save, X, AlertCircle, Loader2, DollarSign, FileText, CheckCircle } from "lucide-react";

interface TypeBien {
  id: number; libelle: string; description?: string;
  modeTarification: "FIXE" | "POURCENTAGE" | "GRATUIT";
  tarifBase: number; isDeleted: boolean; createdAt: string; updatedAt?: string;
}

export default function TypesBiensAdmin() {
  const [typesBiens, setTypesBiens] = useState<TypeBien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeBien | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [formData, setFormData] = useState({ libelle: "", modeTarification: "GRATUIT" as "FIXE" | "POURCENTAGE" | "GRATUIT", tarifBase: 0, tarifBaseInput: "0" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { checkUserRole(); fetchTypesBiens(); }, []);

  const checkUserRole = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) { setUserRole("NO_TOKEN"); return; }
    let role = "UNKNOWN";
    if (userStr) { try { role = JSON.parse(userStr).role || "UNKNOWN"; } catch { role = "ERROR"; } }
    else { try { const p = JSON.parse(atob(token.split(".")[1])); role = p.role || "UNKNOWN"; localStorage.setItem("user", JSON.stringify({ nomUtilisateur: p.sub, role, email: p.sub })); } catch { role = "ERROR"; } }
    setUserRole(role);
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") setError("Accès refusé. Seuls les administrateurs peuvent gérer les types de biens.");
  };

  const fetchTypesBiens = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { router.push("/login"); return; }
      const res = await fetch("http://localhost:8080/api/type-biens", { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      if (res.ok) { setTypesBiens(await res.json()); }
      else if (res.status === 401) { localStorage.removeItem("accessToken"); sessionStorage.removeItem("accessToken"); setTimeout(() => router.push("/login"), 2000); setError("Token expiré. Redirection..."); }
      else { setError(`Erreur ${res.status}: Impossible de charger les types de biens`); }
    } catch { setError("Erreur de connexion au serveur"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") { setError("Accès refusé."); return; }
    if (!formData.libelle || formData.libelle.trim().length < 2) { setError("Le libellé doit contenir au moins 2 caractères"); return; }
    if (!editingType && typesBiens.some(t => t.libelle.toLowerCase() === formData.libelle.trim().toLowerCase())) { setError("Un type avec ce libellé existe déjà"); return; }
    setSubmitting(true); setError(null);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) { setError("Aucun token"); return; }
      const url = editingType ? `http://localhost:8080/api/type-biens/${editingType.id}` : "http://localhost:8080/api/type-biens";
      const body = { libelle: formData.libelle, modeTarification: "GRATUIT", tarifBase: 0 };
      const res = await fetch(url, { method: editingType ? "PUT" : "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { await fetchTypesBiens(); resetForm(); setShowModal(false); setSuccess(editingType ? "Mis à jour !" : "Créé !"); setTimeout(() => setSuccess(null), 3000); }
      else { const t = await res.text(); try { setError(JSON.parse(t).message || `Erreur ${res.status}`); } catch { setError(`Erreur ${res.status}: ${t}`); } }
    } catch { setError("Erreur de connexion au serveur"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (type: TypeBien) => { setEditingType(type); setFormData({ libelle: type.libelle, modeTarification: type.modeTarification, tarifBase: type.tarifBase, tarifBaseInput: type.tarifBase.toString() }); setShowModal(true); };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce type de bien ?")) return;
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch(`http://localhost:8080/api/type-biens/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) { await fetchTypesBiens(); setSuccess("Supprimé."); setTimeout(() => setSuccess(null), 3000); }
      else { setError(`Erreur ${res.status}`); }
    } catch { setError("Erreur de connexion au serveur"); }
  };

  const resetForm = () => { setFormData({ libelle: "", modeTarification: "GRATUIT", tarifBase: 0, tarifBaseInput: "0" }); setEditingType(null); };
  const filteredTypes = typesBiens.filter(t => t.libelle.toLowerCase().includes(searchTerm.toLowerCase()));
  const getTarificationLabel = (m: string) => ({ FIXE: "Fixe", POURCENTAGE: "Pourcentage", GRATUIT: "Gratuit" }[m] ?? m);
  const getTarificationStyle = (m: string) => ({ FIXE: "bg-blue-100 text-blue-800 border-blue-300", POURCENTAGE: "bg-emerald-100 text-emerald-800 border-emerald-300", GRATUIT: "bg-purple-100 text-purple-800 border-purple-300" }[m] ?? "bg-slate-100 text-slate-700 border-slate-300");
  const canManage = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Chargement des types de biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Tag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Types de Biens</h1>
              <p className="text-purple-100 text-sm font-medium mt-0.5">Gérez les catégories de biens immobiliers</p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter un type</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Total types", value: typesBiens.length, icon: Tag, color: "from-indigo-500 to-purple-600", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", num: "text-indigo-600" },
          { label: "Offre", value: "Gratuit (Illimité)", icon: CheckCircle, color: "from-emerald-500 to-green-600", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", num: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.bg} p-5 shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.text}`}>{s.label}</p>
            <p className={`text-3xl font-black ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Rechercher un type de bien..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut Offre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Créé le</th>
                {canManage && <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold">Aucun type de bien trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-bold text-slate-900">{type.libelle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-purple-100 text-purple-800 border-purple-300">
                        OFFERT (Gratuit)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{new Date(type.createdAt).toLocaleDateString("fr-FR")}</td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleEdit(type)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition-all border border-slate-200 hover:border-indigo-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(type.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-all border border-slate-200 hover:border-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
                  {editingType ? <Edit2 className="w-5 h-5 text-purple-600" /> : <Plus className="w-5 h-5 text-purple-600" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{editingType ? "Modifier un type" : "Ajouter un type"}</h3>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); setError(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Libellé *</label>
                <input type="text" required value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-medium"
                  placeholder="Ex: Appartement, Villa, Terrain..." />
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-purple-900">Offre Exceptionnelle : Gratuit</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); setError(null); }}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md">
                  {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>) : (<><Save className="w-4 h-4" />{editingType ? "Mettre à jour" : "Créer"}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
