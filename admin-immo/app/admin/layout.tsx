"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building,
  Home,
  Megaphone,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  User,
  Tag,
  Building2,
  Bell
} from "lucide-react";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  nomUtilisateur: string;
  role: string;
  telephone?: string;
  isSuperAdmin?: boolean;
  photoUrl?: string;
}

import NotificationBell from "@/components/NotificationBell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/admin/login', '/admin/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Ne pas vérifier l'authentification pour les routes publiques
    if (isPublicRoute) {
      setLoading(false);
      return;
    }
    // Ne charger le profil qu'une seule fois au montage (pas à chaque changement de page)
    // pour éviter les boucles infinies
    if (!user) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/utilisateurs/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Stocker pour usage hors ligne
        localStorage.setItem("user", JSON.stringify(userData));
      } else if (response.status === 401) {
        // Token invalide - déconnexion propre
        console.log("Session expirée, redirection vers login");
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      } else {
        console.error("Erreur lors du chargement du profil:", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion au backend:", error);
      // En cas d'erreur réseau, on essaie de charger depuis le localStorage
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/admin/tableau-de-bord",
      icon: LayoutDashboard,
      current: pathname === "/admin/tableau-de-bord"
    },
    {
      name: "Utilisateurs",
      href: "/admin/utilisateurs",
      icon: Users,
      current: pathname === "/admin/utilisateurs"
    },
    {
      name: "Agences",
      href: "/admin/agences",
      icon: Building,
      current: pathname === "/admin/agences"
    },
    {
      name: "Types de biens",
      href: "/admin/types-biens",
      icon: Tag,
      current: pathname === "/admin/types-biens"
    },
    {
      name: "Biens",
      href: "/admin/biens",
      icon: Building2,
      current: pathname === "/admin/biens"
    },
    {
      name: "Annonces",
      href: "/admin/annonces",
      icon: Megaphone,
      current: pathname === "/admin/annonces"
    },
    {
      name: "Admins",
      href: "/admin/admins",
      icon: Crown,
      current: pathname === "/admin/admins"
    },
    {
      name: "Profil",
      href: "/admin/profile",
      icon: User,
      current: pathname === "/admin/profile"
    },
    {
      name: "Statistiques",
      href: "/admin/statistiques",
      icon: BarChart3,
      current: pathname === "/admin/statistiques"
    },
    {
      name: "Paramètres",
      href: "/admin/parametres",
      icon: Settings,
      current: pathname === "/admin/parametres"
    }
  ];

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Pour les routes publiques (login/register), afficher sans le layout admin
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Utilisateur non connecté</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
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
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Panneau Admin</h2>
                <p className="text-xs text-slate-400 font-medium">Gestion Globale</p>
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
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Panneau Admin</h2>
              <p className="text-xs text-indigo-300/80 font-medium tracking-wide">BamakoHome</p>
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
                {/* Active Indicator Line */}
                {item.current && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}

                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ml-1 ${item.current ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Admin Widget Bottom */}
          <div className="p-4 m-4 rounded-2xl bg-slate-800/50 border border-white/5 flex-shrink-0 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                {user && user.prenom ? user.prenom.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {loading ? "..." : user ? `${user.prenom} ${user.nom}` : "Admin"}
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

              <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
                <Shield className="w-4 h-4 mr-2 text-slate-400" />
                <span>Espace Administration</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-900 capitalize flex items-center">
                  {navigation.find(n => n.current)?.name || "Tableau de bord"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100/50 shadow-sm">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                <span className="text-xs font-semibold tracking-wide">Système Actif</span>
              </div>

              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
