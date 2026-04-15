"use client";

import React, { useState } from "react";
import {
  Users, Search, Filter, Mail, Phone,
  MoreVertical, UserPlus, FilterX
} from "lucide-react";

interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  statut: "CHAUD" | "FROID" | "CONCLU";
  typeRecherche: string;
  budget: string;
  dernierContact: string;
  avatar: string;
}

// Remplace les fausses données par l'état React

export default function AgenceClients() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  React.useEffect(() => {
    const fetchClients = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/utilisateurs/clients/mes-clients", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClients(data.map((u: any) => ({
            id: u.id.toString(),
            nom: `${u.prenom} ${u.nom}`,
            email: u.email || "N/A",
            telephone: u.telephone || "N/A",
            statut: u.statut === "ACTIF" ? "REPONDU" : "LU", // Mapping arbitraire pour l'UI
            typeRecherche: u.role || "Client",
            budget: "-",
            dernierContact: u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : "Date inconnue",
            avatar: u.prenom ? u.prenom.charAt(0).toUpperCase() : "U"
          })));
        }
      } catch (error) {
        console.error("Erreur chargement clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === "TOUS" || client.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return <span className="p-1.5 px-3 bg-rose-100 text-rose-700 rounded-full text-xs font-bold ring-1 ring-rose-200">En attente</span>;
      case 'LU':
        return <span className="p-1.5 px-3 bg-slate-100 text-slate-700 rounded-full text-xs font-bold ring-1 ring-slate-200">Lu</span>;
      case 'REPONDU':
        return <span className="p-1.5 px-3 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold ring-1 ring-emerald-200">Répondu</span>;
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
            <Users className="w-6 h-6 text-indigo-500" />
            Mes Clients & Prospects
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez votre carnet d'adresses et le suivi de vos leads.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-medium flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Nouveau Contact
        </button>
      </div>

      {/* Tools & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400 hidden lg:block" />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="flex-1 md:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium text-slate-900"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="LU">Lus</option>
            <option value="REPONDU">Répondus</option>
          </select>
          {(searchTerm || filterStatut !== "TOUS") && (
            <button
              onClick={() => { setSearchTerm(""); setFilterStatut("TOUS"); }}
              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
              title="Réinitialiser les filtres"
            >
              <FilterX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Recherche & Budget</th>
                <th className="px-6 py-4">Dernier Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-indigo-600">
                    Chargement des contacts...
                  </td>
                </tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {client.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.nom}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1 hover:text-indigo-500 cursor-pointer transition-colors"><Mail className="w-3.5 h-3.5" />{client.email}</span>
                          <span className="flex items-center gap-1 hover:text-indigo-500 cursor-pointer transition-colors"><Phone className="w-3.5 h-3.5" />{client.telephone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatutBadge(client.statut)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">{client.typeRecherche}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{client.budget}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{client.dernierContact}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucun client trouvé avec ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
