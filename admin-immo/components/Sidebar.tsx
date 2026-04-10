"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Layers,
  CheckCircle,
  Settings,
  LogOut,
  User
} from "lucide-react";

interface SidebarProps {
  user: any;
  logout: () => void;
}

export default function Sidebar({ user, logout }: SidebarProps) {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Types de biens", href: "/admin/types", icon: Layers },
    { name: "Validation des biens", href: "/admin/validation", icon: CheckCircle },
    { name: "Paramètres", href: "/admin/parametres", icon: Settings },
    { name: "Profil", href: "/admin/profil", icon: User },
  ];

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.05)] relative overflow-hidden z-20">
      {/* Effets décoratifs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="p-6 relative z-10">
        <div className="mb-12 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={160} height={160} className="drop-shadow-lg transform hover:scale-105 transition-transform duration-500" />
        </div>

        <nav className="space-y-3">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-900/30 translate-x-1"
                  : "hover:bg-white/10 text-blue-100 hover:text-white hover:translate-x-1"
                  }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-blue-300 group-hover:text-white transition-colors duration-300"} />
                <span className="text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-white/10 space-y-5 relative z-10 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors duration-300 cursor-pointer">
          <div className="relative">
            <Image
              src={
                user?.photoProfil
                  ? `http://localhost:8080/uploads/${user.photoProfil}`
                  : "/default-avatar.png"
              }
              alt="Avatar"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-indigo-400 shadow-md object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-indigo-300 font-medium truncate">Administrateur</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 py-3 rounded-2xl transition-all duration-300 font-medium group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}