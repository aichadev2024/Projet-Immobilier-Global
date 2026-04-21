"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  photoProfil?: string;
  nomUtilisateur?: string;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // NE PAS vérifier l'auth sur les pages publiques (login, register, etc.)
    const publicPaths = ["/login", "/register", "/forgot-password", "/validate-otp", "/"];
    if (publicPaths.includes(pathname)) {
      setLoading(false);
      return;
    }

    // NE PAS appeler API si pas de token (évite 401 inutile)
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
      : null;
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setUser(null);
    // router.replace("/login"); // Removed this line
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
}