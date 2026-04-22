"use client";
import { API_BASE_URL, apiFetch } from "@/services/api";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Home,
  Megaphone,
  UserCheck,
  MessageSquare,
  Calendar,
  Star,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  ShieldCheck
} from "lucide-react";

import NotificationBell from "@/components/NotificationBell";

export default function AgenceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ nom: string; prenom: string; email: string; role: string; nomAgence?: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`${API_BASE_URL}/api/utilisateurs/me`);
        console.log("👤 User data received:", data);
        setUser(data);
        // Store user role for filtering navigation
        setUserRole(data.role || localStorage.getItem("role") || sessionStorage.getItem("role"));
      } catch (error: unknown) {
        // Handle 401 and other errors gracefully
        if (error instanceof Error && error.message.includes("401")) {
          // Token expired or invalid - clean redirect without console error
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          localStorage.removeItem("role");
          sessionStorage.removeItem("role");
          router.push("/login");
          return;
        }
        // Only log real errors, not auth redirects
        if (error instanceof Error && !error.message.includes("redirect")) {
          console.error("Erreur d'authentification:", error);
        }
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        sessionStorage.removeItem("role");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 [] = exécute une seule fois, pas de boucle

  // Filter navigation based on user role - AGENT cannot see Agents menu
  const allNavigation = [
    {
      name: "Tableau de bord",
      href: "/agence/tableau-de-bord",
      icon: BarChart3,
      current: pathname === "/agence/tableau-de-bord",
      allowedRoles: ["AGENCE", "AGENT"]
    },
    {
      name: "Profil agence",
      href: "/agence/profil",
      icon: Building2,
      current: pathname === "/agence/profil",
      allowedRoles: ["AGENCE", "AGENT"]
    },
    {
      name: "Agents",
      href: "/agence/agents",
      icon: Users,
      current: pathname === "/agence/agents",
      allowedRoles: ["AGENCE"] // Only AGENCE can see Agents
    },
    {
      name: "Vérifications",
      href: "/agence/verifications",
      icon: ShieldCheck,
      current: pathname === "/agence/verifications",
      allowedRoles: ["AGENCE"] // Only AGENCE can verify biens
    },
    {
      name: "Biens immobiliers",
      href: "/agence/biens",
      icon: Home,
      current: pathname === "/agence/biens"
    },
    {
      name: "Médias",
      href: "/agence/medias",
      icon: Image,
      current: pathname === "/agence/medias"
    },
    {
      name: "Annonces",
      href: "/agence/annonces",
      icon: Megaphone,
      current: pathname === "/agence/annonces"
    },
    {
      name: "Clients",
      href: "/agence/clients",
      icon: UserCheck,
      current: pathname === "/agence/clients"
    },
    {
      name: "Messages",
      href: "/agence/messages",
      icon: MessageSquare,
      current: pathname === "/agence/messages"
    },
    {
      name: "Rendez-vous",
      href: "/agence/rendez-vous",
      icon: Calendar,
      current: pathname === "/agence/rendez-vous"
    },
    {
      name: "Avis",
      href: "/agence/avis",
      icon: Star,
      current: pathname === "/agence/avis"
    },
    {
      name: "Statistiques",
      href: "/agence/statistiques",
      icon: BarChart3,
      current: pathname === "/agence/statistiques"
    },
    {
      name: "Notifications",
      href: "/agence/notifications",
      icon: Bell,
      current: pathname === "/agence/notifications"
    },
    {
      name: "Paramètres",
      href: "/agence/parametres",
      icon: Settings,
      current: pathname === "/agence/parametres"
    }
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => {
    // If no allowedRoles specified, show to everyone
    if (!item.allowedRoles) return true;
    // Check if current user role is allowed
    return item.allowedRoles.includes(userRole || "");
  });

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('role')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex flex-col w-[280px] bg-[#0F172A] shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} h-screen`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Espace Agence</h2>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                  {user?.nom ? `${user.prenom} ${user.nom}` : "Mon Agence"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${item.current
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.current ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
                {item.current && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[280px] lg:flex-col z-40">
        <div className="flex flex-col flex-grow bg-[#0F172A] border-r border-slate-800 shadow-2xl h-screen">
          <div className="flex items-center p-6 border-b border-white/5 flex-shrink-0">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Espace Agence</h2>
              <p className="text-xs text-indigo-300/80 font-medium truncate max-w-[180px]">
                {user?.nom ? `${user.prenom} ${user.nom}` : "Mon Agence"}
              </p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${item.current
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
              >
                {/* Ligne d'indication active */}
                {item.current && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}

                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ml-1 ${item.current ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Widget Bottom */}
          <div className="p-4 m-4 rounded-2xl bg-slate-800/50 border border-white/5 flex-shrink-0 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                {user && user.prenom ? user.prenom.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {loading ? "..." : user ? `${user.prenom} ${user.nom}` : "Agence"}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email || "Connecté"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[280px] min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Fil d'ariane dynamique simple */}
              <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                <span>Espace Agence</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-900 capitalize flex items-center">
                  {navigation.find(n => n.current)?.name || "Tableau de bord"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100/50 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-xs font-semibold tracking-wide">Ligne sécurisée</span>
              </div>

              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
