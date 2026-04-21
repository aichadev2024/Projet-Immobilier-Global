"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building,
  Home,
  Megaphone,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  DollarSign,
  Sparkles,
  Zap,
  Shield,
  Crown,
  BarChart3,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_BASE_URL } from "@/services/api";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: "success" | "warning" | "error";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      console.log("🔑 Token检查:", token ? "Token trouvé" : "Aucun token");
      console.log("🔑 Token length:", token?.length);
      console.log("🔑 Token start:", token?.substring(0, 20) + "...");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log(`📡 Appel API vers: ${API_BASE_URL}/api/admin/dashboard/stats`);
      
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("📡 Stats response status:", statsResponse.status, statsResponse.statusText);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log("📊 Stats reçues:", statsData); // Debug
        
        const formattedStats: StatCard[] = [
          {
            title: "Total utilisateurs",
            value: statsData.totalUtilisateurs || 0,
            change: statsData.usersGrowth || 0,
            icon: <Users className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total agences",
            value: statsData.agences || 0,
            change: statsData.agencesGrowth || 0,
            icon: <Building className="w-6 h-6" />,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Total biens",
            value: statsData.biensTotal || 0,
            change: statsData.biensGrowth || 0,
            icon: <Home className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Total annonces",
            value: 0, // Pas encore implémenté dans le backend
            change: 0,
            icon: <Megaphone className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];

        setStats(formattedStats);
      } else {
        const errorText = await statsResponse.text();
        console.error("❌ Erreur stats:", statsResponse.status, statsResponse.statusText, errorText);
        // Garder les données simulées en cas d'erreur
        const statsData: StatCard[] = [
          {
            title: "Total utilisateurs",
            value: 1247,
            change: 12,
            icon: <Users className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total agences",
            value: 45,
            change: 8,
            icon: <Building className="w-6 h-6" />,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Total biens",
            value: 892,
            change: 15,
            icon: <Home className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Total annonces",
            value: 1250,
            change: 23,
            icon: <Megaphone className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];

        setStats(statsData);
      }

      // Appel au backend pour les statistiques de validation (fallback si activity n'existe pas)
      const validationResponse = await fetch(`${API_BASE_URL}/api/admin/validation/statistiques`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        console.log("📈 Stats validation reçues:", validationData); // Debug
        // On peut utiliser ces données pour l'activité ou les stats
      } else {
        const errorText = await validationResponse.text();
        console.error("❌ Erreur validation stats:", validationResponse.status, validationResponse.statusText, errorText);
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      console.error("Détail de l'erreur:", error instanceof Error ? error.message : String(error)); // Debug détaillé
      
      // Données de fallback en cas d'erreur réseau
      const statsData: StatCard[] = [
        {
          title: "Total utilisateurs",
          value: 1247,
          change: 12,
          icon: <Users className="w-6 h-6" />,
          color: "text-blue-600",
          bgColor: "bg-blue-100"
        },
        {
          title: "Total agences",
          value: 45,
          change: 8,
          icon: <Building className="w-6 h-6" />,
          color: "text-green-600",
          bgColor: "bg-green-100"
        },
        {
          title: "Total biens",
          value: 892,
          change: 15,
          icon: <Home className="w-6 h-6" />,
          color: "text-purple-600",
          bgColor: "bg-purple-100"
        },
        {
          title: "Total annonces",
          value: 1250,
          change: 23,
          icon: <Megaphone className="w-6 h-6" />,
          color: "text-orange-600",
          bgColor: "bg-orange-100"
        }
      ];

      const activityData: RecentActivity[] = [
        {
          id: "1",
          user: "Jean Dupont",
          action: "Nouvelle inscription utilisateur",
          timestamp: "Il y a 5 minutes",
          type: "success"
        },
        {
          id: "2",
          user: "Agence Mali Immobilier",
          action: "Validation d'agence",
          timestamp: "Il y a 15 minutes",
          type: "success"
        },
        {
          id: "3",
          user: "Système",
          action: "Tentative de connexion échouée",
          timestamp: "Il y a 1 heure",
          type: "error"
        },
        {
          id: "4",
          user: "Marie Martin",
          action: "Nouveau bien publié",
          timestamp: "Il y a 2 heures",
          type: "success"
        },
        {
          id: "5",
          user: "Agence Bamako Homes",
          action: "Demande de validation",
          timestamp: "Il y a 3 heures",
          type: "warning"
        }
      ];

      setStats(statsData);
      setRecentActivity(activityData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total utilisateurs", value: stats[0]?.value || 0, change: stats[0]?.change || 0, icon: Users, color: "from-blue-500 to-blue-600", lightColor: "bg-blue-50" },
    { title: "Total agences", value: stats[1]?.value || 0, change: stats[1]?.change || 0, icon: Building, color: "from-emerald-500 to-emerald-600", lightColor: "bg-emerald-50" },
    { title: "Total biens", value: stats[2]?.value || 0, change: stats[2]?.change || 0, icon: Home, color: "from-violet-500 to-violet-600", lightColor: "bg-violet-50" },
    { title: "Total annonces", value: stats[3]?.value || 0, change: stats[3]?.change || 0, icon: Megaphone, color: "from-amber-500 to-orange-600", lightColor: "bg-orange-50" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section Admin */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-indigo-100 text-sm font-medium">Espace Administrateur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Tableau de <span className="text-yellow-300">bord</span>
            </h1>
            <p className="text-indigo-100 text-lg max-w-md">
              Vue d'ensemble et gestion complète de la plateforme IkaBayt
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Système actif</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistiques modernisées */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.change >= 0 ? 'bg-white/20' : 'bg-red-500/20'}`}>
                    {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span className="text-xs font-bold">{Math.abs(stat.change)}%</span>
                  </div>
                </div>
                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Graphique Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Évolution des inscriptions</h2>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-dashed border-indigo-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-indigo-500" />
                </div>
                <p className="text-slate-500 font-medium">Graphique en cours de développement</p>
                <p className="text-sm text-slate-400 mt-1">Données bientôt disponibles</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activité récente */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Activité récente</h2>
              </div>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Aucune activité récente</p>
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.type === "success" ? "bg-emerald-100" :
                      activity.type === "error" ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      {activity.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : activity.type === "error" ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{activity.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.user}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Actions rapides modernisées */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Actions rapides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/utilisateurs">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-100 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Utilisateurs</p>
                  <p className="text-xs text-slate-500">Gérer les comptes</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-500 transition-colors" />
              </motion.div>
            </Link>
            
            <Link href="/admin/agences">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-100 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Agences</p>
                  <p className="text-xs text-slate-500">Valider les agences</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-emerald-500 transition-colors" />
              </motion.div>
            </Link>
            
            <Link href="/admin/biens">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border border-violet-100 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-violet-500 rounded-xl text-white shadow-lg shadow-violet-500/30">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Biens</p>
                  <p className="text-xs text-slate-500">Gérer les annonces</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-violet-500 transition-colors" />
              </motion.div>
            </Link>
            
            <Link href="/admin/statistiques">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-100 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/30">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Statistiques</p>
                  <p className="text-xs text-slate-500">Voir les rapports</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-amber-500 transition-colors" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
