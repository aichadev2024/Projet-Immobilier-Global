"use client";
import { API_BASE_URL } from "@/services/api";


import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Building,
  Home,
  Eye,
  BarChart3,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  MapPin,
  Filter
} from "lucide-react";

interface Statistique {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Statistique[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodeFilter, setPeriodeFilter] = useState("30");

  useEffect(() => {
    fetchStatistiques();
  }, [periodeFilter]);

  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        console.error("❌ Aucun token trouvé");
        return;
      }

      console.log("📊 Récupération des statistiques détaillées depuis le backend...");
      
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const statsData = await response.json();
        console.log("📈 Statistiques reçues:", statsData);
        
        // Transformer les données du backend au format du frontend
        const formattedStats: Statistique[] = [
          {
            title: "Total utilisateurs",
            value: statsData.totalUtilisateurs || 0,
            change: 12, // Simulé - à calculer dans le backend
            icon: <Eye className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total agences",
            value: statsData.agences || 0,
            change: 8, // Simulé - à calculer dans le backend
            icon: <Building className="w-6 h-6" />,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Total biens",
            value: statsData.biensTotal || 0,
            change: 15, // Simulé - à calculer dans le backend
            icon: <Home className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Biens en attente",
            value: statsData.biensEnAttente || 0,
            change: -5, // Simulé - à calculer dans le backend
            icon: <Activity className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];

        setStats(formattedStats);
        
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur lors de la récupération des statistiques:", response.status, errorText);
        
        // En cas d'erreur, utiliser les données simulées
        const statsData: Statistique[] = [
          {
            title: "Total visites",
            value: "45.2K",
            change: 23,
            icon: <Eye className="w-6 h-6" />,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Biens publiés",
            value: 892,
            change: 15,
            icon: <Home className="w-6 h-6" />,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Taux conversion",
            value: "8.5%",
            change: -2,
            icon: <BarChart3 className="w-6 h-6" />,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Revenus générés",
            value: "2.3M FCFA",
            change: 18,
            icon: <TrendingUp className="w-6 h-6" />,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];
        
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des performances de la plateforme</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7">Derniers 7 jours</option>
            <option value="30">Derniers 30 jours</option>
            <option value="90">Derniers 3 mois</option>
            <option value="365">Dernière année</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.change >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder pour les sections futures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top biens consultés</h2>
          <p className="text-gray-500">Cette section sera connectée aux données réelles prochainement.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance des agences</h2>
          <p className="text-gray-500">Cette section sera connectée aux données réelles prochainement.</p>
        </div>
      </div>
    </div>
  );
}
