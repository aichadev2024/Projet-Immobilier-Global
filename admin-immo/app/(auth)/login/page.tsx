"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import BrandMark from "@/components/vitrine/BrandMark";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Identifiants invalides");
      }

      const data = await res.json();

      // Si compte non activé, redirection vers validation OTP
      if (data.status === "PENDING_ACTIVATION") {
        router.push(`/validate-otp?username=${encodeURIComponent(username)}&type=${data.status}`);
        return;
      }

      // Si compte en attente de validation par l'admin
      if (data.status === "PENDING_VALIDATION") {
        // Stocker les tokens quand même pour permettre l'accès limité
        if (remember) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("role", data.role);
          localStorage.setItem("pendingValidation", "true");
        } else {
          sessionStorage.setItem("accessToken", data.accessToken);
          sessionStorage.setItem("refreshToken", data.refreshToken);
          sessionStorage.setItem("role", data.role);
          sessionStorage.setItem("pendingValidation", "true");
        }
        router.push("/pending-validation");
        return;
      }

      // Vérifier que les tokens sont présents
      if (!data.access_token) {
        throw new Error("Token non reçu du serveur");
      }

      const role = data.role;

      // 🔐 Stockage
      if (remember) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        localStorage.setItem("role", role);
      } else {
        sessionStorage.setItem("accessToken", data.access_token);
        sessionStorage.setItem("refreshToken", data.refresh_token);
        sessionStorage.setItem("role", role);
      }

      // 🔁 Redirection selon rôle
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "AGENCE" || role === "AGENT") {
        // AGENT et AGENCE vont vers le même espace
        router.push("/agence/dashboard");
      } else if (role === "UTILISATEUR") {
        router.push("/utilisateur/dashboard");
      } else {
        router.push("/client/dashboard"); // Fallback pour anciens rôles
      }

    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full max-w-md p-10 relative z-10 transition-all duration-500 hover:shadow-2xl">
        <div className="flex justify-center mb-8">
          <BrandMark variant="light" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Bon retour ! 👋
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed">
            Connectez-vous pour accéder à votre tableau de bord et reprendre là où vous vous étiez arrêté.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email ou nom d'utilisateur</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="votre@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Mot de passe</label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
              >
                Oublié ?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none font-medium text-lg leading-none tracking-[0.2em]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center text-sm pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-indigo-400 transition-colors overflow-hidden">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="peer w-full h-full opacity-0 cursor-pointer absolute"
                />
                <div className="absolute inset-0 bg-indigo-600 opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <span className="text-slate-600 font-medium select-none group-hover:text-slate-800 transition-colors">Se souvenir de moi</span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-semibold border border-rose-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-4 mt-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
          >
            {loading ? "Vérification..." : "Se connecter"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Nouveau sur la plateforme ?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-indigo-600 font-extrabold hover:text-indigo-800 transition-colors hover:underline"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}