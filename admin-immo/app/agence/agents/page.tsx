"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Filter,
  Calendar,
  MapPin
} from "lucide-react";

interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: "DIRECTEUR" | "AGENT" | "ASSISTANT";
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  dateEmbauche: string;
  biensGeres: number;
  ventesRealisees: number;
  dernierConnexion: string;
  photo?: string;
  specialite?: string;
  permis?: string;
}

export default function AgenceAgents() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("TOUS");
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [newAgent, setNewAgent] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "+223 ",
    role: "AGENT" as "DIRECTEUR" | "AGENT" | "ASSISTANT",
    specialite: "",
    permis: ""
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAgents(token);
  }, [router]);

  const fetchAgents = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/agences/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Adapter les données pour l'interface
        const formattedAgents = data.map((a: any) => ({
          ...a,
          dateEmbauche: a.createdAt,
          biensGeres: 0,
          ventesRealisees: 0,
          role: "AGENT", // Rôle par défaut en attendant les métiers spécifiques
          statut: a.statut === "EN_ATTENTE_VALIDATION" ? "INACTIF" : a.statut
        }));
        setAgents(formattedAgents);
      } else {
        // Données mock si le backend n'est pas prêt
        const mockAgents: Agent[] = [
          {
            id: "1",
            nom: "Traoré",
            prenom: "Mamadou",
            email: "mamadou.traore@agence.com",
            telephone: "+223 50 47 97 78",
            role: "DIRECTEUR",
            statut: "ACTIF",
            dateEmbauche: "2023-01-15",
            biensGeres: 45,
            ventesRealisees: 12,
            dernierConnexion: "2024-03-16T09:30:00",
            photo: "",
            specialite: "Biens de luxe",
            permis: "Permis A"
          },
          {
            id: "2",
            nom: "Koné",
            prenom: "Aminata",
            email: "aminata.kone@agence.com",
            telephone: "+223 60 47 97 79",
            role: "AGENT",
            statut: "ACTIF",
            dateEmbauche: "2023-06-20",
            biensGeres: 28,
            ventesRealisees: 8,
            dernierConnexion: "2024-03-16T08:15:00",
            photo: "",
            specialite: "Appartements",
            permis: "Permis B"
          },
          {
            id: "3",
            nom: "Diarra",
            prenom: "Bakary",
            email: "bakary.diarra@agence.com",
            telephone: "+223 70 47 97 76",
            role: "AGENT",
            statut: "INACTIF",
            dateEmbauche: "2023-09-10",
            biensGeres: 15,
            ventesRealisees: 3,
            dernierConnexion: "2024-03-10T14:20:00",
            photo: "",
            specialite: "Terrains",
            permis: "Permis B"
          }
        ];
        setAgents(mockAgents);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/agences/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAgent)
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewAgent({
          nom: "",
          prenom: "",
          email: "",
          telephone: "+223 ",
          role: "AGENT",
          specialite: "",
          permis: ""
        });
        if (token) fetchAgents(token);
        alert("Agent créé avec succès ! Un code de validation lui a été envoyé par email.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Erreur lors de l'ajout de l'agent. Veuillez vérifier les informations.");
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur de connexion est survenue lors de l'ajout de l'agent.");
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/agences/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (token) fetchAgents(token);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "TOUS" || agent.role === filterRole;
    const matchesStatut = filterStatut === "TOUS" || agent.statut === filterStatut;

    return matchesSearch && matchesRole && matchesStatut;
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      "DIRECTEUR": { color: "bg-purple-100 text-purple-800", icon: <Shield className="w-4 h-4" />, label: "Directeur" },
      "AGENT": { color: "bg-blue-100 text-blue-800", icon: <Users className="w-4 h-4" />, label: "Agent" },
      "ASSISTANT": { color: "bg-green-100 text-green-800", icon: <UserCheck className="w-4 h-4" />, label: "Assistant" }
    };
    return badges[role as keyof typeof badges] || badges["AGENT"];
  };

  const getStatutBadge = (statut: string) => {
    const badges = {
      "ACTIF": { color: "bg-green-100 text-green-800", icon: <UserCheck className="w-4 h-4" />, label: "Actif" },
      "INACTIF": { color: "bg-gray-100 text-gray-800", icon: <UserX className="w-4 h-4" />, label: "Inactif" },
      "SUSPENDU": { color: "bg-red-100 text-red-800", icon: <UserX className="w-4 h-4" />, label: "Suspendu" }
    };
    return badges[statut as keyof typeof badges] || badges["INACTIF"];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestion des agents</h1>
          <p className="mt-3 text-lg text-gray-600">Gérez les employés de votre agence immobilière</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base font-medium"
        >
          <Plus className="w-5 h-5" />
          Ajouter un agent
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
          >
            <option value="TOUS">Tous les rôles</option>
            <option value="DIRECTEUR">Directeurs</option>
            <option value="AGENT">Agents</option>
            <option value="ASSISTANT">Assistants</option>
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
            <option value="SUSPENDU">Suspendus</option>
          </select>

          <div className="flex items-center gap-2 text-base text-gray-600">
            <Users className="w-5 h-5" />
            <span className="font-medium">{filteredAgents.length} agents trouvés</span>
          </div>
        </div>
      </div>

      {/* Liste des agents en Grid premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Aucun agent trouvé</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* En-tête de carte */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform">
                    {agent.prenom[0]}{agent.nom[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                      {agent.prenom} {agent.nom}
                    </h3>
                    {agent.specialite && (
                      <p className="text-sm font-medium text-slate-500 mt-0.5">{agent.specialite}</p>
                    )}
                  </div>
                </div>
                {/* Menu Actions rapide */}
                <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1">
                  <button onClick={() => { setSelectedAgent(agent); setShowDetails(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors" title="Détails">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-colors" title="Modifier">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Badges statut & rôle */}
              <div className="flex gap-2 mb-5 relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-transparent ${getRoleBadge(agent.role).color.replace('bg-', 'bg-opacity-50 border-')}`}>
                  {getRoleBadge(agent.role).icon}
                  {getRoleBadge(agent.role).label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-transparent ${getStatutBadge(agent.statut).color.replace('bg-', 'bg-opacity-50 border-')}`}>
                  {getStatutBadge(agent.statut).label}
                </span>
              </div>

              {/* Infos contact */}
              <div className="space-y-2.5 mb-6 relative z-10">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  {agent.email}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  {agent.telephone}
                </div>
              </div>

              {/* Statistiques Performance footer */}
              <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 relative z-10">
                <div>
                  <div className="text-2xl font-black text-slate-800 leading-none">{agent.biensGeres}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Biens gérés</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600 leading-none">{agent.ventesRealisees}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Ventes</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Ajout Agent */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un agent</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={newAgent.nom}
                  onChange={(e) => setNewAgent({ ...newAgent, nom: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={newAgent.prenom}
                  onChange={(e) => setNewAgent({ ...newAgent, prenom: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newAgent.telephone}
                  onChange={(e) => setNewAgent({ ...newAgent, telephone: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as "DIRECTEUR" | "AGENT" | "ASSISTANT" })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="AGENT">Agent immobilier</option>
                  <option value="ASSISTANT">Assistant agence</option>
                  <option value="DIRECTEUR">Directeur agence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                <input
                  type="text"
                  value={newAgent.specialite}
                  onChange={(e) => setNewAgent({ ...newAgent, specialite: e.target.value })}
                  placeholder="ex: Biens de luxe, Appartements..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddAgent}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Ajouter l'agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Agent */}
      {showDetails && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de {selectedAgent.prenom} {selectedAgent.nom}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-xl">
                    {selectedAgent.prenom[0]}{selectedAgent.nom[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedAgent.prenom} {selectedAgent.nom}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedAgent.role).color}`}>
                      {getRoleBadge(selectedAgent.role).icon}
                      {getRoleBadge(selectedAgent.role).label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(selectedAgent.statut).color}`}>
                      {getStatutBadge(selectedAgent.statut).icon}
                      {getStatutBadge(selectedAgent.statut).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedAgent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedAgent.telephone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Informations professionnelles</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date d'embauche:</span>
                      <span className="font-medium">{new Date(selectedAgent.dateEmbauche).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {selectedAgent.specialite && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spécialité:</span>
                        <span className="font-medium">{selectedAgent.specialite}</span>
                      </div>
                    )}
                    {selectedAgent.permis && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Permis:</span>
                        <span className="font-medium">{selectedAgent.permis}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedAgent.biensGeres}</div>
                  <p className="text-sm text-gray-600 mt-1">Biens gérés</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedAgent.ventesRealisees}</div>
                  <p className="text-sm text-gray-600 mt-1">Ventes réalisées</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedAgent.biensGeres > 0 ? Math.round((selectedAgent.ventesRealisees / selectedAgent.biensGeres) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Taux de conversion</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Modifier l'agent
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Voir l'historique
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
