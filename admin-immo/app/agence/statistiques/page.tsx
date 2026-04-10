"use client";

import React from "react";
import {
    BarChart3, TrendingUp, Users, Home,
    ArrowUpRight, ArrowDownRight, DollarSign, Activity
} from "lucide-react";

export default function AgenceStatistiques() {
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/stats/agence", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des statistiques", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, []);

    const kpis = [
        {
            title: "Annonces Actives",
            value: stats ? stats.annoncesActives : "-",
            trend: "+12.5%",
            isPositive: true,
            icon: Home,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Nouveaux Contacts",
            value: stats ? stats.nouveauxClients : "-",
            trend: "+5.2%",
            isPositive: true,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Biens Vendus",
            value: stats ? stats.biensVendus : "-",
            trend: "-2.1%",
            isPositive: false,
            icon: DollarSign,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10"
        },
        {
            title: "Demandes Visite",
            value: stats ? stats.demandesVisite : "-",
            trend: "+1.2%",
            isPositive: true,
            icon: Activity,
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10"
        }
    ];

    const monthlyData = [
        { month: "Jan", sales: 45, visits: 80 },
        { month: "Fév", sales: 52, visits: 95 },
        { month: "Mar", sales: 38, visits: 70 },
        { month: "Avr", sales: 65, visits: 110 },
        { month: "Mai", sales: 48, visits: 85 },
        { month: "Juin", sales: 75, visits: 130 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        Performances Globale
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Suivez l'évolution de vos indicateurs clés sur les 6 derniers mois.</p>
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium">
                        <option>Cette année</option>
                        <option>L'année dernière</option>
                        <option>Les 30 derniers jours</option>
                    </select>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-medium">
                        Exporter
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${kpi.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                    }`}>
                                    {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                                <div className="text-sm font-medium text-slate-500">{kpi.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Évolution des Ventes vs Visites
                        </h2>
                    </div>

                    {/* Mock CSS Bar Chart */}
                    <div className="h-64 flex items-end gap-2 sm:gap-6 pt-4 border-b border-l border-slate-100 pl-4 pb-2 relative">
                        {/* Grid lines */}
                        <div className="absolute top-0 w-full border-t border-slate-50 border-dashed" />
                        <div className="absolute top-1/4 w-full border-t border-slate-50 border-dashed" />
                        <div className="absolute top-2/4 w-full border-t border-slate-50 border-dashed" />
                        <div className="absolute top-3/4 w-full border-t border-slate-50 border-dashed" />

                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 relative group">
                                <div className="w-full flex justify-center items-end gap-1 h-full z-10">
                                    {/* Visites Bar */}
                                    <div
                                        className="w-1/3 bg-indigo-100 rounded-t-sm group-hover:bg-indigo-200 transition-colors"
                                        style={{ height: `${(data.visits / 150) * 100}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap transition-opacity">
                                            {data.visits} Visites
                                        </div>
                                    </div>
                                    {/* Sales Bar */}
                                    <div
                                        className="w-1/3 bg-indigo-500 rounded-t-sm shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:bg-indigo-600 transition-colors"
                                        style={{ height: `${(data.sales / 150) * 100}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap transition-opacity">
                                            {data.sales} Ventes
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{data.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" /> Ventes Conclues
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <div className="w-3 h-3 rounded-full bg-indigo-100" /> Visites Agendées
                        </div>
                    </div>
                </div>

                {/* Top Agents */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Top Agents Mobiliers
                    </h2>
                    <div className="space-y-6">
                        {[
                            { name: "Amadou Traoré", sales: 24, revenue: "15M", avatar: "A" },
                            { name: "Fatoumata Diarra", sales: 18, revenue: "11.2M", avatar: "F" },
                            { name: "Ousmane Keita", sales: 12, revenue: "8.5M", avatar: "O" },
                            { name: "Sita Coulibaly", sales: 9, revenue: "5M", avatar: "S" },
                        ].map((agent, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-colors">
                                        {agent.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                                        <p className="text-xs text-slate-500">{agent.sales} ventes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-600">{agent.revenue}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors text-sm">
                        Voir tout le classement
                    </button>
                </div>
            </div>
        </div>
    );
}
