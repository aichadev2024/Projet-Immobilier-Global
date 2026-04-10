"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock,
  Crown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  nomUtilisateur: string;
  telephone?: string;
  role: string;
  statut: string;
  createdAt: string;
  lastLogin?: string;
  isDeleted?: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    nomUtilisateur: "",
    telephone: "+223 ",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [editFormData, setEditFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    nomUtilisateur: "",
    telephone: "",
    role: "ADMIN",
    statut: "ACTIF",
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") ||
                   localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      console.log("🔍 Vérification du rôle utilisateur:");
      console.log("🔑 Token exists:", !!token);
      
      if (!token) {
        console.log("❌ Pas de token, redirection vers login");
        router.push("/login");
        return;
      }

      try {
        // Récupérer les données complètes de l'utilisateur depuis le backend
        const response = await fetch("http://localhost:8080/api/utilisateurs/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("👤 User data from backend:", userData);
          console.log("🏆 Role:", userData.role);
          console.log("👑 isSuperAdmin:", userData.isSuperAdmin);
          
          // Vérifier si l'utilisateur est un Admin
          const isAdmin = userData.role === "ADMIN";
          console.log("✅ Is Admin:", isAdmin);
          
          setCurrentUser({...userData, isAdmin});
          
          // Rediriger si pas admin
          if (!isAdmin) {
            console.log("❌ Accès refusé - Redirection vers home");
            router.push("/");
            return;
          }
        } else {
          console.error("❌ Erreur lors de la récupération des données utilisateur:", response.status);
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la vérification du rôle:", error);
        router.push("/login");
      }
    };

    checkUserRole();
  }, []); // Tableau de dépendances vide pour n'exécuter qu'une seule fois

  // Séparer l'appel à fetchAdmins dans un useEffect différent
  useEffect(() => {
    if (currentUser && currentUser.isAdmin) {
      fetchAdmins();
    }
  }, [currentUser]); // Dépend seulement de currentUser

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") ||
                   localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📡 Récupération des administrateurs depuis le backend...");
      
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
        
        // Filtrer uniquement les administrateurs
        const adminUsers = usersData.filter((user: any) => 
          user.role === "ADMIN"
        );
        
        console.log("👨‍💼 Administrateurs filtrés:", adminUsers);
        
        // Transformer les données pour correspondre à l'interface AdminUser
        const transformedAdmins = adminUsers.map((user: any) => ({
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          nomUtilisateur: user.nomUtilisateur || user.username,
          telephone: user.telephone,
          role: user.role,
          statut: user.statut || "ACTIF",
          createdAt: user.createdAt,
        }));
        
        setAdmins(transformedAdmins);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedAdmins.length,
          itemsPerPage: 10
        });
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération des administrateurs:", response.status, errorText);
        // Utiliser les données mockées en cas d'erreur
        const mockAdmins = [
          {
            id: "1",
            nom: "Admin",
            prenom: "Super",
            email: "admin@bamakohome.com",
            nomUtilisateur: "superadmin",
            telephone: "+223 70 00 00 00",
            role: "ADMIN",
            statut: "ACTIF",
            createdAt: new Date().toISOString(),
          }
        ];
        setAdmins(mockAdmins);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des administrateurs:", error);
      // Utiliser les données mockées en cas d'erreur
      const mockAdmins = [
        {
          id: "1",
          nom: "Admin",
          prenom: "Super",
          email: "admin@bamakohome.com",
          nomUtilisateur: "superadmin",
          telephone: "+223 70 00 00 00",
          role: "ADMIN",
          statut: "ACTIF",
          createdAt: new Date().toISOString(),
        }
      ];
      setAdmins(mockAdmins);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.email || !formData.nomUtilisateur || !formData.motDePasse) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.motDePasse !== formData.confirmMotDePasse) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.motDePasse.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("👨‍💼 Création d'un nouvel administrateur...");
      
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          username: formData.nomUtilisateur,
          email: formData.email,
          password: formData.motDePasse,
          roleType: "ADMIN",
          telephone: formData.telephone
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Administrateur créé:", result);
        
        // Rafraîchir la liste des admins
        await fetchAdmins();
        
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          nomUtilisateur: "",
          telephone: "+223 ",
          motDePasse: "",
          confirmMotDePasse: "",
        });
        setShowCreateForm(false);
        
        alert(`✅ ${result.message}`);
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la création de l'administrateur:", response.status, errorText);
        alert("❌ Erreur lors de la création de l'administrateur");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'administrateur:", error);
      alert("❌ Erreur lors de la création de l'administrateur");
    } finally {
      setCreating(false);
    }
  };

  const updateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.nom || !editFormData.prenom || !editFormData.email || !editFormData.nomUtilisateur) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!selectedAdmin) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("👨‍💼 Mise à jour de l'administrateur...");
      
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom: editFormData.nom,
          prenom: editFormData.prenom,
          email: editFormData.email,
          nomUtilisateur: editFormData.nomUtilisateur,
          telephone: editFormData.telephone,
          statut: editFormData.statut
        })
      });

      if (response.ok) {
        const updatedAdmin = await response.json();
        console.log("✅ Administrateur mis à jour:", updatedAdmin);
        
        // Mettre à jour la liste locale
        setAdmins(admins.map(admin => 
          admin.id === selectedAdmin.id 
            ? { 
                ...admin, 
                nom: updatedAdmin.nom,
                prenom: updatedAdmin.prenom,
                email: updatedAdmin.email,
                nomUtilisateur: updatedAdmin.nomUtilisateur,
                telephone: updatedAdmin.telephone,
                statut: updatedAdmin.statut,
                role: updatedAdmin.role,
              } 
            : admin
        ));
        
        setShowEditForm(false);
        setSelectedAdmin(null);
        alert("✅ Administrateur modifié avec succès!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la mise à jour de l'administrateur:", response.status, errorText);
        alert("❌ Erreur lors de la modification de l'administrateur");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'administrateur:", error);
      alert("❌ Erreur lors de la modification de l'administrateur");
    } finally {
      setUpdating(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIF" ? "INACTIF" : "ACTIF";
    const action = newStatus === "ACTIF" ? "activer" : "désactiver";
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet administrateur ?`)) return;
    
    try {
      // API call here
      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, statut: newStatus } : admin
      ));
      alert(`✅ Administrateur ${action} avec succès!`);
    } catch (error) {
      alert("❌ Erreur lors de la modification du statut");
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) return;
    
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("🗑️ Suppression de l'administrateur...");
      
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${adminId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        console.log("✅ Administrateur supprimé avec succès");
        setAdmins(admins.filter(admin => admin.id !== adminId));
        alert("✅ Administrateur supprimé avec succès!");
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

  const openEditForm = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditFormData({
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      nomUtilisateur: admin.nomUtilisateur,
      telephone: admin.telephone || "",
      role: admin.role,
      statut: admin.statut,
    });
    setShowEditForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des administrateurs...</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Accès réservé aux Administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-500" />
            Gestion des Administrateurs
          </h1>
          <p className="mt-2 text-gray-600">
            Créez et gérez les comptes administrateurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            {showCreateForm ? "Annuler" : "Créer un Admin"}
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            Créer un nouvel Administrateur
          </h2>
          
          <form onSubmit={createAdmin} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
                <input
                  type="text"
                  value={formData.nomUtilisateur}
                  onChange={(e) => setFormData({...formData, nomUtilisateur: e.target.value.toLowerCase().replace(/\s+/g, "")})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+223 70 00 00 00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input
                  type="password"
                  value={formData.motDePasse}
                  onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={formData.confirmMotDePasse}
                  onChange={(e) => setFormData({...formData, confirmMotDePasse: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>


            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Créer l'administrateur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulaire de modification */}
      {showEditForm && selectedAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Modifier l'administrateur: {selectedAdmin.prenom} {selectedAdmin.nom}
          </h2>
          
          <form onSubmit={updateAdmin} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({...editFormData, nom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={editFormData.prenom}
                  onChange={(e) => setEditFormData({...editFormData, prenom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
                <input
                  type="text"
                  value={editFormData.nomUtilisateur}
                  onChange={(e) => setEditFormData({...editFormData, nomUtilisateur: e.target.value.toLowerCase().replace(/\s+/g, "")})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={editFormData.telephone}
                onChange={(e) => setEditFormData({...editFormData, telephone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+223 70 00 00 00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={editFormData.statut}
                  onChange={(e) => setEditFormData({...editFormData, statut: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
              

            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedAdmin(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Modifier l'administrateur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Liste des Administrateurs ({pagination.totalItems})
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un administrateur..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
            />
          </div>
        </div>
      </div>
      
      {/* Tableau des administrateurs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Shield className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">Aucun administrateur trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <Shield className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.prenom} {admin.nom}</div>
                          <div className="text-sm text-gray-500">@{admin.nomUtilisateur}</div>

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{admin.email}</span>
                        </div>
                        {admin.telephone && (
                          <div className="flex items-center gap-2">
                            <span>{admin.telephone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                        <Shield className="h-3 w-3" />
                        Administrateur
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.statut === "ACTIF" 
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {admin.statut === "ACTIF" ? (
                            <Unlock className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {admin.statut === "ACTIF" ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(admin.createdAt)}</span>
                        </div>
                        {admin.lastLogin && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">Dernière connexion: {formatDate(admin.lastLogin)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(admin)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier l'administrateur"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleAdminStatus(admin.id, admin.statut)}
                          className={`p-2 ${admin.statut === "ACTIF" ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"} rounded-lg transition-colors`}
                          title={admin.statut === "ACTIF" ? "Désactiver l'administrateur" : "Activer l'administrateur"}
                        >
                          {admin.statut === "ACTIF" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'administrateur"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
          <div className="text-sm text-gray-600">
            Affichage de {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} à {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} sur {pagination.totalItems} administrateurs
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      page === pagination.currentPage
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              {pagination.totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      pagination.totalPages === pagination.currentPage
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
