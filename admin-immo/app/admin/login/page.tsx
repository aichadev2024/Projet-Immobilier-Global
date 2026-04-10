'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('Identifiants invalides');
      }

      const data = await res.json();

      // Vérifier que c'est bien un admin/super_admin
      const role = data.role;
      if (role !== 'ADMIN') {
        throw new Error('Accès réservé aux administrateurs');
      }

      // Si compte non activé, redirection vers validation OTP
      if (data.status === 'PENDING_ACTIVATION') {
        router.push(`/validate-otp?username=${encodeURIComponent(username)}&type=${data.status}`);
        return;
      }

      // Vérifier que les tokens sont présents
      if (!data.access_token) {
        throw new Error('Token non reçu du serveur');
      }

      // Stockage
      if (remember) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('role', role);
      } else {
        sessionStorage.setItem('accessToken', data.access_token);
        sessionStorage.setItem('refreshToken', data.refresh_token);
        sessionStorage.setItem('role', role);
      }

      // Redirection vers admin dashboard
      router.push('/admin/dashboard');

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20 mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Espace Admin
          </h1>
          <p className="text-slate-400 font-medium">
            Connexion réservée aux administrateurs
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email ou nom d&apos;utilisateur
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="admin@entreprise.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-slate-500 group-hover:border-purple-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="peer w-full h-full opacity-0 cursor-pointer absolute"
                  />
                  <div className="absolute inset-0 bg-purple-500 opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-slate-400 text-sm font-medium">Se souvenir de moi</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                'Connexion...'
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-3">
            <p className="text-center text-sm text-slate-400">
              Pas encore de compte ?{' '}
              <Link href="/admin/register" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                Créer un compte admin
              </Link>
            </p>
            <p className="text-center text-xs text-slate-500">
              <Link href="/login" className="hover:text-slate-400 transition-colors">
                ← Retour au site client
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Espace sécurisé - Accès réservé
        </p>
      </div>
    </div>
  );
}
