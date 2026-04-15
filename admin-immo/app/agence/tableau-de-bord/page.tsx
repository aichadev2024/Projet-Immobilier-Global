"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Home,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Phone,
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { agenceDashboardAPI, AgenceDashboardStats, AgenceProperty, BienLoue } from "@/lib/api/agence-dashboard";

type DashboardStats = {
  totalBiens: number;
  biensPublies: number;
  biensVendus: number;
  biensLoues: number;
  totalAnnonces: number;
  annoncesActives: number;
  demandesVisites: number;
  visitesConfirmees: number;
  nouveauxClients: number;
  totalClients: number;
  messagesNonLus: number;
  noteMoyenne: number;
  revenusMensuels: number;
};

export default function AgenceDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBiens: 0,
    biensPublies: 0,
    biensVendus: 0,
    biensLoues: 0,
    totalAnnonces: 0,
    annoncesActives: 0,
    demandesVisites: 0,
    visitesConfirmees: 0,
    nouveauxClients: 0,
    totalClients: 0,
    messagesNonLus: 0,
    noteMoyenne: 0,
    revenusMensuels: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proprietes, setProprietes] = useState<AgenceProperty[]>([]);
  const [biensLoues, setBiensLoues] = useState<BienLoue[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les statistiques depuis le backend
        const backendStats = await agenceDashboardAPI.getStats();
        
        // Récupérer les propriétés et biens loués
        const [proprietesData, biensLouesData] = await Promise.all([
          agenceDashboardAPI.getProprietes(),
          agenceDashboardAPI.getBiensLoues()
        ]);

        setProprietes(proprietesData);
        setBiensLoues(biensLouesData);

        // Transformer les données du backend au format du frontend
        const transformedStats: DashboardStats = {
          totalBiens: backendStats.biensTotal,
          biensPublies: backendStats.biensDisponibles,
          biensVendus: backendStats.biensVendus,
          biensLoues: backendStats.biensLoues,
          totalAnnonces: backendStats.biensTotal, // Les biens = annonces
          annoncesActives: backendStats.biensDisponibles,
          demandesVisites: Math.floor(Math.random() * 10), // Simulé - à implémenter dans le backend
          visitesConfirmees: Math.floor(Math.random() * 8), // Simulé - à implémenter dans le backend
          nouveauxClients: Math.floor(Math.random() * 15), // Simulé - à implémenter dans le backend
          totalClients: Math.floor(Math.random() * 50) + 20, // Simulé - à implémenter dans le backend
          messagesNonLus: Math.floor(Math.random() * 5), // Simulé - à implémenter dans le backend
          noteMoyenne: 4.2 + Math.random() * 0.6, // Simulé - à implémenter dans le backend
          revenusMensuels: biensLouesData.reduce((sum, bien) => sum + bien.prix, 0) // Calcul réel depuis les biens loués
        };

        setStats(transformedStats);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Impossible de charger les données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const statCards = [
    {
      title: "Total biens",
      value: stats.totalBiens,
      icon: Home,
      color: "bg-blue-500",
      change: "+2 ce mois",
      changeType: "positive"
    },
    {
      title: "Biens publiés",
      value: stats.biensPublies,
      icon: Eye,
      color: "bg-green-500",
      change: "+15%",
      changeType: "positive"
    },
    {
      title: "Biens vendus",
      value: stats.biensVendus,
      icon: CheckCircle,
      color: "bg-purple-500",
      change: "+1 cette semaine",
      changeType: "positive"
    },
    {
      title: "Revenus mensuels",
      value: `${(stats.revenusMensuels / 1000000).toFixed(1)}M FCFA`,
      icon: DollarSign,
      color: "bg-yellow-500",
      change: "+18%",
      changeType: "positive"
    }
  ];

  const secondaryStats = [
    {
      title: "Demandes de visite",
      value: stats.demandesVisites,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Messages non lus",
      value: stats.messagesNonLus,
      icon: MessageSquare,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Nouveaux clients",
      value: stats.nouveauxClients,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Note moyenne",
      value: stats.noteMoyenne.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p className="mt-2 text-gray-600 text-lg">
          Vue d'ensemble de votre activité immobilière
        </p>
      </div>
      
      {/* Offre Spéciale - Bandeau Gratuité */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Version Spéciale Lancement 🎉</h2>
              <p className="text-emerald-50 text-sm font-medium">Bonne nouvelle ! Profitez d'une visibilité maximale 100% GRATUITE pour vos annonces.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">

          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
            <div className="relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides et graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actions rapides */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
          <div className="relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              Actions rapides
            </h2>
            <div className="space-y-3">
              {[
                { icon: Home, label: "Ajouter un bien", href: "/agence/biens/nouveau" },
                { icon: Users, label: "Gérer les agents", href: "/agence/agents" },
                { icon: MessageSquare, label: "Voir les messages", href: "/agence/messages" },
                { icon: Calendar, label: "Calendrier des visites", href: "/agence/rendez-vous" }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/50 transition-all duration-200 group/item border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover/item:bg-indigo-100 transition-colors">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </div>
                    <div className="text-gray-400 group-hover/item:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
          <div className="relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              Activité récente
            </h2>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, color: "green", title: "Nouveau bien vendu", desc: "Villa Bamako", time: "Il y a 2 heures" },
                { icon: MessageSquare, color: "blue", title: "Nouveau message client", desc: "Demande d'information", time: "Il y a 4 heures" },
                { icon: Calendar, color: "orange", title: "Visite programmée", desc: "Appartement Sogefi", time: "Demain 14h" },
                { icon: Star, color: "purple", title: "Nouvel avis client", desc: "5 étoiles", time: "Il y a 1 jour" }
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors">
                    <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performances */}
      <div className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
        <div className="relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              Performances ce mois
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Voir détails
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">85%</div>
              </div>
              <p className="text-lg font-semibold text-gray-700 mt-4">Taux de conversion</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-8 h-8 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'} transition-all duration-300 hover:scale-110`} />
                ))}
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">4.5</div>
              <p className="text-lg font-semibold text-gray-700 mt-4">Note moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">92%</div>
              <p className="text-lg font-semibold text-gray-700 mt-4">Satisfaction client</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
