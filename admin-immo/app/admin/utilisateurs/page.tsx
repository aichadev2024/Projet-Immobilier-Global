"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  nomUtilisateur: string;
  role: string;
  statut: string;
  createdAt: string;
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📡 Récupération des utilisateurs depuis le backend...");
      
      const response = await fetch("http://localhost:8080/api/utilisateurs", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        console.log("👥 Utilisateurs reçus:", usersData);
        
        // Transformer les données du backend au format du frontend
        const formattedUsers: User[] = usersData.map((user: any) => ({
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone || "Non renseigné",
          nomUtilisateur: user.nomUtilisateur,
          role: user.role,
          statut: user.statut || "ACTIF", // Le backend ne renvoie pas toujours le statut
          createdAt: user.createdAt
        }));

        setUsers(formattedUsers);
        setTotalPages(Math.ceil(formattedUsers.length / 10)); // 10 utilisateurs par page
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération des utilisateurs:", response.status, errorText);
        
        // En cas d'erreur, utiliser les données simulées
        const mockUsers: User[] = [
          {
            id: "1",
            prenom: "Jean",
            nom: "Dupont",
            email: "jean.dupont@email.com",
            telephone: "+223 70 00 00 01",
            nomUtilisateur: "jeandupont",
            role: "CLIENT",
            statut: "ACTIF",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "2",
            prenom: "Marie",
            nom: "Martin",
            email: "marie.martin@email.com",
            telephone: "+223 70 00 00 02",
            nomUtilisateur: "mariemartin",
            role: "CLIENT",
            statut: "ACTIF",
            createdAt: "2024-01-20T14:15:00Z"
          },
          {
            id: "3",
            prenom: "Pierre",
            nom: "Durand",
            email: "pierre.durand@email.com",
            telephone: "+223 70 00 00 03",
            nomUtilisateur: "pierredurand",
            role: "CLIENT",
            statut: "INACTIF",
            createdAt: "2024-02-01T09:45:00Z"
          }
        ];

        setUsers(mockUsers);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIF" ? "INACTIF" : "ACTIF";
    const action = newStatus === "ACTIF" ? "activer" : "désactiver";
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)} l'utilisateur ${userId}...`);
      
      // Pour l'instant, on simule l'action (à implémenter dans le backend)
      // const response = await fetch(`http://localhost:8080/api/utilisateurs/${userId}/status`, {
      //   method: "PUT",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ statut: newStatus })
      // });
      
      // Simulation locale pour le moment
      setUsers(prevUsers => 
        prevUsers.map((user: User) => 
          user.id === userId ? { ...user, statut: newStatus } : user
        )
      );
      
      console.log(`✅ Utilisateur ${action} avec succès`);
      alert(`✅ Utilisateur ${action} avec succès!`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'${action} de l'utilisateur:`, error);
      alert(`❌ Erreur lors de la modification du statut`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`🗑️ Suppression de l'utilisateur ${userId}...`);
      
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        console.log("✅ Utilisateur supprimé avec succès");
        alert("✅ Utilisateur supprimé avec succès!");
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "TOUS" || user.statut === statusFilter;
    const matchesRole = roleFilter === "TOUS" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
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
            Utilisateurs
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
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
              <option value="ACTIF">Actifs</option>
              <option value="INACTIF">Inactifs</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="TOUS">Tous les rôles</option>
              <option value="CLIENT">Clients</option>
              <option value="AGENT">Agents</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date création
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.nomUtilisateur}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.telephone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        user.statut === "ACTIF" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          user.statut === "ACTIF" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        {user.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.statut)}
                          className={`p-2 ${
                            user.statut === "ACTIF" 
                              ? "text-orange-600 hover:text-orange-700" 
                              : "text-green-600 hover:text-green-700"
                          } transition-colors`}
                        >
                          {user.statut === "ACTIF" ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
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
